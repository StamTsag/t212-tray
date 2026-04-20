#!/usr/bin/env node

import { fetchAccountInfo } from "./api.js";
import {
  buildTrayConfig,
  formatAccountTooltip,
  openTrading212,
} from "./tray.js";

async function main() {
  // systray2 exports are weird - need to dig out the default
  const systrayModule = await import("systray2");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SysTray = (systrayModule as any).default?.default ?? (systrayModule as any).default;

  let currentConfig = buildTrayConfig("Loading T212 data...", true);

  const systray = new SysTray({
    menu: {
      ...currentConfig,
      debug: false,
    },
  });

  systray.onClick(async (action: { seq_id: number }) => {
    if (action.seq_id === 1) {
      openTrading212();
    } else if (action.seq_id === 3) {
      await systray.kill();
    }
  });

  await systray.ready();

  async function updateData() {
    try {
      const info = await fetchAccountInfo();
      const { tooltip, isUp } = formatAccountTooltip(info);
      currentConfig = buildTrayConfig(tooltip, isUp);

      await systray.sendAction({
        type: "update-menu",
        menu: {
          ...currentConfig,
          debug: false,
        },
      });
    } catch (error) {
      console.error("Failed to update data:", error);
      currentConfig = buildTrayConfig("Error fetching T212 data", true);
    }
  }

  await updateData();
  setInterval(updateData, 30000);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
