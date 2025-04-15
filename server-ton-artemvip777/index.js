// 🟦 Сервер для ArtemVIP777! Берёт курс TON/USDT с CryptoCompare и отдаёт на сайт

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

// 🟦 Функция для получения курса TON/USDT с CryptoCompare
const fetchRate = async () => {
  try {
    const res = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=TON&tsyms=USDT');
    if (res.data && typeof res.data.USDT !== 'undefined') {
      latestRate = {
        ton_usdt: res.data.USDT,
        timestamp: Date.now(),
      };
    } else {
      console.error('CryptoCompare вернул неожиданные данные:', res.data);
    }
    // 🟦 Отправляем курс всем подключённым клиентам
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'rate', data: latestRate }));
      }
    });
  } catch (e) {
    console.error('Rate fetch error:', e);
  }
};

// 🟦 Запрашиваем курс раз в 15 секунд (можно увеличить до 30 если будет ошибка)
setInterval(fetchRate, 15000);

// 🟦 Если кто-то спросит /api/rate — отдаём последний курс
app.get('/api/rate', (req, res) => {
  res.json(latestRate);
});

// 🟦 Запускаем сервер на порту 10000
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log('Backend running on port ' + PORT));
