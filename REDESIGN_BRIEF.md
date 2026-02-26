# Trading Terminal Redesign Brief

## Goal
Redesign `index.html` to match the Perplexity Finance Terminal aesthetic (see reference images `ref_*.jpg` in this folder). Keep it as a single HTML file with no build tools. All data comes from Hyperliquid public API.

## Reference: Perplexity Terminal Style
Look at the reference images. Key design elements:

### Layout & Navigation
- **Top bar**: Ticker/coin selector input field (like "NVDA US Equity" but for crypto: "BTC PERP"), with the asset name prominently displayed
- **Numbered tab navigation bar**: `[1] OVERVIEW  [2] ANALYSIS  [3] REL INDEX  [4] REL VALUE  [5] NEWS  [6] OWNERSHIP` — clean horizontal tabs with numbers, highlighted when active
- **Content area**: Changes entirely based on which tab is selected — NOT a multi-panel dashboard. Each tab is a FULL PAGE view
- **Scrolling ticker tape** at very bottom with live prices scrolling left

### Visual Style
- Dark background (#0a0a0a or similar very dark gray/black)
- Text: primarily white/light gray, with green for positive values, red for negative
- **Orange/amber accent color** for highlighted tabs, active states, and key data points
- Clean sans-serif font (monospace for numbers/data)
- Minimal borders, use spacing and subtle background differences to separate sections
- Professional, data-dense but NOT cluttered

### Tab Content (adapt for crypto/Hyperliquid)

**[1] OVERVIEW** (default view):
- Left side: Price chart (candlestick) with timeframe buttons (1m, 5m, 15m, 1H, 4H, 1D)
- Right side: Key stats panel (24h Volume, Open Interest, Funding Rate, Mark Price, Index Price, 24h High/Low, etc.)
- Below chart: Recent trades list
- Below stats: Market info / contract details

**[2] ANALYSIS**:
- Technical indicators summary (RSI, MACD, Bollinger Bands, Moving Averages)
- Signal strength meter (Strong Buy / Buy / Neutral / Sell / Strong Sell)
- Support/Resistance levels
- Volume analysis

**[3] ORDER BOOK**:
- Full depth order book visualization
- Bid/Ask spread
- Depth chart (cumulative volume)

**[4] REL VALUE**:
- Comparison chart: selected coin vs other major cryptos (multi-line overlay)
- Peer comparison table with columns: Name, Market Cap, Price, 24h Change, 7d Change, Volume, Funding Rate
- Time period buttons (1D, 1W, 1M, 3M, 1Y)

**[5] NEWS**:
- Crypto news feed (can be simulated/placeholder)
- Timestamped entries
- Source attribution

**[6] POSITIONS**:
- Open positions table
- Order history
- Account summary (balance, unrealized PnL, margin usage)
- Trade history

### Coin Selector
- Top-left input field where you can type a coin name
- Dropdown/autocomplete showing available Hyperliquid coins
- Selecting a coin updates ALL views

### Scrolling Ticker
- Bottom bar with prices scrolling left continuously
- Format: `BTC $97,234.50 ▲+2.3%  ETH $3,421.20 ▼-0.8%  SOL $187.45 ▲+5.1%`
- Green for positive, red for negative

## Technical Requirements

### API
- Hyperliquid API: `https://api.hyperliquid.xyz/info`
- POST requests with JSON body
- Key endpoints:
  - `{"type": "allMids"}` — all mid prices
  - `{"type": "metaAndAssetCtxs"}` — metadata + 24h stats (volume, funding, OI)
  - `{"type": "l2Book", "coin": "BTC"}` — order book
  - `{"type": "candleSnapshot", "coin": "BTC", "interval": "1h", "startTime": <epoch_ms>, "endTime": <epoch_ms>}` — OHLCV candles

### Existing Features to KEEP
- Live price updates (poll every 2-3 seconds)
- Candlestick chart with zoom/pan (mouse drag + scrollbar)
- Timeframe switching (1m, 5m, 15m, 1H, 4H, 1D)
- Order book display
- Watchlist of 18 coins
- localStorage for user preferences

### Chart
- Keep the existing canvas-based candlestick chart
- Zoom/pan with mouse drag
- OHLC overlay on hover
- Timeframe buttons

### Single File
- Everything in ONE `index.html` — HTML, CSS, JS
- No external dependencies except Google Fonts (if needed)
- No build tools

## Coins to Include
BTC, ETH, SOL, DOGE, XRP, AVAX, LINK, ADA, SUI, NEAR, APT, ARB, OP, INJ, TIA, SEI, PEPE, WIF

## Priority
1. Get the tab navigation + full-page view switching working perfectly
2. Overview tab with chart + stats (this is the main view)
3. Scrolling ticker at bottom
4. Other tabs can have simulated/placeholder data initially
5. Make it look PROFESSIONAL — this should feel like a $30K Bloomberg terminal

## Don't
- Don't add any API keys or secrets
- Don't use any external JS libraries (vanilla JS only)
- Don't create multiple files — everything in index.html
- Don't break the existing Hyperliquid API integration
