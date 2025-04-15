// 🟦 Это сервер для ArtemVIP777! Он отдаёт курс TON/USDT через интернет!
// Не трогай ничего, просто копируй и вставляй!

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let latestRate = { ton_usdt: 0, timestamp: Date.now() };

// 🟦 Каждые 2 секунды берём курс TON/USDT
const fetchRate = async () => {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=toncoin&vs_currencies=usdt');
    latestRate = {
      ton_usdt: res.data.toncoin.usdt,
      timestamp: Date.now(),
    };
    // 🟦 Отправляем всем, кто подключён
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'rate', data: latestRate }));
      }
    });
  } catch (e) {
    console.error('Rate fetch error:', e);
  }
};

setInterval(fetchRate, 2000);

// 🟦 Если кто-то спросит /api/rate — отдаём курс
app.get('/api/rate', (req, res) => {
  res.json(latestRate);
});

// 🟦 Запускаем сервер на порту 10000
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log('Backend running on port ' + PORT));

add server
