# Trading Terminal TODO

## 🌙 NIGHT SHIFT SUMMARY (2026-02-26)

**10 features shipped while you slept:**
1. ✅ **Real order book** — Hyperliquid L2 data (no more fake bids/asks)
2. ✅ **Chart indicators** — SMA, EMA, Bollinger Bands, VWAP (toggle buttons above chart)
3. ✅ **Persistent settings** — reopens to your last coin, timeframe, indicators
4. ✅ **Vim-style navigation** — j/k to cycle coins, Shift+1-7 for timeframes, c for category
5. ✅ **Fuzzy search** — type partial names, smart ranking
6. ✅ **Price alerts** — Alt+A to set, sound + notification when triggered
7. ✅ **Fear & Greed Index** — live gauge in sidebar
8. ✅ **Dark/light theme** — Alt+T to toggle (or click 🌙 icon)
9. ✅ **Favorites** — star coins, filter by ★ FAV tab
10. ✅ **PUMP ticker** — added per your request

**All pushed to GitHub. Hard refresh to see changes.**

Press `?` in the terminal for full keyboard shortcuts.

---

## 🚀 Next Features (No blockers)
- [ ] Heatmap view as full tab (treemap sized by market cap)
- [ ] Liquidation feed (check if Hyperliquid API has this publicly)
- [ ] Better error handling & loading states
- [ ] Multi-chart split screen layout
- [ ] Correlation matrix
- [ ] RSI subplot (separate panel below main chart)
- [ ] Volume profile chart
- [ ] Advanced order types visualization

## 🔐 Need Omar's HL Account
- [ ] Connect to real Hyperliquid account (show actual positions/PnL)
- [ ] Place trades from terminal (buy/sell with HL API)

## 🚀 Ambitious (later)
- [ ] Multi-chart split screen layout
- [ ] Correlation matrix
- [ ] Advanced charting (Fibonacci, support/resistance drawing)

---

## Progress Log

### 2026-02-26 02:07 AM
- Created TODO list
- Starting with: Real order book, chart indicators, search, settings

### ✅ Completed (2026-02-26 Night Shift + Morning)
- [x] Real Hyperliquid order book (L2) — real bid/ask data for crypto
- [x] Technical indicators (SMA20, SMA50, EMA20, Bollinger Bands, VWAP) — toggleable overlays
- [x] Persistent settings (localStorage) — saves coin, TF, indicators, favorites
- [x] Keyboard shortcuts expansion — vim-style j/k, timeframe hotkeys, indicator toggles
- [x] Fuzzy search with smart scoring — exact/prefix matches prioritized
- [x] Sound alerts — Alt+A to create, Alt+M to mute
- [x] Crypto fear & greed index — live gauge in sidebar
- [x] Dark/light theme toggle — Alt+T or click 🌙 icon
- [x] Favorite coins system — star/unstar coins, ★ FAV filter tab
- [x] Added PUMP ticker
- [x] Mobile-responsive UI — touch-friendly, stacked layouts, adaptive fonts
- [x] Real-time crypto news — Cryptocompare API, updates every 2 min, clickable headlines
- [x] AI market insights — Mistral-7B LLM analysis in Analysis tab, auto-refreshes every 5 min

### Working Now
- [ ] None (waiting for Omar)
