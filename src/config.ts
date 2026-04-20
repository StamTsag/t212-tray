import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env"), quiet: true });

const API_KEY = process.env.TRADING212_API_KEY;
const API_SECRET = process.env.TRADING212_API_SECRET;
const BASE_URL = process.env.TRADING212_BASE_URL || "live.trading212.com";

if (!API_KEY || !API_SECRET) {
  console.error(
    "Error: TRADING212_API_KEY and TRADING212_API_SECRET must be set in .env file"
  );
  process.exit(1);
}

export const UPDATE_INTERVAL_MS = 30000;
export const API_TIMEOUT_MS = 10000;

export const config = {
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  baseUrl: BASE_URL,
  credentials: `${API_KEY}:${API_SECRET}`,
};
