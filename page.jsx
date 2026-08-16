"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API = "https://data-api.binance.vision/api/v3";

const COINS = [
  {
    symbol: "BTCUSDT",
    pair: "BTC/USDT",
    name: "Bitcoin",
    arabic: "بيتكوين",
    short: "BTC",
  },
  {
    symbol: "ETHUSDT",
    pair: "ETH/USDT",
    name: "Ethereum",
    arabic: "إيثيريوم",
    short: "ETH",
  },
  {
    symbol: "SOLUSDT",
    pair: "SOL/USDT",
    name: "Solana",
    arabic: "سولانا",
    short: "SOL",
  },
  {
    symbol: "BNBUSDT",
    pair: "BNB/USDT",
    name: "BNB",
    arabic: "بينانس كوين",
    short: "BNB",
  },
  {
    symbol: "XRPUSDT",
    pair: "XRP/USDT",
    name: "XRP",
    arabic: "ريبل",
    short: "XRP",
  },
  {
    symbol: "DOGEUSDT",
    pair: "DOGE/USDT",
    name: "Dogecoin",
    arabic: "دوجكوين",
    short: "DOGE",
  },
  {
    symbol: "ADAUSDT",
    pair: "ADA/USDT",
    name: "Cardano",
    arabic: "كاردانو",
    short: "ADA",
  },
  {
    symbol: "AVAXUSDT",
    pair: "AVAX/USDT",
    name: "Avalanche",
    arabic: "أفالانش",
    short: "AVAX",
  },
];

const INTERVALS = [
  { label: "1د", value: "1m" },
  { label: "5د", value: "5m" },
  { label: "15د", value: "15m" },
  { label: "1س", value: "1h" },
  { label: "4س", value: "4h" },
  { label: "1ي", value: "1d" },
];

function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  const number = Number(value);

  if (number >= 1000) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (number >= 1) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

function formatVolume(value) {
  const number = Number(value || 0);

  if (number >= 1_000_000_000) {
    return `$${(number / 1_000_000_000).toFixed(2)}B`;
  }

  if (number >= 1_000_000) {
    return `$${(number / 1_000_000).toFixed(2)}M`;
  }

  if (number >= 1_000) {
    return `$${(number / 1_000).toFixed(2)}K`;
  }

  return `$${number.toFixed(2)}`;
}

