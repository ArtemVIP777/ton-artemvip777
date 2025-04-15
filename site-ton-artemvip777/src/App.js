import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

// --- Стили ---
const GlobalStyle = createGlobalStyle`
  body {
    background: #161e36;
    color: #fff;
    font-family: 'Inter', sans-serif;
    margin: 0;
    min-height: 100vh;
  }
`;

const GlowCard = styled.div`
  background: #232b47;
  border-radius: 18px;
  box-shadow: 0 0 24px #00eaff80;
  padding: 32px;
  margin: 64px auto 0 auto;
  max-width: 420px;
  text-align: center;
`;

const GlowButton = styled.button`
  background: linear-gradient(90deg, #00eaff, #00ffff80);
  color: #0a1437;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: bold;
  box-shadow: 0 0 16px #00eaff80;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(90deg, #00ffff80, #00eaff);
  }
`;

const ModalBg = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #000a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const Modal = styled.div`
  background: #232b47;
  border-radius: 18px;
  box-shadow: 0 0 32px #00eaff80;
  padding: 32px 24px 24px 24px;
  min-width: 340px;
  max-width: 95vw;
  text-align: center;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px; right: 16px;
  background: none;
  border: none;
  color: #00eaff;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: none;
  margin: 8px 0;
  width: 80%;
  font-size: 1.1rem;
`;

const RadioWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 16px 0;
`;

const RadioBtn = styled.button`
  background: ${({ active }) => (active ? "#00eaff" : "#232b47")};
  color: ${({ active }) => (active ? "#232b47" : "#00eaff")};
  border: 2px solid #00eaff;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
`;

const Info = styled.div`
  margin: 18px 0 0 0;
  font-size: 1.1rem;
  color: #b0eaff;
`;

const Balance = styled.div`
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #00eaff;
  text-align: right;
`;

const PositionCard = styled.div`
  background: #18203a;
  border-radius: 12px;
  margin: 18px 0 0 0;
  padding: 16px;
  color: #fff;
  box-shadow: 0 0 12px #00eaff40;
  text-align: left;
`;

function App() {
  // --- Состояния ---
  const [rate, setRate] = useState(null);
  const [modal, setModal] = useState(false);

  // "Баланс" пользователя (виртуальный)
  const [balance, setBalance] = useState(() => {
    // Сохраняем баланс в localStorage, чтобы не сбрасывался при обновлении страницы
    const saved = localStorage.getItem("ton-balance");
    return saved ? parseFloat(saved) : 1000;
  });

  // Открытая позиция (если есть)
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("ton-position");
    return saved ? JSON.parse(saved) : null;
  });

  // Для формы
  const [side, setSide] = useState("long"); // long/short
  const [amount, setAmount] = useState("");

  // --- Получение курса TON/USDT ---
  useEffect(() => {
    // ВАЖНО: замени адрес на свой, если другой!
    const ws = new window.WebSocket("wss://server-ton-artemvip777.onrender.com");
    ws.onmessage = (msg) => {
      const { type, data } = JSON.parse(msg.data);
      if (type === "rate") setRate(data.ton_usdt);
    };
    return () => ws.close();
  }, []);

  // --- Сохраняем баланс и позицию в localStorage ---
  useEffect(() => {
    localStorage.setItem("ton-balance", balance);
  }, [balance]);
  useEffect(() => {
    localStorage.setItem("ton-position", JSON.stringify(position));
  }, [position]);

  // --- Открытие позиции ---
  function openPosition() {
    const amt = parseFloat(amount);
    if (!rate || isNaN(amt) || amt <= 0) {
      alert("Введите сумму больше 0");
      return;
    }
    if (amt > balance) {
      alert("Недостаточно средств!");
      return;
    }
    setBalance(balance - amt);
    setPosition({
      side,
      amount: amt,
      entry: rate,
      time: Date.now(),
    });
    setModal(false);
    setAmount("");
  }

  // --- Закрытие позиции ---
  function closePosition() {
    if (!position || !rate) return;
    let pnl = 0;
    if (position.side === "long") {
      pnl = (rate - position.entry) * (position.amount / position.entry);
    } else {
      pnl = (position.entry - rate) * (position.amount / position.entry);
    }
    setBalance(balance + position.amount + pnl);
    setPosition(null);
    alert(
      `Позиция закрыта!\nВаш результат: ${pnl >= 0 ? "+" : ""}${pnl.toFixed(
        2
      )} USDT`
    );
  }

  // --- PnL (прибыль/убыток) ---
  let pnl = 0;
  if (position && rate) {
    if (position.side === "long") {
      pnl = (rate - position.entry) * (position.amount / position.entry);
    } else {
      pnl = (position.entry - rate) * (position.amount / position.entry);
    }
  }

  return (
    <>
      <GlobalStyle />
      <nav style={{ padding: 24, display: "flex", alignItems: "center" }}>
        <h1 style={{ color: "#7eeaff", fontWeight: 900, letterSpacing: 2, fontSize: 22 }}>
          TON Options <span role="img" aria-label="diamond">💎</span>
        </h1>
      </nav>
      <GlowCard>
        <h2>TON/USDT Курс</h2>
        <div style={{ fontSize: 36, color: "#7eeaff", textShadow: "0 0 12px #00ffff80" }}>
          {rate ? `$${rate}` : "Загрузка..."}
        </div>
        <GlowButton onClick={() => setModal(true)}>
          Торговать фьючерсами
        </GlowButton>
      </GlowCard>

      {/* Баланс и позиция */}
      <div style={{ maxWidth: 420, margin: "24px auto 0 auto" }}>
        <Balance>Баланс: {balance.toFixed(2)} USDT</Balance>
        {position && (
          <PositionCard>
            <div>
              <b>Позиция:</b> {position.side === "long" ? "LONG (рост)" : "SHORT (падение)"}
            </div>
            <div>
              <b>Сумма:</b> {position.amount} USDT
            </div>
            <div>
              <b>Вход:</b> ${position.entry}
            </div>
            <div>
              <b>Текущий курс:</b> ${rate}
            </div>
            <div>
              <b>PnL:</b>{" "}
              <span style={{ color: pnl >= 0 ? "#7eeaff" : "#ff6b6b" }}>
                {pnl >= 0 ? "+" : ""}
                {pnl.toFixed(2)} USDT
              </span>
            </div>
            <GlowButton style={{ marginTop: 16 }} onClick={closePosition}>
              Закрыть позицию
            </GlowButton>
          </PositionCard>
        )}
      </div>

      {/* Модальное окно */}
      {modal && (
        <ModalBg>
          <Modal>
            <CloseBtn onClick={() => setModal(false)} title="Закрыть">×</CloseBtn>
            <h2>Открыть фьючерс</h2>
            <RadioWrap>
              <RadioBtn active={side === "long"} onClick={() => setSide("long")}>
                LONG (рост)
              </RadioBtn>
              <RadioBtn active={side === "short"} onClick={() => setSide("short")}>
                SHORT (падение)
              </RadioBtn>
            </RadioWrap>
            <div>
              <Input
                type="number"
                placeholder="Сумма в USDT"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={1}
                max={balance}
              />
            </div>
            <Info>
              Курс открытия: <b>{rate ? `$${rate}` : "..."}</b>
            </Info>
            <GlowButton style={{ marginTop: 18 }} onClick={openPosition}>
              Открыть позицию
            </GlowButton>
          </Modal>
        </ModalBg>
      )}
    </>
  );
}

export default App;
