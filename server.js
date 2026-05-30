require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('./'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ Missing BOT_TOKEN or CHAT_ID in .env file');
  process.exit(1);
}

// Secure endpoint to send Telegram messages
app.post('/api/notify', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.length === 0) {
      return res.status(400).json({ ok: false, error: 'Invalid message' });
    }
    
    // Rate limiting (basic)
    if (message.length > 1000) {
      return res.status(400).json({ ok: false, error: 'Message too long' });
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      res.json({ ok: true });
    } else {
      res.status(500).json({ ok: false, error: data.description });
    }
  } catch (error) {
    console.error('Telegram API Error:', error);
    res.status(500).json({ ok: false, error: 'Failed to send notification' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('✅ Telegram credentials are protected!');
});
