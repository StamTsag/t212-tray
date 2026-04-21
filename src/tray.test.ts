import { describe, it, expect } from "vitest";
import { formatAccountTooltip } from "./tray.js";

interface Cash {
  availableToTrade: number;
  inPies: number;
  reservedForOrders: number;
}

interface Investments {
  currentValue: number;
  realizedProfitLoss: number;
  totalCost: number;
  unrealizedProfitLoss: number;
}

interface AccountInfo {
  cash: Cash;
  currency: string;
  id: number;
  investments: Investments;
  totalValue: number;
}

describe("formatAccountTooltip", () => {
  it("formats positive P&L correctly", () => {
    const info: AccountInfo = {
      cash: {
        availableToTrade: 5000,
        inPies: 0,
        reservedForOrders: 0,
      },
      currency: "EUR",
      id: 1,
      investments: {
        currentValue: 5000,
        realizedProfitLoss: 0,
        totalCost: 4500,
        unrealizedProfitLoss: 500,
      },
      totalValue: 10000,
    };

    const result = formatAccountTooltip(info);

    expect(result.tooltip).toContain("Total: EUR 10000.00");
    expect(result.tooltip).toContain("Cash: EUR 5000.00");
    expect(result.tooltip).toContain("P&L: EUR 500.00");
    expect(result.isUp).toBe(true);
  });

  it("formats negative P&L correctly", () => {
    const info: AccountInfo = {
      cash: {
        availableToTrade: 4000,
        inPies: 0,
        reservedForOrders: 0,
      },
      currency: "USD",
      id: 1,
      investments: {
        currentValue: 5000,
        realizedProfitLoss: 0,
        totalCost: 5500,
        unrealizedProfitLoss: -500,
      },
      totalValue: 9000,
    };

    const result = formatAccountTooltip(info);

    expect(result.tooltip).toContain("Total: USD 9000.00");
    expect(result.tooltip).toContain("Cash: USD 4000.00");
    expect(result.tooltip).toContain("P&L: USD -500.00");
    expect(result.isUp).toBe(false);
  });

  it("handles null info", () => {
    const result = formatAccountTooltip(null);

    expect(result.tooltip).toBe("Failed to fetch T212 data");
    expect(result.isUp).toBe(true);
  });
});
