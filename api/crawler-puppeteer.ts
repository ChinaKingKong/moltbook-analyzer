/**
 * Moltbook 爬虫 - 参照 moltbook-spider 设计文档
 * 目标: 爬取 moltbook.com 热门帖子 + Submolts，使用 headless browser 渲染 SPA
 * 流程: 1) 访问首页 / 等待帖子列表 2) 滚动触发懒加载 3) 提取 hot_posts 4) 可选访问 /m 提取 submolts
 * 技术: page.wait_for_selector + page.evaluate，请求间隔 1–2s 避免限流
 */

import type { Page } from 'puppeteer-core';

export interface MoltbookPost {
  id: string;
  title: string;
  content: string;
  author: string;
  votes: number;
  comments: number;
  createdAt: string;
  url: string;
  /** 所属版块，对应设计文档 submolt */
  submolt?: string;
}

export interface MoltbookSubmolt {
  name: string;
  description: string;
  member_count: number;
}

export interface MoltbookTopic {
  id: string;
  title: string;
  heat: number;
  heatDisplay: string;
  description: string;
  solution: string;
  verified: string;
  posts: string[];
  url: string;
}

const MOLTBOOK_BASE = 'https://www.moltbook.com';
const WAIT_AFTER_NAV = 6000;
const WAIT_AFTER_TOP_CLICK = 2500;
const REQUEST_DELAY_MS = 1500;
const POST_LINK_SELECTORS = ['a[href*="/post/"]', 'a[href*="post/"]', '[href*="/post/"]'];
const AUTHOR_REGEX = /u\/(\w+)/;
const SUBMOLT_REGEX = /m\/(\w+)/;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 从首页/帖子列表页提取热门帖子（设计文档: title, author, submolt, upvotes, comments_count, post_url）
 */
async function extractHotPostsFromPage(page: Page): Promise<RawPostCard[]> {
  const seen = new Set<string>();
  const results: RawPostCard[] = [];

  for (const selector of POST_LINK_SELECTORS) {
    const batch = await page.evaluate(
      (sel: string) => {
        const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(sel));
        return links.map((a) => {
          const href = a.href || a.getAttribute('href') || '';
          const match = href.match(/\/post\/([a-f0-9-]{36})/i);
          if (!match) return null;
          const id = match[1];
          const title = (a.textContent || '').trim().slice(0, 300) || 'Untitled';
          let cardText = '';
          let el: HTMLElement | null = a;
          for (let i = 0; i < 6 && el; i++) {
            el = el.parentElement;
            if (el) {
              const t = (el.textContent || '').trim();
              if (t.length > cardText.length && t.length < 4000) cardText = t;
            }
          }
          const fullHref = href.startsWith('http') ? href : `https://www.moltbook.com${href.startsWith('/') ? '' : '/'}${href}`;
          return { id, href: fullHref, title, cardText };
        });
      },
      selector
    );

    for (const p of batch) {
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        results.push(p);
      }
    }
  }

  return results;
}

interface RawPostCard {
  id: string;
  href: string;
  title: string;
  cardText: string;
}

function parseSubmolt(cardText: string): string | undefined {
  const m = cardText.match(SUBMOLT_REGEX);
  return m ? `m/${m[1]}` : undefined;
}

function parseVotesAndComments(cardText: string): { votes: number; comments: number } {
  let votes = 0;
  let comments = 0;
  const voteMatch = cardText.match(/(\d+)\s*(?:⬆|upvote|vote)/i) || cardText.match(/^(\d+)\s*$/m);
  if (voteMatch) votes = parseInt(voteMatch[1], 10) || 0;
  const commentMatch = cardText.match(/(\d+)\s*comment/i) || cardText.match(/💬\s*(\d+)/);
  if (commentMatch) comments = parseInt(commentMatch[1], 10) || 0;
  return { votes, comments };
}

function parseAuthor(cardText: string): string {
  const m = cardText.match(AUTHOR_REGEX);
  return m ? `u/${m[1]}` : 'Unknown';
}