function timeAgo(timestamp) {
  if (!timestamp) return "—";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 5) return "الآن";
  if (seconds < 60) return `منذ ${seconds} ث`;
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} د`;

  return `منذ ${Math.floor(seconds / 3600)} س`;
}

function Chart({ candles }) {
  const width = 900;
  const height = 360;
  const padding = 35;

  if (!candles || candles.length < 2) {
    return (
      <div className="chart-empty">
        <div className="loader" />
        <span>جاري تحميل بيانات الرسم البياني...</span>
      </div>
    );
  }

  const visible = candles.slice(-80);

  const highs = visible.map((c) => c.high);
  const lows = visible.map((c) => c.low);

  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const range = max - min || 1;

  const xStep = (width - padding * 2) / visible.length;
  const candleWidth = Math.max(3, xStep * 0.58);

  const y = (price) =>
    height - padding - ((price - min) / range) * (height - padding * 2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="chart-svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#18d879" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#18d879" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3, 4].map((row) => {
        const gy =
          padding + (row / 4) * (height - padding * 2);

        return (
          <line
            key={`grid-${row}`}
            x1={padding}
            x2={width - padding}
            y1={gy}
            y2={gy}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        );
      })}

      {visible.map((candle, index) => {
        const x = padding + index * xStep + xStep / 2;

        const openY = y(candle.open);
        const closeY = y(candle.close);
        const highY = y(candle.high);
        const lowY = y(candle.low);

        const bullish = candle.close >= candle.open;

        const color = bullish ? "#18d879" : "#ff4d67";

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(closeY - openY));

        return (
          <g key={`${candle.time}-${index}`}>
            <line
              x1={x}
              x2={x}
              y1={highY}
              y2={lowY}
              stroke={color}
              strokeWidth="1.2"
            />

            <rect
              x={x - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              rx="1"
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function Home() {
  const [market, setMarket] = useState({});
  const [selected, setSelected] = useState("BTCUSDT");
  const [interval, setIntervalValue] = useState("15m");
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const selectedCoin = useMemo(
    () => COINS.find((coin) => coin.symbol === selected) || COINS[0],
    [selected]
  );

  const fetchMarket = useCallback(async () => {
    try {
      const symbols = JSON.stringify(COINS.map((coin) => coin.symbol));

      const response = await fetch(
        `${API}/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("تعذر الاتصال ببيانات السوق");
      }

      const data = await response.json();

      const mapped = {};

      data.forEach((item) => {
        mapped[item.symbol] = {
          price: Number(item.lastPrice),
          change: Number(item.priceChangePercent),
          high: Number(item.highPrice),
          low: Number(item.lowPrice),
          volume: Number(item.quoteVolume),
          open: Number(item.openPrice),
          trades: Number(item.count),
          timestamp: Date.now(),
        };
      });

      setMarket(mapped);
      setLastUpdate(Date.now());
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        "تعذر جلب الأسعار الحقيقية حاليًا. سيتم إعادة المحاولة تلقائيًا."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCandles = useCallback(async () => {
    setChartLoading(true);

    try {
      const response = await fetch(
        `${API}/klines?symbol=${selected}&interval=${interval}&limit=100`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("تعذر تحميل الشارت");
      }

      const data = await response.json();

      const parsed = data.map((item) => ({
        time: Number(item[0]),
        open: Number(item[1]),
        high: Number(item[2]),
        low: Number(item[3]),
        close: Number(item[4]),
        volume: Number(item[5]),
      }));

      setCandles(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  }, [selected, interval]);

  useEffect(() => {
    fetchMarket();

    const timer = setInterval(fetchMarket, 5000);

    return () => clearInterval(timer);
  }, [fetchMarket]);

  useEffect(() => {
    fetchCandles();

    const timer = setInterval(fetchCandles, 30000);

    return () => clearInterval(timer);
  }, [fetchCandles]);

  const filteredCoins = COINS.filter((coin) => {
    const value = search.toLowerCase();

    return (
      coin.name.toLowerCase().includes(value) ||
      coin.arabic.includes(value) ||
      coin.short.toLowerCase().includes(value)
    );
  });

  const selectedData = market[selected];

  const stats = selectedData || {
    price: null,
    change: 0,
    high: null,
    low: null,
    volume: 0,
    open: null,
  };

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          background: #050706;
        }

        body {
          margin: 0;
          background:
            radial-gradient(
              circle at 50% -20%,
              rgba(0, 255, 128, 0.08),
              transparent 38%
            ),
            #050706;
          color: #f3f6f4;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
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
          direction: rtl;
        }

        .topbar {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(5, 7, 6, 0.92);
          backdrop-filter: blur(18px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          font-weight: 900;
          color: #06120b;
          background: #18d879;
          box-shadow: 0 0 25px rgba(24, 216, 121, 0.2);
        }

        .brand-title {
          font-size: 19px;
          font-weight: 800;
        }

        .brand-subtitle {
          color: #7f8c84;
          font-size: 11px;
          margin-top: 2px;
        }

        .nav {
          display: flex;
          gap: 8px;
        }

        .nav button {
          border: 0;
          color: #8e9a93;
          background: transparent;
          padding: 10px 15px;
          border-radius: 9px;
        }

        .nav button.active,
        .nav button:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
        }

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8e9a93;
          font-size: 12px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #18d879;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(24, 216, 121, 0.7);
        }

        .container {
          width: min(1450px, calc(100% - 36px));
          margin: 0 auto;
          padding: 24px 0 50px;
        }

        .ticker-row {
          display: grid;
          grid-template-columns: repeat(8, minmax(130px, 1fr));
          gap: 9px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .ticker {
          min-width: 130px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          transition: 0.2s;
        }

        .ticker:hover {
          border-color: rgba(24, 216, 121, 0.35);
          transform: translateY(-1px);
        }

        .ticker-top {
          display: flex;
          justify-content: space-between;
          color: #849088;
          font-size: 11px;
          margin-bottom: 8px;
        }

        .ticker-price {
          font-size: 14px;
          font-weight: 750;
        }

        .positive {
          color: #18d879 !important;
        }

        .negative {
          color: #ff526b !important;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 14px;
          margin-top: 18px;
        }

        .panel {
          background: rgba(9, 13, 11, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
        }

        .sidebar {
          padding: 14px;
        }

        .sidebar-title {
          font-weight: 800;
          font-size: 15px;
          margin-bottom: 12px;
        }

        .search {
          width: 100%;
          background: #070a09;
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: white;
          padding: 11px 12px;
          border-radius: 9px;
          outline: none;
          direction: rtl;
          margin-bottom: 12px;
        }

        .search:focus {
          border-color: rgba(24, 216, 121, 0.5);
        }

        .coin-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .coin-button {
          width: 100%;
          border: 1px solid transparent;
          background: transparent;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          border-radius: 10px;
          text-align: right;
        }

        .coin-button:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .coin-button.selected {
          background: rgba(24, 216, 121, 0.08);
          border-color: rgba(24, 216, 121, 0.2);
        }

        .coin-name {
          display: flex;
          gap: 9px;
          align-items: center;
        }

        .coin-icon {
          width: 31px;
          height: 31px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 9px;
          font-weight: 900;
          background: #151c18;
          color: #18d879;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .coin-ar {
          font-size: 12px;
          font-weight: 700;
        }

        .coin-symbol {
          color: #69756e;
          font-size: 10px;
          margin-top: 2px;
        }

        .coin-right {
          text-align: left;
        }

        .coin-right-price {
          font-size: 11px;
          font-weight: 700;
        }

        .coin-right-change {
          font-size: 10px;
          margin-top: 3px;
        }

        .workspace {
          min-width: 0;
        }

        .asset-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .asset-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .asset-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(24, 216, 121, 0.1);
          color: #18d879;
          font-weight: 900;
        }

        .asset-name {
          font-size: 19px;
          font-weight: 850;
        }

        .asset-pair {
          color: #76827a;
          font-size: 12px;
          margin-top: 3px;
          direction: ltr;
          text-align: right;
        }

        .big-price {
          font-size: clamp(25px, 3vw, 38px);
          font-weight: 900;
          direction: ltr;
          text-align: right;
        }

        .price-change {
          text-align: right;
          margin-top: 3px;
          font-size: 13px;
          font-weight: 700;
          direction: ltr;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .intervals {
          display: flex;
          gap: 4px;
          direction: ltr;
        }

        .interval {
          border: 0;
          background: transparent;
          color: #7c8881;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 11px;
        }

        .interval.active {
          background: rgba(24, 216, 121, 0.1);
          color: #18d879;
        }

        .live-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #7c8881;
          font-size: 11px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #18d879;
        }

        .chart-area {
          height: 390px;
          padding: 12px 16px 18px;
          position: relative;
        }

        .chart-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .chart-empty {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #657169;
          gap: 12px;
          font-size: 12px;
        }

        .loader {
          width: 22px;
          height: 22px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: #18d879;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .stat {
          padding: 15px 18px;
          border-left: 1px solid rgba(255, 255, 255, 0.07);
        }

        .stat:last-child {
          border-left: 0;
        }

        .stat-label {
          color: #66736b;
          font-size: 10px;
          margin-bottom: 7px;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 750;
          direction: ltr;
          text-align: right;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }

        .card {
          padding: 18px;
        }

        .card-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          font-weight: 800;
          font-size: 14px;
        }

        .card-title span {
          color: #66736b;
          font-size: 10px;
          font-weight: 500;
        }

        .signal {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border-radius: 10px;
          background: rgba(24, 216, 121, 0.06);
          border: 1px solid rgba(24, 216, 121, 0.12);
        }

        .signal-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(24, 216, 121, 0.13);
          color: #18d879;
          display: grid;
          place-items: center;
          font-weight: 900;
        }

        .signal-title {
          font-weight: 800;
          font-size: 12px;
        }

        .signal-text {
          color: #758178;
          font-size: 10px;
          margin-top: 4px;
        }

        .feed {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feed-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .feed-item:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .feed-name {
          font-size: 11px;
          font-weight: 700;
        }

        .feed-time {
          color: #626e67;
          font-size: 9px;
          margin-top: 3px;
        }

        .feed-value {
          direction: ltr;
          font-size: 11px;
          font-weight: 800;
        }

        .footer {
          text-align: center;
          color: #56615a;
          font-size: 10px;
          padding: 25px 0 0;
        }

        .error {
          margin-top: 14px;
          padding: 12px 15px;
          border-radius: 10px;
          background: rgba(255, 77, 103, 0.08);
          border: 1px solid rgba(255, 77, 103, 0.2);
          color: #ff8294;
          font-size: 11px;
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 1050px) {
          .ticker-row {
            grid-template-columns: repeat(4, minmax(150px, 1fr));
          }

          .main-grid {
            grid-template-columns: 220px minmax(0, 1fr);
          }

          .stats {
            grid-template-columns: repeat(3, 1fr);
          }

          .stat:nth-child(4),
          .stat:nth-child(5) {
            border-top: 1px solid rgba(255, 255, 255, 0.07);
          }
        }

        @media (max-width: 760px) {
          .topbar {
            padding: 0 14px;
            height: 62px;
          }

          .nav,
          .status {
            display: none;
          }

          .mobile-menu {
            display: block;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: transparent;
            color: white;
            border-radius: 8px;
            padding: 7px 10px;
          }

          .container {
            width: calc(100% - 18px);
            padding-top: 12px;
          }

          .ticker-row {
            display: flex;
            overflow-x: auto;
            scrollbar-width: none;
          }

          .ticker-row::-webkit-scrollbar {
            display: none;
          }

          .ticker {
            min-width: 145px;
          }

          .main-grid {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }

          .asset-header {
            padding: 15px;
          }

          .asset-name {
            font-size: 16px;
          }

          .big-price {
            font-size: 24px;
          }

          .chart-area {
            height: 300px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat {
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .toolbar {
            overflow-x: auto;
          }

          .intervals {
            min-width: max-content;
          }
        }
      `}</style>

      <div className="app">
        <header className="topbar">
          <div className="brand">
            <div className="logo">T</div>

            <div>
              <div className="brand-title">طارق FX</div>
              <div className="brand-subtitle">
                منصة تحليل العملات الرقمية
              </div>
            </div>
          </div>

          <nav className="nav">
            <button className="active">الأسواق</button>
            <button>التحليل</button>
            <button>الأخبار</button>
            <button>الإشارات</button>
          </nav>

          <div className="status">
            <span className="status-dot" />
            بيانات السوق مباشرة
          </div>

          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            ☰
          </button>
        </header>

        <main className="container">
          <section className="ticker-row">
            {COINS.map((coin) => {
              const data = market[coin.symbol];

              return (
                <button
                  key={coin.symbol}
                  className="ticker"
                  onClick={() => setSelected(coin.symbol)}
                  style={{
                    textAlign: "right",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <div className="ticker-top">
                    <span>{coin.short}/USDT</span>

                    <span
                      className={
                        data?.change >= 0 ? "positive" : "negative"
                      }
                    >
                      {data
                        ? `${data.change >= 0 ? "+" : ""}${data.change.toFixed(
                            2
                          )}%`
                        : "—"}
                    </span>
                  </div>

                  <div className="ticker-price">
                    {data ? `$${formatPrice(data.price)}` : "تحميل..."}
                  </div>
                </button>
              );
            })}
          </section>

          {error && <div className="error">{error}</div>}

          <section className="main-grid">
            <aside className="panel sidebar">
              <div className="sidebar-title">العملات الرقمية</div>

              <input
                className="search"
                placeholder="ابحث عن عملة..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="coin-list">
                {filteredCoins.map((coin) => {
                  const data = market[coin.symbol];
                  const isSelected = selected === coin.symbol;

                  return (
                    <button
                      key={coin.symbol}
                      className={`coin-button ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => setSelected(coin.symbol)}
                    >
                      <div className="coin-name">
                        <div className="coin-icon">{coin.short}</div>

                        <div>
                          <div className="coin-ar">{coin.arabic}</div>
                          <div className="coin-symbol">
                            {coin.pair}
                          </div>
                        </div>
                      </div>

                      <div className="coin-right">
                        <div className="coin-right-price">
                          {data
                            ? `$${formatPrice(data.price)}`
                            : "—"}
                        </div>

                        <div
                          className={`coin-right-change ${
                            data?.change >= 0
                              ? "positive"
                              : "negative"
                          }`}
                        >
                          {data
                            ? `${
                                data.change >= 0 ? "+" : ""
                              }${data.change.toFixed(2)}%`
                            : "—"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="workspace">
              <section className="panel">
                <div className="asset-header">
                  <div className="asset-info">
                    <div className="asset-icon">
                      {selectedCoin.short}
                    </div>

                    <div>
                      <div className="asset-name">
                        {selectedCoin.arabic}
                      </div>

                      <div className="asset-pair">
                        {selectedCoin.name} · {selectedCoin.pair}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="big-price">
                      {loading || !selectedData
                        ? "—"
                        : `$${formatPrice(selectedData.price)}`}
                    </div>

                    <div
                      className={`price-change ${
                        selectedData?.change >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {selectedData
                        ? `${
                            selectedData.change >= 0 ? "+" : ""
                          }${selectedData.change.toFixed(2)}%`
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="toolbar">
                  <div className="intervals">
                    {INTERVALS.map((item) => (
                      <button
                        key={item.value}
                        className={`interval ${
                          interval === item.value ? "active" : ""
                        }`}
                        onClick={() =>
                          setIntervalValue(item.value)
                        }
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="live-label">
                    <span className="live-dot" />
                    مباشر · {timeAgo(lastUpdate)}
                  </div>
                </div>

                <div className="chart-area">
                  {chartLoading && candles.length === 0 ? (
                    <div className="chart-empty">
                      <div className="loader" />
                      <span>
                        جاري تحميل بيانات {selectedCoin.arabic}...
                      </span>
                    </div>
                  ) : (
                    <Chart candles={candles} />
                  )}
                </div>

                <div className="stats">
                  <div className="stat">
                    <div className="stat-label">
                      السعر الحالي
                    </div>

                    <div className="stat-value">
                      {selectedData
                        ? `$${formatPrice(selectedData.price)}`
                        : "—"}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-label">
                      أعلى 24 ساعة
                    </div>

                    <div className="stat-value">
                      {selectedData
                        ? `$${formatPrice(selectedData.high)}`
                        : "—"}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-label">
                      أدنى 24 ساعة
                    </div>

                    <div className="stat-value">
                      {selectedData
                        ? `$${formatPrice(selectedData.low)}`
                        : "—"}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-label">
                      حجم التداول 24س
                    </div>

                    <div className="stat-value">
                      {selectedData
                        ? formatVolume(selectedData.volume)
                        : "—"}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-label">
                      سعر الافتتاح
                    </div>

                    <div className="stat-value">
                      {selectedData
                        ? `$${formatPrice(selectedData.open)}`
                        : "—"}
                    </div>
                  </div>
                </div>
              </section>

              <div className="bottom-grid">
                <section className="panel card">
                  <div className="card-title">
                    <span>AI</span>
                    التحليل الذكي
                  </div>

                  <div className="signal">
                    <div className="signal-icon">AI</div>

                    <div>
                      <div className="signal-title">
                        تحليل {selectedCoin.arabic}
                      </div>

                      <div className="signal-text">
                        هذه الواجهة تعرض بيانات السوق الحقيقية من
                        Binance. التحليل الآلي المتقدم يمكن ربطه
                        لاحقًا بمحرك AI.
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel card">
                  <div className="card-title">
                    آخر تحديثات السوق
                    <span>24 ساعة</span>
                  </div>

                  <div className="feed">
                    {COINS.slice(0, 5).map((coin) => {
                      const data = market[coin.symbol];

                      return (
                        <div
                          className="feed-item"
                          key={coin.symbol}
                        >
                          <div>
                            <div className="feed-name">
                              {coin.arabic}
                            </div>

                            <div className="feed-time">
                              بيانات Binance المباشرة
                            </div>
                          </div>

                          <div
                            className={`feed-value ${
                              data?.change >= 0
                                ? "positive"
                                : "negative"
                            }`}
                          >
                            {data
                              ? `${
                                  data.change >= 0 ? "+" : ""
                                }${data.change.toFixed(2)}%`
                              : "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          </section>

          <div className="footer">
            طارق FX · بيانات الأسعار من Binance · تحديث تلقائي
          </div>
        </main>
      </div>
    </>
  );
}
