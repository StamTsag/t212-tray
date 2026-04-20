import { describe, it, expect } from "vitest";
import { formatAccountTooltip } from "./tray.js";

interface AccountInfo {
  total: number;
  free: number;
  ppl: number;
  result: number;
  blocked: number;
  currencyCode?: string;
}

describe("formatAccountTooltip", () => {
  it("formats positive P&L correctly", () => {
    const info = {
      total: 10000,
      free: 5000,
      ppl: 500,
      result: 200,
      blocked: 0,
      currencyCode: "EUR",
    };

    const result = formatAccountTooltip(info);

    expect(result.tooltip).toContain("Total: EUR 10000.00");
    expect(result.tooltip).toContain("Cash: EUR 5000.00");
    expect(result.tooltip).toContain("P&L: EUR 500.00");
    expect(result.isUp).toBe(true);
  });

  it("formats negative P&L correctly", () => {
    const info = {
      total: 9000,
      free: 4000,
      ppl: -500,
      result: -200,
      blocked: 0,
      currencyCode: "USD",
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

  it("defaults currency to EUR when not provided", () => {
    const info = {
      total: 1000,
      free: 500,
      ppl: 0,
      result: 0,
      blocked: 0,
    };

    const result = formatAccountTooltip(info);

    expect(result.tooltip).toContain("EUR");
  });
});
