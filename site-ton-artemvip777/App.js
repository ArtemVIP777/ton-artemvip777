// 🟦 Это сайт для ArtemVIP777! Он показывает курс TON/USDT красиво!
// Просто копируй и вставляй!

import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background: #0a1437;
    color: #fff;
    font-family: 'Inter', sans-serif;
    margin: 0;
    min-height: 100vh;
  }
`;

const GlowCard = styled.div`
  background: #101c3a;
  border-radius: 18px;
  box-shadow: 0 0 24px #00eaff80;
  padding: 32px;
  margin: 32px auto;
  max-width: 420px;
  text-align: center;
`;

const GlowButton = styled.button`
  background: linear-gradient(90deg, #00eaff, #00ffff80);
  color: #0a1437;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 0 16px #00eaff80;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(90deg, #00ffff80, #00eaff);
  }
`;

function App() {
  const [rate, setRate] = useState(null);

  useEffect(() => {
    // 🟦 ЗАМЕНИ на свой адрес после деплоя сервера!
    const ws = new window.WebSocket('wss://server-ton-artemvip777.onrender.com');
    ws.onmessage = (msg) => {
      const { type, data } = JSON.parse(msg.data);
      if (type === 'rate') setRate(data.ton_usdt);
    };
    return () => ws.close();
  }, []);

  return (
    <>
      <GlobalStyle />
      <nav style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#00eaff', fontWeight: 900, letterSpacing: 2 }}>TON Options 💎</h1>
      </nav>
      <GlowCard>
        <h2>TON/USDT Курс</h2>
        <div style={{ fontSize: 36, color: '#00eaff', textShadow: '0 0 12px #00ffff80' }}>
          {rate ? `$${rate}` : 'Загрузка...'}
        </div>
        <GlowButton>Торговать опционами</GlowButton>
      </GlowCard>
    </>
  );
}

export default App;
