import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, actors, type, description, source, time } = req.body;

  // 验证必填字段
  if (!title || !actors || !type || !time) {
    return res.status(400).json({ error: 'Missing required fields: title, actors, type, time' });
  }

  // 确保 actors 是数组格式
  const actorsArray = Array.isArray(actors) ? actors : [actors];

  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{ title, actors: actorsArray, type, description, source, time }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message });
  }
}
