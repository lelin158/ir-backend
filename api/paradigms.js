import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('paradigms')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return res.status(500).json(error);
    res.status(200).json(data);
  }
}
