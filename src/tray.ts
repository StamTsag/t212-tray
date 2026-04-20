import * as os from "os";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OPEN_TRADING212_URL = "https://app.trading212.com/";

// systray2 types are a mess, just use what we need
interface AccountInfo {
  total: number;
  free: number;
  ppl: number;
  result: number;
  blocked: number;
  currencyCode?: string;
}

function getIconPath(isUp: boolean): string {
  const platform = os.platform();
  const iconName = isUp ? "up" : "down";
  const ext = platform === "win32" ? ".ico" : ".png";
  return join(__dirname, "../icons", `${iconName}${ext}`);
}

function createMenuItems() {
  return [
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
  ];
}

export function buildTrayConfig(tooltip: string, isUp: boolean) {
  return {
    icon: getIconPath(isUp),
    title: "T212",
    tooltip,
    isTemplateIcon: os.platform() === "darwin",
    items: createMenuItems(),
  };
}

export function openTrading212(): void {
  const platform = os.platform();
  const command =
    platform === "win32" ? "cmd" : platform === "darwin" ? "open" : "xdg-open";
  const args =
    platform === "win32"
      ? ["/c", "start", OPEN_TRADING212_URL]
      : [OPEN_TRADING212_URL];

  spawn(command, args, { detached: true, stdio: "ignore" });
}

export function formatAccountTooltip(info: AccountInfo | null): {
  tooltip: string;
  isUp: boolean;
} {
  if (!info) {
    return { tooltip: "Failed to fetch T212 data", isUp: true };
  }

  const total = info.total.toFixed(2);
  const cash = info.free.toFixed(2);
  const pnl = info.ppl;
  const pnlFormatted = pnl.toFixed(2);
  const currency = info.currencyCode || "EUR";

  return {
    tooltip: `Total: ${currency} ${total}\nCash: ${currency} ${cash}\nP&L: ${currency} ${pnlFormatted}`,
    isUp: pnl >= 0,
  };
}
