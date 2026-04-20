#!/usr/bin/env node

import * as https from "https";
import * as dotenv from "dotenv";
import * as path from "path";
import * as os from "os";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file (in parent directory)
dotenv.config({ path: join(__dirname, "../.env"), quiet: true });

// --- CONFIGURATION ---
const API_KEY: string = process.env.TRADING212_API_KEY || "";
const API_SECRET: string = process.env.TRADING212_API_SECRET || "";
const BASE_URL: string =
  process.env.TRADING212_BASE_URL || "live.trading212.com";

// Validate required environment variables
if (!API_KEY || !API_SECRET) {
  console.error(
    "Error: TRADING212_API_KEY and TRADING212_API_SECRET must be set in .env file",
  );
  process.exit(1);
}

// --- TYPES ---
interface AccountInfo {
  total: number;
  free: number;
  ppl: number;
  result: number;
  blocked: number;
  currencyCode: string;
}

// --- API FUNCTIONS ---
const credentials = `${API_KEY}:${API_SECRET}`;
const encodedCreds = Buffer.from(credentials).toString("base64");

function fetchAccountInfo(): Promise<AccountInfo | null> {
  return new Promise((resolve) => {
    const options: https.RequestOptions = {
      hostname: BASE_URL,
      path: "/api/v0/equity/account/cash",
      method: "GET",
      headers: {
        Authorization: `Basic ${encodedCreds}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data: string = "";

      res.on("data", (chunk: string) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const accountInfo: AccountInfo = JSON.parse(data);
            resolve(accountInfo);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });

    req.on("error", () => {
      resolve(null);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

// --- ICON PATHS ---
// Use file paths from icons folder - systray2 handles this better
// On Windows: use .ico format, on macOS/Linux: use .png format
function getIconPath(isUp: boolean): string {
  const platform = os.platform();
  const iconName = isUp ? "up" : "down";
  const ext = platform === "win32" ? ".ico" : ".png";
  return path.join(__dirname, "..", "icons", iconName + ext);
}

// --- TRAY APP ---
async function main() {
  // Dynamic import to handle ESM/CJS interop
  // The module structure has: { default: { default: [Function: SysTray] } }
  const systrayModule = await import("systray2");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SysTray =
    (systrayModule as any).default?.default || (systrayModule as any).default;

  let currentTooltip = "Loading T212 data...";
  let currentIcon = getIconPath(true);

  const systray = new SysTray({
    menu: {
      icon: currentIcon,
      title: "T212",
      tooltip: currentTooltip,
      // Template icon adapts to dark/light mode on macOS
      isTemplateIcon: os.platform() === "darwin",
      items: [
        {
          title: "T212 Account Monitor",
          tooltip: "Trading212 Account Info",
          enabled: false,
        },
        {
          title: "Open T212",
          tooltip: "Open Trading212 in browser",
          enabled: true,
        },
        {
          title: "<SEPARATOR>",
          tooltip: "",
          enabled: true,
        },
        {
          title: "Exit",
          tooltip: "Quit application",
          enabled: true,
        },
      ],
    },
    debug: false,
  });

  systray.onClick(async (action: { seq_id: number }) => {
    if (action.seq_id === 1) {
      // Open Portfolio clicked - cross-platform
      const url = "https://app.trading212.com/";
      const platform = os.platform();
      if (platform === "win32") {
        spawn("cmd", ["/c", "start", url], { detached: true, stdio: "ignore" });
      } else if (platform === "darwin") {
        spawn("open", [url], { detached: true, stdio: "ignore" });
      } else {
        // Linux
        spawn("xdg-open", [url], { detached: true, stdio: "ignore" });
      }
    } else if (action.seq_id === 3) {
      // Exit clicked
      await systray.kill();
    }
  });

  await systray.ready();

  // Update data immediately
  async function updateData() {
    const info = await fetchAccountInfo();
    if (info) {
      const total = info.total.toFixed(2);
      const cash = info.free.toFixed(2);
      const pnl = info.ppl;
      const pnlFormatted = pnl.toFixed(2);
      // currencyCode may not be in the response, default to EUR
      const currency = info.currencyCode || "EUR";

      // Choose icon based on P&L
      currentIcon = getIconPath(pnl >= 0);

      currentTooltip = `Total: ${currency} ${total}\nCash: ${currency} ${cash}\nP&L: ${currency} ${pnlFormatted}`;
    } else {
      currentTooltip = "Failed to fetch T212 data";
      currentIcon = getIconPath(true);
    }

    // Update tooltip and icon
    await systray.sendAction({
      type: "update-menu",
      menu: {
        icon: currentIcon,
        title: "T212",
        tooltip: currentTooltip,
        items: [
          {
            title: "T212 Account Monitor",
            tooltip: "Trading212 Account Info",
            enabled: false,
          },
          {
            title: "Open T212",
            tooltip: "Open Trading212 in browser",
            enabled: true,
          },
          {
            title: "<SEPARATOR>",
            tooltip: "",
            enabled: true,
          },
          {
            title: "Exit",
            tooltip: "Quit application",
            enabled: true,
          },
        ],
      },
    });
  }

  // Initial update
  await updateData();

  // Update every 30 seconds
  setInterval(updateData, 30000);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
