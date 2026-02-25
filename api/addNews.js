import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, source, published_at, content } = req.body;

  // 简单验证
  if (!title || !source || !published_at) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 插入新闻数据（content 可为空）
  const { data, error } = await supabase
    .from('news')
    .insert([{ title, source, published_at, content }])
    .select();

  if (error) {
    console.error('Insert error:', error);
    return res.status(500).json(error);
  }

  res.status(200).json(data);
}
