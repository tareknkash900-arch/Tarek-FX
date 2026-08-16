"use client";

import { useMemo, useState } from "react";

const coins = [
  {
    symbol: "BTC/USDT",
    name: "Bitcoin",
    arabic: "بيتكوين",
    price: 118420,
    change: 2.84,
    high: 119850,
    low: 114920,
    volume: "48.2B",
  },
  {
    symbol: "ETH/USDT",
    name: "Ethereum",
    arabic: "إيثريوم",
    price: 4218.6,
    change: 1.72,
    high: 4290.2,
    low: 4078.4,
    volume: "22.7B",
  },
  {
    symbol: "SOL/USDT",
    name: "Solana",
    arabic: "سولانا",
    price: 184.32,
    change: -0.91,
    high: 190.7,
    low: 179.2,
    volume: "6.8B",
  },
  {
    symbol: "BNB/USDT",
    name: "BNB",
    arabic: "بينانس كوين",
    price: 812.4,
    change: 0.64,
    high: 824.9,
    low: 796.3,
    volume: "2.1B",
  },
  {
    symbol: "XRP/USDT",
    name: "XRP",
    arabic: "ريبل",
    price: 3.18,
    change: -1.24,
    high: 3.31,
    low: 3.04,
    volume: "5.4B",
  },
  {
    symbol: "DOGE/USDT",
    name: "Dogecoin",
    arabic: "دوجكوين",
    price: 0.238,
    change: 3.41,
    high: 0.244,
    low: 0.226,
    volume: "1.9B",
  },
];

const news = [
  "بيتكوين يحافظ على قوته مع استمرار اهتمام المستثمرين بالسوق.",
  "ارتفاع نشاط التداول على العملات الرقمية خلال الساعات الأخيرة.",
  "إيثريوم يختبر منطقة مقاومة مهمة أمام المتداولين.",
  "سولانا تتحرك داخل نطاق سعري ضيق مع زيادة أحجام التداول.",
];

const timeframes = ["1د", "5د", "15د", "1س", "4س", "1ي"];

