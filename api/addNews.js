import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // 设置 CORS 头 – 必须在所有响应中都设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // 直接结束，已经设置了 CORS 头
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, source, published_at, content } = req.body;

  // 必填字段验证
  if (!title || !source || !published_at) {
    return res.status(400).json({ error: 'Missing required fields: title, source, published_at' });
  }

  // 处理可能为空的内容和日期格式
  const safeContent = content || '';
  let safeDate;
  try {
    safeDate = new Date(published_at).toISOString();
  } catch (e) {
    safeDate = new Date().toISOString();
  }

  try {
    const { data, error } = await supabase
      .from('news')
      .insert([{ 
        title, 
        source, 
        published_at: safeDate, 
        content: safeContent 
      }])
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
