import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import yf from "yahoo-finance2";
// The error "Call const yahooFinance = new YahooFinance() first" 
// indicates that we need to instantiate the class.
// In newer versions of yahoo-finance2, the default export might be the class or contain it.
const YahooFinance = (yf as any).default || yf;
const yahooFinance = new (YahooFinance as any)();

import { subMonths, format, startOfDay } from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_TICKERS = 20;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/momentum", async (req, res) => {
    try {
      const today = new Date();
      const defaultEndDate = subMonths(today, 1);
      const defaultStartDate = subMonths(defaultEndDate, 12);

      const reqStart = req.query.startDate as string;
      const reqEnd = req.query.endDate as string;

      // Validate date parameters
      if (reqStart && isNaN(new Date(reqStart).getTime())) {
        return res.status(400).json({ error: "Invalid startDate parameter" });
      }
      if (reqEnd && isNaN(new Date(reqEnd).getTime())) {
        return res.status(400).json({ error: "Invalid endDate parameter" });
      }

      const startDate = reqStart ? new Date(reqStart) : defaultStartDate;
      const endDate = reqEnd ? new Date(reqEnd) : defaultEndDate;

      // Get tickers from query or use defaults
      const queryTickers = req.query.tickers as string;
      const defaultTickers = ["IUSQ.DE", "EIMI.L", "CNDX.L", "IB01.L", "CBU0.L"];
      const tickers = queryTickers
        ? queryTickers.split(",").map(t => t.trim()).filter(Boolean)
        : defaultTickers;

      // Validate ticker count to prevent DoS
      if (tickers.length > MAX_TICKERS) {
        return res.status(400).json({ error: `Maximum ${MAX_TICKERS} tickers allowed per request` });
      }

      const results = await Promise.all(
        tickers.map(async (ticker) => {
          try {
            const history: any = await yahooFinance.historical(ticker, {
              period1: format(startDate, "yyyy-MM-dd"),
              period2: format(endDate, "yyyy-MM-dd"),
              interval: "1d",
            });

            if (!history || history.length < 2) {
              throw new Error(`Insufficient data for ${ticker}`);
            }

            const startPrice = history[0].adjClose || history[0].close;
            const endPrice = history[history.length - 1].adjClose || history[history.length - 1].close;
            const returnPct = ((endPrice / startPrice) - 1) * 100;

            // Get current price for display
            const quote: any = await yahooFinance.quote(ticker);

            return {
              ticker,
              name: quote.longName || ticker,
              returnPct,
              currentPrice: quote.regularMarketPrice,
              // Calculate cumulative return for each point in history
              history: history.map((h: any) => {
                const currentPointPrice = h.adjClose || h.close;
                const cumulativeReturn = ((currentPointPrice / startPrice) - 1) * 100;
                return {
                  date: format(new Date(h.date), "yyyy-MM-dd"),
                  dateShort: format(new Date(h.date), "MMM dd"),
                  price: currentPointPrice,
                  return: cumulativeReturn
                };
              })
            };
          } catch (err) {
            console.error(`Error fetching ${ticker}:`, err);
            return null;
          }
        })
      );

      const validResults = results.filter(r => r !== null) as any[];
      const failedTickers = tickers.filter(t => !validResults.find(r => r.ticker === t));

      // GEM Logic: simply pick the ticker with the highest trailing momentum
      let recommendation = "";
      if (validResults.length > 0) {
        const sorted = [...validResults].sort((a, b) => b.returnPct - a.returnPct);
        recommendation = sorted[0].ticker;
      }

      res.json({
        recommendation,
        data: validResults,
        failedTickers,
        dates: {
          start: format(startDate, "yyyy-MM-dd"),
          end: format(endDate, "yyyy-MM-dd"),
          today: format(today, "yyyy-MM-dd")
        }
      });
    } catch (error) {
      console.error("Momentum calculation error:", error);
      res.status(500).json({ error: "Failed to fetch momentum data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
