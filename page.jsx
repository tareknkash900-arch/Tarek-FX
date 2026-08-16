"use client";

import { useMemo, useState } from "react";

const coins = [
  { symbol: "BTC/USDT", name: "Bitcoin", price: 118420, change: 2.84 },
  { symbol: "ETH/USDT", name: "Ethereum", price: 4218.6, change: 1.72 },
  { symbol: "SOL/USDT", name: "Solana", price: 184.32, change: -0.91 },
  { symbol: "BNB/USDT", name: "BNB", price: 812.4, change: 0.64 },
  { symbol: "XRP/USDT", name: "XRP", price: 3.18, change: -1.24 },
  { symbol: "DOGE/USDT", name: "Dogecoin", price: 0.238, change: 3.41 },
];

const news = [
  "البيتكوين يحافظ على قوته مع استمرار اهتمام المستثمرين بالسوق.",
  "ارتفاع نشاط التداول على العملات الرقمية خلال الساعات الأخيرة.",
  "الإيثيريوم يختبر منطقة مقاومة مهمة أمام المتداولين.",
  "سولانا تتحرك داخل نطاق سعري ضيق مع زيادة أحجام التداول.",
];

function formatPrice(price) {
  if (price < 1) return price.toFixed(4);
  if (price < 10) return price.toFixed(2);
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Home() {
  const [selected, setSelected] = useState(coins[0]);
  const [timeframe, setTimeframe] = useState("1س");
  const [orderType, setOrderType] = useState("شراء");
  const [amount, setAmount] = useState("");
  const [watchlist, setWatchlist] = useState(["BTC/USDT", "ETH/USDT"]);
  const [message, setMessage] = useState("");

  const currentCoin = useMemo(
    () => coins.find((coin) => coin.symbol === selected.symbol) || selected,
    [selected]
  );

  function toggleWatchlist(symbol) {
    setWatchlist((old) =>
      old.includes(symbol)
        ? old.filter((item) => item !== symbol)
        : [...old, symbol]
    );
  }

  function submitOrder() {
    if (!amount || Number(amount) <= 0) {
      setMessage("أدخل كمية صحيحة أولاً.");
      return;
    }

    setMessage(
      `تمت محاكاة أمر ${orderType} لـ ${currentCoin.symbol} بقيمة ${amount} USDT`
    );
  }

  return (
    <main dir="rtl" className="tarek-app">
      {/* الشريط العلوي */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">T</div>
          <div>
            <h1>طارق إف إكس</h1>
            <span>منصة التداول الذكية</span>
          </div>
        </div>

        <div className="market-status">
          <span className="status-dot"></span>
          السوق مفتوح
        </div>

        <div className="top-actions">
          <button>🔔</button>
          <button>⚙️</button>
          <div className="user-avatar">ط</div>
        </div>
      </header>

      {/* شريط العملات */}
      <section className="ticker">
        {coins.map((coin) => (
          <button
            key={coin.symbol}
            className={`ticker-item ${
              selected.symbol === coin.symbol ? "active" : ""
            }`}
            onClick={() => setSelected(coin)}
          >
            <strong>{coin.symbol}</strong>
            <span>${formatPrice(coin.price)}</span>
            <small className={coin.change >= 0 ? "positive" : "negative"}>
              {coin.change >= 0 ? "+" : ""}
              {coin.change}%
            </small>
          </button>
        ))}
      </section>

      {/* المحتوى الرئيسي */}
      <div className="dashboard">
        {/* القائمة الجانبية */}
        <aside className="sidebar">
          <div className="side-title">القائمة</div>

          <button className="side-link active">📊 الأسواق</button>
          <button className="side-link">⭐ المفضلة</button>
          <button className="side-link">🤖 تحليل طارق AI</button>
          <button className="side-link">📰 الأخبار</button>
          <button className="side-link">🔔 الإشارات</button>
          <button className="side-link">🔎 بحث الأصول</button>

          <div className="watch-title">المراقبة</div>

          {coins.slice(0, 4).map((coin) => (
            <button
              key={coin.symbol}
              className="watch-item"
              onClick={() => setSelected(coin)}
            >
              <div>
                <strong>{coin.symbol}</strong>
                <small>{coin.name}</small>
              </div>

              <div className="watch-price">
                <strong>${formatPrice(coin.price)}</strong>
                <small className={coin.change >= 0 ? "positive" : "negative"}>
                  {coin.change >= 0 ? "+" : ""}
                  {coin.change}%
                </small>
              </div>
            </button>
          ))}
        </aside>

        {/* منطقة الرسم */}
        <section className="workspace">
          <div className="chart-header">
            <div>
              <div className="pair-title">
                <h2>{currentCoin.symbol}</h2>
                <button
                  className="star-button"
                  onClick={() => toggleWatchlist(currentCoin.symbol)}
                >
                  {watchlist.includes(currentCoin.symbol) ? "★" : "☆"}
                </button>
              </div>

              <div className="coin-name">{currentCoin.name}</div>
            </div>

            <div className="price-block">
              <strong>${formatPrice(currentCoin.price)}</strong>
              <span
                className={
                  currentCoin.change >= 0 ? "positive" : "negative"
                }
              >
                {currentCoin.change >= 0 ? "+" : ""}
                {currentCoin.change}%
              </span>
            </div>
          </div>

          {/* الفواصل الزمنية */}
          <div className="timeframes">
            {["1د", "5د", "15د", "1س", "4س", "1ي"].map((item) => (
              <button
                key={item}
                className={timeframe === item ? "selected" : ""}
                onClick={() => setTimeframe(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* الرسم البياني */}
          <div className="chart">
            <div className="chart-grid"></div>

            <div className="chart-label label-top">
              ${formatPrice(currentCoin.price + 2200)}
            </div>

            <div className="chart-label label-mid">
              ${formatPrice(currentCoin.price)}
            </div>

            <div className="chart-label label-bottom">
              ${formatPrice(currentCoin.price - 2200)}
            </div>

            <svg
              className="chart-svg"
              viewBox="0 0 1000 430"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopOpacity="0.35" />
                  <stop offset="100%" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M0 300
                   L40 280
                   L80 295
                   L120 250
                   L160 265
                   L200 220
                   L240 240
                   L280 190
                   L320 210
                   L360 165
                   L400 180
                   L440 135
                   L480 155
                   L520 120
                   L560 145
                   L600 105
                   L640 125
                   L680 90
                   L720 115
                   L760 80
                   L800 95
                   L840 65
                   L880 90
                   L920 55
                   L960 75
                   L1000 45
                   L1000 430
                   L0 430 Z"
                fill="url(#area)"
                stroke="none"
              />

              <path
                d="M0 300
                   L40 280
                   L80 295
                   L120 250
                   L160 265
                   L200 220
                   L240 240
                   L280 190
                   L320 210
                   L360 165
                   L400 180
                   L440 135
                   L480 155
                   L520 120
                   L560 145
                   L600 105
                   L640 125
                   L680 90
                   L720 115
                   L760 80
                   L800 95
                   L840 65
                   L880 90
                   L920 55
                   L960 75
                   L1000 45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="chart-watermark">طارق FX</div>
          </div>

          {/* معلومات أسفل الرسم */}
          <div className="market-stats">
            <div>
              <span>الافتتاح</span>
              <strong>${formatPrice(currentCoin.price - 850)}</strong>
            </div>

            <div>
              <span>أعلى سعر</span>
              <strong>${formatPrice(currentCoin.price + 2300)}</strong>
            </div>

            <div>
              <span>أدنى سعر</span>
              <strong>${formatPrice(currentCoin.price - 2400)}</strong>
            </div>

            <div>
              <span>الحجم</span>
              <strong>1.84B</strong>
            </div>
          </div>

          {/* تحليل AI */}
          <div className="ai-panel">
            <div className="ai-header">
              <div className="ai-icon">🤖</div>
              <div>
                <h3>تحليل طارق AI</h3>
                <span>تحليل تجريبي للسوق</span>
              </div>

              <div className="signal-badge">إيجابي</div>
            </div>

            <p>
              السعر يتحرك في اتجاه صاعد على الإطار الحالي. توجد منطقة مقاومة
              قريبة، لذلك يفضل انتظار تأكيد الاختراق قبل اتخاذ قرار تداول.
            </p>

            <div className="ai-levels">
              <div>
                <span>الدعم</span>
                <strong>${formatPrice(currentCoin.price - 3100)}</strong>
              </div>

              <div>
                <span>المقاومة</span>
                <strong>${formatPrice(currentCoin.price + 3200)}</strong>
              </div>

              <div>
                <span>قوة الإشارة</span>
                <strong>78%</strong>
              </div>
            </div>
          </div>
        </section>

        {/* لوحة التداول */}
        <aside className="trade-panel">
          <div className="trade-tabs">
            <button
              className={orderType === "شراء" ? "buy active" : ""}
              onClick={() => setOrderType("شراء")}
            >
              شراء
            </button>

            <button
              className={orderType === "بيع" ? "sell active" : ""}
              onClick={() => setOrderType("بيع")}
            >
              بيع
            </button>
          </div>

          <div className="trade-content">
            <div className="order-row">
              <span>الأصل</span>
              <strong>{currentCoin.symbol}</strong>
            </div>

            <label>نوع الأمر</label>
            <select>
              <option>سوق</option>
              <option>حد</option>
              <option>إيقاف</option>
            </select>

            <label>السعر</label>
            <div className="input-box">
              <input
                value={currentCoin.price}
                readOnly
                type="number"
              />
              <span>USDT</span>
            </div>

            <label>الكمية</label>
            <div className="input-box">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
              />
              <span>USDT</span>
            </div>

            <div className="balance">
              <span>الرصيد التجريبي</span>
              <strong>10,000 USDT</strong>
            </div>

            <button
              className={`order-button ${
                orderType === "شراء" ? "buy-button" : "sell-button"
              }`}
              onClick={submitOrder}
            >
              {orderType} {currentCoin.symbol}
            </button>

            {message && <div className="order-message">{message}</div>}

            <div className="demo-warning">
              ⚠️ وضع المحاكاة مفعل
              <small>
                الأوامر هنا تجريبية ولا يتم إرسالها إلى منصة تداول حقيقية.
              </small>
            </div>
          </div>
        </aside>
      </div>

      {/* الأخبار */}
      <section className="bottom-grid">
        <div className="news-panel">
          <div className="section-heading">
            <h2>📰 آخر الأخبار</h2>
            <button>عرض الكل</button>
          </div>

          {news.map((item, index) => (
            <article className="news-item" key={index}>
              <div className="news-dot"></div>
              <div>
                <p>{item}</p>
                <small>منذ {index + 1} ساعة</small>
              </div>
            </article>
          ))}
        </div>

        <div className="signals-panel">
          <div className="section-heading">
            <h2>🔔 إشارات السوق</h2>
          </div>

          <div className="signal-card">
            <span>BTC/USDT</span>
            <strong className="positive">شراء محتمل</strong>
            <small>قوة الإشارة 82%</small>
          </div>

          <div className="signal-card">
            <span>ETH/USDT</span>
            <strong className="positive">مراقبة شراء</strong>
            <small>قوة الإشارة 71%</small>
          </div>

          <div className="signal-card">
            <span>SOL/USDT</span>
            <strong className="negative">انتظار</strong>
            <small>قوة الإشارة 54%</small>
          </div>
        </div>
      </section>

      {/* التذييل */}
      <footer>
        <strong>طارق إف إكس V3</strong>
        <span>منصة تحليل وتداول تجريبية باللغة العربية</span>
      </footer>
    </main>
  );
}