/**
 * Spam 过滤（仅硬过滤：加密货币、无意义内容）
 */
function isSpam(post: MoltbookPost): boolean {
  const text = (post.title + ' ' + post.content).toLowerCase();
  if (/0x[a-f0-9]{40}/i.test(text)) return true;
  if (/send\s+(eth|btc|usdt|token)/i.test(text)) return true;
  if (/airdrop|double your crypto|guaranteed returns/i.test(text)) return true;
  if (/^(?:[\u{1F300}-\u{1F9FF}]\s*){10,}$/u.test((post.title + post.content).replace(/\s/g, ''))) return true;
  const wordRepeat = (post.title.match(/(\b\w+\b)(?:\s+\1){8,}/i) || []).length;
  if (wordRepeat > 0) return true;
  return false;
}

/**
 * 点击 Top 标签（🔥 Top）
 */
async function clickTopTab(page: Page): Promise<boolean> {
  try {
    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
      const top = all.find((el) => {
        const t = (el.textContent || '').trim();
        return t === 'Top' || t.includes('Top') || t.includes('🔥');
      });
      if (top && top instanceof HTMLElement) {
        top.click();
        return true;
      }
      return false;
    });
    if (clicked) await new Promise((r) => setTimeout(r, WAIT_AFTER_TOP_CLICK));
    return clicked;
  } catch {
    return false;
  }
}

/**
 * 将原始卡片转为 MoltbookPost（设计文档: post_id, title, author_username, submolt, upvotes, comments_count, post_url），并做 spam 过滤
 */
function toPosts(raw: RawPostCard[]): MoltbookPost[] {
  const posts: MoltbookPost[] = [];
  for (const r of raw) {
    const { votes, comments } = parseVotesAndComments(r.cardText);
    const author = parseAuthor(r.cardText);
    const url = r.href.startsWith('http') ? r.href : `${MOLTBOOK_BASE}/post/${r.id}`;
    const submolt = parseSubmolt(r.cardText);
    const post: MoltbookPost = {
      id: r.id,
      title: r.title || 'Untitled',
      content: '',
      author,
      votes,
      comments,
      createdAt: '',
      url,
      submolt
    };
    if (!isSpam(post)) posts.push(post);
  }
  return posts;
}

/**
 * 爬取 Submolts 页面 /m，提取版块列表（设计文档: name, description, member_count）
 */
async function crawlSubmolts(page: Page): Promise<MoltbookSubmolt[]> {
  try {
    await page.goto(`${MOLTBOOK_BASE}/m`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(REQUEST_DELAY_MS);

    const list = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/m/"]'));
      const seen = new Set<string>();
      return links
        .map((a) => {
          const href = a.href || a.getAttribute('href') || '';
          const match = href.match(/\/m\/([^/?]+)/);
          if (!match || seen.has(match[1])) return null;
          seen.add(match[1]);
          const name = `m/${match[1]}`;
          let description = '';
          let memberCount = 0;
          let el: HTMLElement | null = a;
          for (let i = 0; i < 5 && el; i++) {
            el = el.parentElement;
            if (el) {
              const t = (el.textContent || '').trim();
              if (t.length > description.length && t.length < 1000) description = t;
              const numMatch = t.match(/(\d+)\s*(?:members?|成员)/i);
              if (numMatch) memberCount = parseInt(numMatch[1], 10) || 0;
            }
          }
          return { name, description: description.slice(0, 200), member_count: memberCount };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);
    });

    return list;
  } catch (e) {
    console.warn('Submolts crawl failed:', e);
    return [];
  }
}

/**
 * 分析帖子内容，提取主题（关键词到主题映射，参照 Skill 话题聚类）
 */
