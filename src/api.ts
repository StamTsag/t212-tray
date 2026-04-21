import * as https from "https";
import { config, API_TIMEOUT_MS } from "./config.js";

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

export function fetchAccountInfo(): Promise<AccountInfo | null> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: config.baseUrl,
      path: "/api/v0/equity/account/summary",
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(config.credentials).toString("base64")}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk: string) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const accountInfo: AccountInfo = JSON.parse(data);
            resolve(accountInfo);
          } catch (error) {
            console.error("Failed to parse API response:", error);
            resolve(null);
          }
        } else {
          console.error(`API request failed with status ${res.statusCode}`);
          resolve(null);
        }
      });
    });

    req.on("error", (error) => {
      console.error("API request error:", error.message);
      reject(error);
    });

    req.setTimeout(API_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error("API request timed out"));
    });

    req.end();
  });
}
