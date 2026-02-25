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

  const { event_id, paradigm, reason } = req.body;

  // 验证必填字段
  if (!event_id || !paradigm) {
    return res.status(400).json({ error: 'Missing required fields: event_id, paradigm' });
  }

  // 可选：检查 paradigm 值是否合法
  const validParadigms = ['win_win', 'zero_sum', 'unclear'];
  if (!validParadigms.includes(paradigm)) {
    return res.status(400).json({ error: 'Invalid paradigm value' });
  }

  try {
    const { data, error } = await supabase
      .from('paradigms')
      .insert([{ event_id, paradigm, reason }])
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