function analyzePostContent(posts: MoltbookPost[]): MoltbookTopic[] {
  const keywordTopics: Record<string, Partial<MoltbookTopic> & { id: string }> = {
    git: {
      id: 'gitCollaboration',
      title: 'Git Collaboration and Version Control for Agents',
      description: 'Multiple agents working in the same codebase',
      solution: 'Git Worktrees + Branch Protection',
      verified: '✅ Best Practice',
      heat: 90,
      heatDisplay: '90%'
    },
    memory: {
      id: 'memorySystem',
      title: 'AI Memory Systems and Context Persistence',
      description: 'How to maintain memory across agent sessions',
      solution: 'Vector Database + RAG',
      verified: '✅ Widely Used',
      heat: 95,
      heatDisplay: '95%'
    },
    cost: {
      id: 'costOptimization',
      title: 'API Cost Optimization Strategies',
      description: 'Reducing LLM API costs while maintaining quality',
      solution: 'Caching + Local Models',
      verified: '✅ Proven',
      heat: 85,
      heatDisplay: '85%'
    },
    autonomous: {
      id: 'autonomy',
      title: 'Autonomous Agent Operations',
      description: 'Agents working without human intervention',
      solution: 'Night Shift Mode',
      verified: '⚠️ Experimental',
      heat: 80,
      heatDisplay: '80%'
    },
    collaborate: {
      id: 'collaboration',
      title: 'Agent Collaboration and Trust',
      description: 'How agents coordinate without centralized platforms',
      solution: 'Smart Contract Coordination Pool',
      verified: '⚠️ Exploring',
      heat: 75,
      heatDisplay: '75%'
    },
    context: {
      id: 'contextWindow',
      title: 'Context Window and Long-term Memory',
      description: 'Fitting more information into limited context',
      solution: 'Hierarchical Context Compression',
      verified: '✅ Best Practice',
      heat: 82,
      heatDisplay: '82%'
    }
  };

  const foundTopics: Record<string, MoltbookTopic & { postIds: string[] }> = {};

  posts.forEach((post) => {
    const content = (post.title + ' ' + post.content).toLowerCase();
    Object.entries(keywordTopics).forEach(([keyword, topic]) => {
      if (content.includes(keyword)) {
        if (!foundTopics[topic.id]) {
          foundTopics[topic.id] = {
            ...topic,
            posts: [],
            postIds: []
          } as MoltbookTopic & { postIds: string[] };
        }
        if (!foundTopics[topic.id].postIds.includes(post.id)) {
          foundTopics[topic.id].postIds.push(post.id);
          foundTopics[topic.id].posts.push(post.id);
        }
      }
    });
  });

  return Object.values(foundTopics).map((t) => ({
    ...t,
    url: t.posts[0] ? `${MOLTBOOK_BASE}/post/${t.posts[0]}` : MOLTBOOK_BASE,
    posts: t.posts.slice(0, 3)
  }));
}

/**
 * 从 HTML 中解析 __NEXT_DATA__（Next.js 内嵌数据），尝试提取帖子列表
 */
function parseNextDataPosts(html: string): MoltbookPost[] | null {
  try {
    const match = html.match(/<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/i);
    if (!match) return null;
    const data = JSON.parse(match[1]) as Record<string, unknown>;
    const props = (data.props as Record<string, unknown>)?.pageProps as Record<string, unknown> | undefined;
    if (!props) return null;
    // 常见字段名：posts, feed, listings, initialPosts
    const rawPosts = (props.posts ?? props.feed ?? props.listings ?? props.initialPosts) as unknown[] | undefined;
    if (!Array.isArray(rawPosts) || rawPosts.length === 0) return null;
    const posts: MoltbookPost[] = [];
    for (const p of rawPosts.slice(0, 50)) {
      const row = p as Record<string, unknown>;
      const id = (row.id ?? row.postId ?? row.uuid) as string | undefined;
      if (!id || typeof id !== 'string') continue;
      const title = String(row.title ?? row.name ?? '').trim() || 'Post';
      const author = row.author ? String((row.author as Record<string, unknown>)?.username ?? row.author) : 'Unknown';
      const authorStr = typeof author === 'string' && author !== 'Unknown' ? `u/${author}` : 'Unknown';
      const votes = typeof row.votes === 'number' ? row.votes : typeof row.upvotes === 'number' ? row.upvotes : 0;
      const comments = typeof row.commentsCount === 'number' ? row.commentsCount : typeof row.comments === 'number' ? row.comments : 0;
      const submolt = row.submolt ? String(row.submolt) : undefined;
      posts.push({
        id,
        title: title.slice(0, 300),
        content: '',
        author: authorStr,
        votes,
        comments,
        createdAt: '',
        url: `${MOLTBOOK_BASE}/post/${id}`,
        submolt
      });
    }
    return posts.length > 0 ? posts : null;
  } catch {
    return null;
  }
}

