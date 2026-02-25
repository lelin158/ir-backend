import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { title, source, published_at, content } = req.body;

    const { data, error } = await supabase
      .from('news')
      .insert([{ title, source, published_at, content }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
  } else {
    // 如果不是 POST 请求，返回 405
    res.status(405).json({ error: 'Method not allowed' });
  }
}
