/**
 * 测试爬虫功能
 *
 * 运行方式：
 * npm run test:crawler
 * 或者
 * npx tsx scripts/test-crawler.ts
 */

import { crawlMoltbookData, generateFullMockData } from '../api/crawler-puppeteer';

async function testCrawler() {
  console.log('🦞 测试 Moltbook 爬虫...\n');

  // 1. 测试真实爬取
  console.log('1️⃣  测试真实爬取...');
  const crawlResult = await crawlMoltbookData();

  if (crawlResult.success) {
    console.log('✅ 爬取成功!');
    console.log(`   - 找到 ${crawlResult.posts?.length || 0} 个帖子`);
    console.log(`   - 提取 ${crawlResult.topics?.length || 0} 个主题`);

    if (crawlResult.topics && crawlResult.topics.length > 0) {
      console.log('\n📊 示例主题:');
      crawlResult.topics.slice(0, 3).forEach((topic, i) => {
        console.log(`   ${i + 1}. ${topic.title}`);
        console.log(`      🔥 热度: ${topic.heatDisplay}`);
        console.log(`      🔗 链接: ${topic.url}`);
      });
    }
  } else {
    console.log('❌ 爬取失败:', crawlResult.error);
    console.log('   这可能是因为：');
    console.log('   - Moltbook API 需要 authentication');
    console.log('   - API endpoint 已更改');
    console.log('   - 网络连接问题');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // 2. 测试模拟数据生成
  console.log('2️⃣  测试模拟数据生成...');
  const mockData = generateFullMockData();

  console.log('✅ 模拟数据生成成功!');
  console.log(`   - 生成了 ${mockData.length} 个主题`);
  console.log('\n📊 示例模拟数据:');

  mockData.forEach((topic, i) => {
    console.log(`   ${i + 1}. ${topic.title}`);
    console.log(`      🔥 热度: ${topic.heatDisplay}`);
    console.log(`      ✅ 验证状态: ${topic.verified}`);
    console.log(`      🔗 链接: ${topic.url}`);
    console.log('');
  });

  console.log('='.repeat(60));
  console.log('\n✨ 测试完成!\n');

  console.log('💡 下一步:');
  console.log('   1. 如果真实爬取成功，可以使用真实数据');
  console.log('   2. 如果真实爬取失败，系统会自动使用模拟数据');
  console.log('   3. 要使用真实数据，需要分析 Moltbook 的实际 API');
}

// 运行测试
testCrawler().catch(console.error);