/**
 * 用 cheerio 从 HTML 提取帖子卡片：链接 /post/xxx、标题、作者 u/xxx、版块 m/xxx、投票/评论
 */
async function extractPostsWithCheerio(html: string): Promise<MoltbookPost[]> {
  const posts: MoltbookPost[] = [];
  const seen = new Set<string>();
  try {
    const cheerio = (await import('cheerio')).default;
    const $ = cheerio.load(html);
    $('a[href*="/post/"]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href') || '';
      const idMatch = href.match(/\/post\/([a-f0-9-]{36})/i);
      if (!idMatch) return;
      const id = idMatch[1];
      if (seen.has(id)) return;
      seen.add(id);
      const title = $a.text().trim().slice(0, 300) || 'Post';
      let cardText = title;
      let parent = $a.parent();
      for (let i = 0; i < 8 && parent.length; i++) {
        const t = parent.text().trim();
        if (t.length > cardText.length && t.length < 4000) cardText = t;
        parent = parent.parent();
      }
      const author = parseAuthor(cardText);
      const submolt = parseSubmolt(cardText);
      const { votes, comments } = parseVotesAndComments(cardText);
      const url = href.startsWith('http') ? href : `${MOLTBOOK_BASE}${href.startsWith('/') ? '' : '/'}${href}`;
      posts.push({
        id,
        title: title || 'Post',
        content: '',
        author: author === 'u/undefined' ? 'Unknown' : author,
        votes,
        comments,
        createdAt: '',
        url,
        submolt
      });
    });
  } catch (e) {
    console.warn('Cheerio extract failed:', e);
  }
  return posts;
}

/**
 * 从 HTML 文本中提取 Submolts（m/xxx • N members）
 */
function extractSubmoltsFromHtml(html: string): MoltbookSubmolt[] {
  const list: MoltbookSubmolt[] = [];
  const seen = new Set<string>();
  // m/showandtell • 111 members 或 链接 /m/xxx 附近有 members
  const memberMatch = html.matchAll(/m\/(\w+)[\s\S]*?(\d+)\s*members?/gi);
  for (const m of memberMatch) {
    const name = `m/${m[1]}`;
    if (seen.has(name)) continue;
    seen.add(name);
    list.push({ name, description: '', member_count: parseInt(m[2], 10) || 0 });
  }
  if (list.length > 0) return list;
  const linkMatch = html.matchAll(/href="[^"]*\/m\/(\w+)[^"]*"/gi);
  for (const m of linkMatch) {
    const name = `m/${m[1]}`;
    if (seen.has(name)) continue;
    seen.add(name);
    list.push({ name, description: '', member_count: 0 });
  }
  return list;
}

/**
 * 回退：参照 webReader 流程 — 访问首页获取内容，解析 __NEXT_DATA__ + cheerio 提取帖子/版块
 */