function formatPrice(price) {
  if (price < 1) return price.toFixed(4);
  if (price < 10) return price.toFixed(2);
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function generateCandles(seed) {
  const result = [];
  let value = seed;

  for (let i = 0; i < 45; i++) {
    const movement =
      Math.sin(i * 1.17) * seed * 0.006 +
      Math.cos(i * 0.47) * seed * 0.003;

    const open = value;
    const close = Math.max(seed * 0.82, value + movement);
    const high =
      Math.max(open, close) + Math.abs(Math.sin(i * 2.1)) * seed * 0.004;
    const low =
      Math.min(open, close) - Math.abs(Math.cos(i * 1.7)) * seed * 0.004;

    result.push({ open, close, high, low });
    value = close;
  }

  return result;
}

function TradingChart({ coin }) {
  const candles = useMemo(
    () => generateCandles(coin.price),
    [coin.price]
  );

  const values = candles.flatMap((c) => [c.high, c.low]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const y = (value) => 245 - ((value - min) / range) * 210;

  return (
    <div className="chart">
      <div className="chart-grid">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="price-axis">
        <b>{formatPrice(max)}</b>
        <b>{formatPrice((max + min) / 2)}</b>
        <b>{formatPrice(min)}</b>
      </div>

      <svg
        viewBox="0 0 900 280"
        className="chart-svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d={`M 0 ${y(candles[0].close)} ${candles
            .map(
              (c, i) =>
                `L ${(i / (candles.length - 1)) * 900} ${y(c.close)}`
            )
            .join(" ")} L 900 280 L 0 280 Z`}
          fill="url(#area)"
        />

        {candles.map((candle, i) => {
          const x = 15 + i * 20;
          const width = 11;
          const bullish = candle.close >= candle.open;

          const bodyTop = y(Math.max(candle.open, candle.close));
          const bodyBottom = y(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(2, bodyBottom - bodyTop);

          return (
            <g key={i}>
              <line
                x1={x}
                x2={x}
                y1={y(candle.high)}
                y2={y(candle.low)}
                stroke={bullish ? "#22c55e" : "#ef4444"}
                strokeWidth="1.5"
              />

              <rect
                x={x - width / 2}
                y={bodyTop}
                width={width}
                height={bodyHeight}
                rx="1"
                fill={bullish ? "#22c55e" : "#ef4444"}
              />
            </g>
          );
        })}
      </svg>

      <div className="chart-bottom">
        <span>09:00</span>
        <span>12:00</span>
        <span>15:00</span>
        <span>18:00</span>
        <span>الآن</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1س");
  const [orderType, setOrderType] = useState("شراء");
  const [amount, setAmount] = useState("");
  const [watchlist, setWatchlist] = useState([
    "BTC/USDT",
    "ETH/USDT",
    "SOL/USDT",
  ]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const selectedCoin =
    coins.find((coin) => coin.symbol === selectedSymbol) || coins[0];

  const filteredCoins = coins.filter((coin) => {
    const text = `${coin.symbol} ${coin.name} ${coin.arabic}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const toggleWatchlist = (symbol) => {
    setWatchlist((current) =>
      current.includes(symbol)
        ? current.filter((item) => item !== symbol)
        : [...current, symbol]
    );
  };

  const submitOrder = () => {
    if (!amount || Number(amount) <= 0) {
      setMessage("أدخل كمية صحيحة أولاً.");
      return;
    }

    setMessage(
      `تم تسجيل أمر ${orderType} تجريبي لـ ${amount} USDT على ${selectedCoin.symbol}.`
    );
  };

  return (
    <main dir="rtl" className="app">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #07100b;
          color: #f5f7f6;
          font-family:
            Arial,
            "Tahoma",
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(34, 197, 94, 0.08),
              transparent 28%
            ),
            #07100b;
        }

        .topbar {
          height: 64px;
          border-bottom: 1px solid #1d2b22;
          background: #09130d;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #22c55e;
          color: #041108;
          font-weight: 900;
          font-size: 18px;
        }

        .brand h1 {
          margin: 0;
          font-size: 18px;
        }

        .brand small {
          color: #8d9a91;
          display: block;
          margin-top: 3px;
        }

        .market-status {
          color: #22c55e;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 12px #22c55e;
        }

        .container {
          max-width: 1500px;
          margin: auto;
          padding: 18px;
        }

        .ticker {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .ticker-card {
          background: #0c1710;
          border: 1px solid #1c2a21;
          border-radius: 12px;
          padding: 12px;
          transition: 0.2s;
        }

        .ticker-card:hover,
        .coin-row:hover {
          border-color: #31583d;
          background: #101c14;
        }

        .ticker-name {
          display: flex;
          justify-content: space-between;
          color: #98a49c;
          font-size: 12px;
        }

        .ticker-price {
          font-size: 17px;
          font-weight: 800;
          margin: 8px 0;
        }

        .positive {
          color: #22c55e !important;
        }

        .negative {
          color: #ef4444 !important;
        }

        .workspace {
          display: grid;
          grid-template-columns: 270px minmax(0, 1fr) 300px;
          gap: 14px;
        }

        .panel {
          background: #0b1510;
          border: 1px solid #1c2a21;
          border-radius: 14px;
          overflow: hidden;
        }

        .panel-title {
          padding: 15px;
          border-bottom: 1px solid #1c2a21;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-title strong {
          font-size: 15px;
        }

        .muted {
          color: #7f8c84;
          font-size: 12px;
        }

        .search {
          margin: 12px;
          width: calc(100% - 24px);
          background: #07100b;
          color: white;
          border: 1px solid #24362a;
          border-radius: 9px;
          padding: 10px 12px;
          outline: none;
        }

        .search:focus {
          border-color: #22c55e;
        }

        .coin-list {
          max-height: 620px;
          overflow: auto;
        }

        .coin-row {
          width: 100%;
          background: transparent;
          color: white;
          border: 0;
          border-bottom: 1px solid #17231b;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: right;
        }

        .coin-main {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .coin-icon {
          width: 31px;
          height: 31px;
          border-radius: 50%;
          background: #17251b;
          display: grid;
          place-items: center;
          color: #22c55e;
          font-size: 11px;
          font-weight: bold;
        }

        .coin-symbol {
          font-weight: 700;
          font-size: 13px;
        }

        .coin-arabic {
          color: #7f8c84;
          font-size: 11px;
          margin-top: 3px;
        }

        .star {
          color: #718078;
          font-size: 17px;
          margin-left: 7px;
        }

        .star.active {
          color: #f5c542;
        }

        .chart-panel {
          min-width: 0;
        }

        .chart-header {
          padding: 15px;
          border-bottom: 1px solid #1c2a21;
        }

        .asset-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .asset-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .asset-title h2 {
          margin: 0;
          font-size: 21px;
        }

        .asset-title span {
          color: #8a988f;
          font-size: 12px;
        }

        .big-price {
          font-size: 27px;
          font-weight: 900;
        }

        .timeframes {
          display: flex;
          gap: 5px;
          margin-top: 16px;
          overflow-x: auto;
        }

        .timeframe {
          border: 1px solid #25362a;
          background: #0b150f;
          color: #8d9b92;
          border-radius: 7px;
          padding: 7px 12px;
          white-space: nowrap;
        }

        .timeframe.active {
          background: #17341f;
          border-color: #22c55e;
          color: #22c55e;
        }

        .chart {
          height: 390px;
          position: relative;
          background: #09120d;
          overflow: hidden;
        }

        .chart-grid {
          position: absolute;
          inset: 0 58px 35px 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .chart-grid span {
          width: 100%;
          border-top: 1px dashed #18251d;
        }

        .chart-svg {
          position: absolute;
          inset: 35px 55px 35px 0;
          width: calc(100% - 55px);
          height: calc(100% - 70px);
        }

        .price-axis {
          position: absolute;
          right: 6px;
          top: 32px;
          bottom: 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #78867d;
          font-size: 10px;
          direction: ltr;
        }

        .chart-bottom {
          position: absolute;
          right: 55px;
          left: 5px;
          bottom: 9px;
          display: flex;
          justify-content: space-between;
          color: #68766e;
          font-size: 10px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #1c2a21;
        }

        .stat {
          background: #09130d;
          border: 1px solid #18271e;
          border-radius: 9px;
          padding: 10px;
        }

        .stat span {
          color: #77857c;
          display: block;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .stat b {
          font-size: 12px;
        }

        .right-panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .order-box {
          padding: 13px;
        }

        .order-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 12px;
        }

        .order-tab {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #29392e;
          background: #0b150f;
          color: #98a49c;
        }

        .order-tab.buy.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border-color: #22c55e;
        }

        .order-tab.sell.active {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border-color: #ef4444;
        }

        .field {
          margin-bottom: 10px;
        }

        .field label {
          display: block;
          color: #7f8c84;
          font-size: 11px;
          margin-bottom: 6px;
        }

        .field input {
          width: 100%;
          background: #07100b;
          color: white;
          border: 1px solid #25362a;
          border-radius: 8px;
          padding: 11px;
          outline: none;
        }

        .order-button {
          width: 100%;
          padding: 12px;
          border: 0;
          border-radius: 9px;
          background: #22c55e;
          color: #031007;
          font-weight: 900;
          margin-top: 5px;
        }

        .order-button.sell {
          background: #ef4444;
          color: white;
        }

        .message {
          margin-top: 10px;
          padding: 9px;
          border-radius: 8px;
          background: #101d15;
          color: #b8c4bc;
          font-size: 11px;
          line-height: 1.6;
        }

        .news-item {
          padding: 12px 14px;
          border-bottom: 1px solid #17231b;
          font-size: 12px;
          line-height: 1.6;
          color: #b8c1ba;
        }

        .ai-box {
          margin: 12px;
          padding: 14px;
          border: 1px solid #285438;
          background: rgba(34, 197, 94, 0.06);
          border-radius: 11px;
        }

        .ai-title {
          color: #22c55e;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .ai-box p {
          color: #aeb9b1;
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }

        .footer {
          padding: 22px;
          text-align: center;
          color: #59665e;
          font-size: 11px;
        }

        @media (max-width: 1100px) {
          .workspace {
            grid-template-columns: 220px minmax(0, 1fr);
          }

          .right-panel {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .ticker {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 750px) {
          .topbar {
            padding: 0 12px;
          }

          .market-status {
            display: none;
          }

          .container {
            padding: 10px;
          }

          .ticker {
            grid-template-columns: repeat(2, 1fr);
          }

          .workspace {
            display: flex;
            flex-direction: column;
          }

          .coin-list {
            max-height: 280px;
          }

          .right-panel {
            display: flex;
          }

          .chart {
            height: 330px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .brand h1 {
            font-size: 15px;
          }

          .brand small {
            font-size: 9px;
          }
        }

        @media (max-width: 420px) {
          .ticker-card:nth-child(n + 5) {
            display: none;
          }

          .ticker {
            grid-template-columns: repeat(2, 1fr);
          }

          .big-price {
            font-size: 22px;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="brand">
          <div className="logo">ط</div>
          <div>
            <h1>طارق إف اكس</h1>
            <small>منصة تحليل وتداول العملات الرقمية</small>
          </div>
        </div>

        <div className="market-status">
          <span className="dot" />
          السوق يعمل الآن
        </div>
      </header>

      <div className="container">
        <section className="ticker">
          {coins.map((coin) => (
            <button
              key={coin.symbol}
              className="ticker-card"
              onClick={() => setSelectedSymbol(coin.symbol)}
            >
              <div className="ticker-name">
                <span>{coin.symbol}</span>
                <span>{coin.arabic}</span>
              </div>

              <div className="ticker-price">
                {formatPrice(coin.price)}
              </div>

              <div className={coin.change >= 0 ? "positive" : "negative"}>
                {coin.change >= 0 ? "+" : ""}
                {coin.change}%
              </div>
            </button>
          ))}
        </section>

        <section className="workspace">
          <aside className="panel">
            <div className="panel-title">
              <strong>قائمة العملات</strong>
              <span className="muted">{coins.length} أصول</span>
            </div>

            <input
              className="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن عملة..."
            />

            <div className="coin-list">
              {filteredCoins.map((coin) => (
                <button
                  className="coin-row"
                  key={coin.symbol}
                  onClick={() => setSelectedSymbol(coin.symbol)}
                >
                  <div className="coin-main">
                    <span
                      className={
                        watchlist.includes(coin.symbol)
                          ? "star active"
                          : "star"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(coin.symbol);
                      }}
                    >
                      ★
                    </span>

                    <span className="coin-icon">
                      {coin.symbol.slice(0, 2)}
                    </span>

                    <span>
                      <div className="coin-symbol">{coin.symbol}</div>
                      <div className="coin-arabic">{coin.arabic}</div>
                    </span>
                  </div>

                  <span>
                    <div className="coin-symbol">
                      {formatPrice(coin.price)}
                    </div>
                    <div
                      className={
                        coin.change >= 0 ? "coin-arabic positive" : "coin-arabic negative"
                      }
                    >
                      {coin.change >= 0 ? "+" : ""}
                      {coin.change}%
                    </div>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="panel chart-panel">
            <div className="chart-header">
              <div className="asset-header">
                <div className="asset-title">
                  <div className="coin-icon">
                    {selectedCoin.symbol.slice(0, 2)}
                  </div>

                  <div>
                    <h2>{selectedCoin.arabic}</h2>
                    <span>{selectedCoin.symbol} · USDT</span>
                  </div>
                </div>

                <div>
                  <div className="big-price">
                    {formatPrice(selectedCoin.price)}
                  </div>

                  <div
                    className={
                      selectedCoin.change >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {selectedCoin.change >= 0 ? "+" : ""}
                    {selectedCoin.change}%
                  </div>
                </div>
              </div>

              <div className="timeframes">
                {timeframes.map((item) => (
                  <button
                    key={item}
                    className={
                      timeframe === item
                        ? "timeframe active"
                        : "timeframe"
                    }
                    onClick={() => setTimeframe(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <TradingChart coin={selectedCoin} />

            <div className="stats">
              <div className="stat">
                <span>أعلى سعر</span>
                <b>{formatPrice(selectedCoin.high)}</b>
              </div>

              <div className="stat">
                <span>أدنى سعر</span>
                <b>{formatPrice(selectedCoin.low)}</b>
              </div>

              <div className="stat">
                <span>حجم التداول</span>
                <b>{selectedCoin.volume}</b>
              </div>

              <div className="stat">
                <span>الإطار</span>
                <b>{timeframe}</b>
              </div>
            </div>

            <div className="ai-box">
              <div className="ai-title">🤖 تحليل طارق AI</div>
              <p>
                {selectedCoin.change >= 0
                  ? `الاتجاه الحالي لـ ${selectedCoin.arabic} إيجابي بشكل مبدئي. السعر يتحرك أعلى من بداية الجلسة، مع ضرورة مراقبة مناطق المقاومة وإدارة المخاطر.`
                  : `الاتجاه الحالي لـ ${selectedCoin.arabic} يميل للضغط البيعي. يفضل مراقبة الدعم قبل اتخاذ أي قرار تداول.`}
              </p>
            </div>
          </section>

          <aside className="right-panel">
            <div className="panel">
              <div className="panel-title">
                <strong>شاشة الأوامر</strong>
                <span className="muted">محاكاة</span>
              </div>

              <div className="order-box">
                <div className="order-tabs">
                  <button
                    className={
                      orderType === "شراء"
                        ? "order-tab buy active"
                        : "order-tab buy"
                    }
                    onClick={() => setOrderType("شراء")}
                  >
                    شراء
                  </button>

                  <button
                    className={
                      orderType === "بيع"
                        ? "order-tab sell active"
                        : "order-tab sell"
                    }
                    onClick={() => setOrderType("بيع")}
                  >
                    بيع
                  </button>
                </div>

                <div className="field">
                  <label>العملة</label>
                  <input value={selectedCoin.symbol} readOnly />
                </div>

                <div className="field">
                  <label>السعر</label>
                  <input
                    value={formatPrice(selectedCoin.price)}
                    readOnly
                  />
                </div>

                <div className="field">
                  <label>المبلغ USDT</label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    min="0"
                    placeholder="مثال: 100"
                  />
                </div>

                <button
                  className={
                    orderType === "بيع"
                      ? "order-button sell"
                      : "order-button"
                  }
                  onClick={submitOrder}
                >
                  تنفيذ {orderType} تجريبي
                </button>

                {message && <div className="message">{message}</div>}
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">
                <strong>📰 أخبار السوق</strong>
                <span className="muted">مباشر</span>
              </div>

              {news.map((item, index) => (
                <div className="news-item" key={index}>
                  {item}
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="panel-title">
                <strong>⭐ المفضلة</strong>
                <span className="muted">
                  {watchlist.length}
                </span>
              </div>

              {watchlist.map((symbol) => {
                const coin = coins.find(
                  (item) => item.symbol === symbol
                );

                if (!coin) return null;

                return (
                  <button
                    className="coin-row"
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                  >
                    <span>{coin.arabic}</span>
                    <span
                      className={
                        coin.change >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {coin.change >= 0 ? "+" : ""}
                      {coin.change}%
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>

        <footer className="footer">
          طارق إف اكس V3 · منصة تجريبية لتحليل العملات الرقمية
          <br />
          الأسعار المعروضة حالياً تجريبية وليست أسعار سوق حقيقية.
        </footer>
      </div>
    </main>
  );
}
