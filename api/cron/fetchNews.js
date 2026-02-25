import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const parser = new Parser();

// 您希望抓取的 RSS 源列表（可以在此添加或通过环境变量配置）
const RSS_FEEDS = [
  { name: 'NPR 世界新闻', url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'CNN 世界新闻', url: 'http://rss.cnn.com/rss/edition_world.rss' },
  { name: '中国日报', url: 'https://www.chinadaily.com.cn/rss/world_rss.xml' },
  // 可以继续添加更多
];

export default async function handler(req, res) {
  // 仅允许 GET 请求（Vercel Cron 默认发送 GET）
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let totalNew = 0;
  const errors = [];

  for (const feed of RSS_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      for (const item of feedData.items.slice(0, 10)) { // 每个源取前10条
        // 检查是否已存在（根据标题去重）
        const { data: existing } = await supabase
          .from('news')
          .select('id')
          .eq('title', item.title)
          .maybeSingle();

        if (existing) continue; // 已存在则跳过

        // 构建新闻对象
        const newsItem = {
          title: item.title,
          source: feed.name,
          published_at: item.isoDate || item.pubDate || new Date().toISOString(),
          content: item.contentSnippet || item.content || ''
        };

        // 存入数据库
        const { error } = await supabase
          .from('news')
          .insert([newsItem]);

        if (error) {
          console.error('插入失败:', error, '新闻:', newsItem.title);
          errors.push({ title: newsItem.title, error: error.message });
        } else {
          totalNew++;
        }
      }
    } catch (e) {
      console.error(`抓取失败 ${feed.url}:`, e);
      errors.push({ feed: feed.name, error: e.message });
    }
  }

  res.status(200).json({ 
    message: `抓取完成，新增 ${totalNew} 条新闻`, 
    errors 
  });
}
