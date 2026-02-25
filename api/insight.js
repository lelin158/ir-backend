export default async function handler(req, res) {
  const { prompt } = req.body;
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  const data = await response.json();
  res.status(200).json({ answer: data.choices[0].message.content });
}
