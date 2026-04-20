# T212 Tray

System tray app for monitoring your Trading212 account. Shows total balance, cash available, and P&L - updates every 30 seconds.

## Features

- Live account info in system tray
- Icon changes based on P&L (green up / red down)
- Click to open Trading212 in browser
- Works on Windows, macOS, Linux

## Setup

```bash
npm install
npm run build
```

## Config

Copy `.env.example` to `.env` and add your API credentials:

```env
TRADING212_API_KEY=your_key
TRADING212_API_SECRET=your_secret
TRADING212_BASE_URL=live.trading212.com
```

## Usage

```bash
npm run dev
```

The icon appears in your system tray and updates automatically.

## License

MIT
