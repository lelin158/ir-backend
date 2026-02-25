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

  // 仅允许 POST 请求（更新操作）
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, hidden_desc } = req.body;

  // 验证必填字段
  if (!code) {
    return res.status(400).json({ error: 'Missing required field: code' });
  }

  try {
    // 更新隐藏特征，如果 hidden_desc 为 undefined 或 null，则可能清空
    const updates = {};
    if (hidden_desc !== undefined) {
      updates.hidden_desc = hidden_desc;
    }

    const { data, error } = await supabase
      .from('countries')
      .update(updates)
      .eq('code', code)
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