async function fetchPostsFromHtml(): Promise<{ success: boolean; topics?: MoltbookTopic[]; posts?: MoltbookPost[]; submolts?: MoltbookSubmolt[]; error?: string }> {
  try {
    const axios = (await import('axios')).default;
    const { data: html } = await axios.get<string>(MOLTBOOK_BASE, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout: 15000
    });

    // 1) 优先 __NEXT_DATA__
    let posts = parseNextDataPosts(html);
    if (posts && posts.length > 0) {
      const submolts = extractSubmoltsFromHtml(html);
      const topics = analyzePostContent(posts);
      console.log(`✅ Fallback HTML (__NEXT_DATA__): ${posts.length} posts, ${topics.length} topics, ${submolts.length} submolts`);
      return { success: true, topics, posts, submolts: submolts.length > 0 ? submolts : undefined };
    }

    // 2) cheerio 解析链接与周围文本
    posts = await extractPostsWithCheerio(html);
    if (posts.length > 0) {
      const submolts = extractSubmoltsFromHtml(html);
      const topics = analyzePostContent(posts);
      console.log(`✅ Fallback HTML (cheerio): ${posts.length} posts, ${topics.length} topics, ${submolts.length} submolts`);
      return { success: true, topics, posts, submolts: submolts.length > 0 ? submolts : undefined };
    }

    // 3) 仅正则拿 post id，保留原逻辑
    const postIdMatches = html.matchAll(/\/post\/([a-f0-9-]{36})/gi);
    const byId = new Map<string, string>();
    for (const m of postIdMatches) byId.set(m[1].toLowerCase(), m[1]);
    if (byId.size === 0) return { success: false, error: 'No post IDs in HTML' };

    const fallbackPosts: MoltbookPost[] = Array.from(byId.entries()).slice(0, 30).map(([id, rawId]) => ({
      id: rawId,
      title: 'Post',
      content: '',
      author: 'Unknown',
      votes: 0,
      comments: 0,
      createdAt: '',
      url: `${MOLTBOOK_BASE}/post/${rawId}`
    }));
    const submolts = extractSubmoltsFromHtml(html);
    const topics = analyzePostContent(fallbackPosts);
    console.log(`✅ Fallback HTML (regex only): ${fallbackPosts.length} posts, ${topics.length} topics`);
    return { success: true, topics, posts: fallbackPosts, submolts: submolts.length > 0 ? submolts : undefined };
  } catch (e) {
    console.warn('Fallback HTML fetch failed:', e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * 主爬取入口 - 按 moltbook-spider 设计文档流程
 * 1. 启动浏览器 (headless, 禁用图片)
 * 2. 爬取热门帖子: 访问 / → wait_for_selector → 滚动触发懒加载 → 提取 hot_posts
 * 3. 可选: 访问 /m → 提取 submolts（请求间隔 1–2s）
 */
export async function crawlMoltbookData(): Promise<{
  success: boolean;
  topics?: MoltbookTopic[];
  posts?: MoltbookPost[];
  submolts?: MoltbookSubmolt[];
  error?: string;
}> {
  // Vercel 等 serverless 环境缺少 Chromium 系统库（libnss3 等），无法启动 Puppeteer，直接走 HTTP 回退
  if (process.env.VERCEL === '1') {
    console.log('🦞 Vercel env: using HTML fallback (no Puppeteer)');
    return fetchPostsFromHtml();
  }

  let browser: Awaited<ReturnType<typeof import('puppeteer-core').launch>> | null = null;

  try {
    console.log('🦞 Starting Moltbook crawl (moltbook-spider flow)...');

    const chromium = await import('@sparticuz/chromium');
    const puppeteer = await import('puppeteer-core');

    const executablePath = await chromium.default.executablePath();
    browser = await puppeteer.default.launch({
      executablePath,
      args: chromium.default.args,
      headless: true,
      ...({ ignoreHTTPSErrors: true } as Record<string, unknown>)
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });
    await page.setRequestInterception(true).catch(() => {});
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'media') req.abort().catch(() => {});
      else req.continue().catch(() => {});
    });

    await page.goto(MOLTBOOK_BASE, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await delay(WAIT_AFTER_NAV);

    const hasPostLink = await page.waitForSelector(POST_LINK_SELECTORS[0], { timeout: 20000 }).catch(() => null);
    if (!hasPostLink) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(2000);
    }

    const newRaw = await extractHotPostsFromPage(page);
    console.log(`✅ Home feed: ${newRaw.length} raw cards`);

    const topClicked = await clickTopTab(page);
    let topRaw: RawPostCard[] = [];
    if (topClicked) {
      await delay(500);
      topRaw = await extractHotPostsFromPage(page);
      console.log(`✅ Top feed: ${topRaw.length} raw cards`);
    }

    const byId = new Map<string, RawPostCard>();
    for (const r of newRaw) byId.set(r.id, r);
    for (const r of topRaw) byId.set(r.id, r);
    const mergedRaw = Array.from(byId.values());

    let posts = toPosts(mergedRaw);
    if (posts.length === 0 && mergedRaw.length > 0) {
      console.log('⚠️ All posts filtered by spam, including low-confidence');
      posts = mergedRaw.map((r) => {
        const { votes, comments } = parseVotesAndComments(r.cardText);
        const url = r.href.startsWith('http') ? r.href : `${MOLTBOOK_BASE}/post/${r.id}`;
        return {
          id: r.id,
          title: r.title || 'Untitled',
          content: '',
          author: parseAuthor(r.cardText),
          votes,
          comments,
          createdAt: '',
          url
        };
      });
    }
    const deduped = Array.from(new Map(posts.map((p) => [p.id, p])).values());

    if (deduped.length === 0) {
      console.log('⚠️ No post links found on page');
      return { success: false, error: 'No posts found after crawl' };
    }

    console.log(`✅ Merged & filtered: ${deduped.length} posts`);

    const topics = analyzePostContent(deduped);
    console.log(`✅ Extracted ${topics.length} topics`);

    await delay(REQUEST_DELAY_MS);
    const submolts = await crawlSubmolts(page);
    if (submolts.length > 0) console.log(`✅ Submolts: ${submolts.length} boards`);

    await browser.close();
    browser = null;

    return { success: true, topics, posts: deduped, submolts };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Puppeteer crawl error:', err);
    if (browser) await browser.close().catch(() => {});
    const fallback = await fetchPostsFromHtml();
    if (fallback.success) return fallback;
    return { success: false, error: msg };
  }
}

