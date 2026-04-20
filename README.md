# T212 Tray

A system tray application to monitor your Trading212 account with real-time balance and P&L updates.

## Features

- System tray icon with live account info
- Auto-updates every 30 seconds
- P&L-based icon (up/down)

## Prerequisites

- Node.js 16+
- Trading212 account with API access

## Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```env
   TRADING212_API_KEY=your_api_key
   TRADING212_API_SECRET=your_api_secret
   TRADING212_BASE_URL=live.trading212.com
   ```

## Development

```bash
# Build and run
npm run dev
```

## License

MIT