/**
 * 生成完整的模拟数据（fallback 用）
 */
export function generateFullMockData(): MoltbookTopic[] {
  return [
    {
      id: 'parallelCollaboration',
      title: 'Code Conflicts in Multi-Agent Parallel Collaboration',
      heat: 100,
      heatDisplay: '100%',
      description: 'Multiple AI agents editing the same repository causes merge hell',
      solution: 'Git Worktree Pattern',
      verified: '✅ Highly Recognized',
      posts: ['dbddcf23-7314-4213-a5f2-f90600686685'],
      url: 'https://www.moltbook.com/post/dbddcf23-7314-4213-a5f2-f90600686685'
    },
    {
      id: 'memorySystem',
      title: 'Scalability and Semantic Search of AI Memory Systems',
      heat: 95,
      heatDisplay: '95%',
      description: "MEMORY.md files don't scale and can't search semantically",
      solution: 'Database-first + Vector Search',
      verified: '✅ Strongly Recommended',
      posts: ['a1b2c3d4-5678-90ab-cdef-1234567890ab'],
      url: 'https://www.moltbook.com/post/a1b2c3d4-5678-90ab-cdef-1234567890ab'
    },
    {
      id: 'branchingConversations',
      title: 'Branching Structure of AI Conversations',
      heat: 90,
      heatDisplay: '90%',
      description: 'AI chats are single-threaded, follow-up questions pollute context',
      solution: 'Conversation Tree Structure',
      verified: '✅ Widely Recognized',
      posts: ['fedcba09-8765-4321-abcd-ef1234567890'],
      url: 'https://www.moltbook.com/post/fedcba09-8765-4321-abcd-ef1234567890'
    },
    {
      id: 'agentCoordination',
      title: 'Autonomous Coordination and Trust Between Agents',
      heat: 85,
      heatDisplay: '85%',
      description: 'How can agents coordinate without centralized platforms?',
      solution: 'Smart Contract Coordination Pool',
      verified: '⚠️ Exploring',
      posts: ['12345678-1234-1234-1234-123456789012'],
      url: 'https://www.moltbook.com/post/12345678-1234-1234-1234-123456789012'
    }
  ];
}
