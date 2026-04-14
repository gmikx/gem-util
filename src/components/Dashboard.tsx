import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/src/lib/utils";
import type { MomentumResponse } from "../types";

const CHART_COLORS = [
  "#000000",  // overridden by darkMode below
  "#515f74",
  "#009668",
  "#ba1a1a",
  "#e6a100",
  "#8e24aa",
  "#039be5",
];

interface DashboardProps {
  data: MomentumResponse | null;
  tickers: string[];
  period: string;
  setPeriod: (p: string) => void;
  language: "pl" | "en";
  darkMode: boolean;
  newTicker: string;
  setNewTicker: (v: string) => void;
  handleAddTicker: (tickerToAdd?: string) => Promise<void>;
  handleRemoveTicker: (ticker: string) => void;
  handleRestoreDefaults: () => Promise<void>;
  t: Record<string, string>;
}

export function Dashboard({
  data,
  tickers,
  period,
  setPeriod,
  language,
  darkMode,
  newTicker,
  setNewTicker,
  handleAddTicker,
  handleRemoveTicker,
  handleRestoreDefaults,
  t,
}: DashboardProps) {
  const recommendedData = data?.data.find(d => d.ticker === data.recommendation);

  return (
    <div className="space-y-8">
      {/* Hero Recommendation Section */}
      <section className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 p-10 bg-surface rounded-xl shadow-sm border border-outline-variant/5 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary text-surface text-[10px] font-bold rounded-full tracking-[0.2em] font-headline">{t.signals}</span>
              <span className="text-on-surface-variant font-headline text-xs">{t.lastUpdated}: {data?.dates.today}</span>
            </div>
            <h2 className="font-headline font-black text-on-surface text-2xl mb-2 tracking-tight uppercase">{t.recommendation}</h2>
            {data && data.data.length > 0 ? (
              <div className="flex flex-col items-start gap-4">
                <span className="font-headline font-extrabold text-7xl sm:text-[100px] leading-none text-primary tracking-tighter break-all">
                  {data.recommendation}
                </span>
                <div className="flex flex-col items-start">
                  <span className="tonal-gradient-success text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 mb-2">
                    <TrendingUp className="w-3 h-3" />
                    {t.strongBuy}
                  </span>
                  <span className="text-on-surface-variant text-sm font-medium">
                    {recommendedData?.name}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-on-surface-variant text-lg mt-4 max-w-sm">
                {language === "pl"
                  ? "Dodaj przynajmniej jeden fundusz ETF do porównania, aby uzyskać rekomendację."
                  : "Please add at least one ETF ticker to compare first."}
              </p>
            )}
          </div>
          <div className="relative z-10 flex items-center gap-6 mt-8 flex-wrap">
            {data && data.data.length > 0 && (
              <>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">{t.momentumPeriod}</p>
                  <p className="text-xl font-headline font-bold text-primary">{data.dates.start} — {data.dates.end}</p>
                </div>
                <div className="hidden sm:block w-px h-10 bg-outline-variant/30"></div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">{t.relativeStr}</p>
                  <p className="text-xl font-headline font-bold text-primary">
                    +{recommendedData?.returnPct !== undefined ? recommendedData.returnPct.toFixed(2) : "0.00"}%
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ticker Management Panel — renders from tickers[] state to fix zombie ticker bug */}
        <div className="col-span-12 lg:col-span-4 bg-surface rounded-xl p-8 flex flex-col shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold text-lg">{t.manageTickers}</h3>
            <button
              onClick={handleRestoreDefaults}
              className="text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
            >
              {t.restoreDefaults}
            </button>
          </div>
          <div className="space-y-4 mb-8">
            {tickers.map((tickerSymbol) => {
              const resolved = data?.data.find(d => d.ticker === tickerSymbol);
              const isFailed = data?.failedTickers?.includes(tickerSymbol);
              const maxLen = Math.max(5, ...tickers.map(t => t.length));
              return (
                <div key={tickerSymbol} className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  isFailed ? "bg-red-500/10 border border-red-500/20" : "bg-surface-low"
                )}>
                  <div className="flex items-center gap-3 flex-1 overflow-hidden pr-2">
                    <span style={{ width: `${maxLen + 1.5}ch` }} className="h-8 shrink-0 flex items-center justify-center bg-surface rounded font-bold text-xs shadow-sm">{tickerSymbol}</span>
                    {isFailed ? (
                      <span className="text-sm font-medium text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {language === "pl" ? "Nie znaleziono" : "Not found"}
                      </span>
                    ) : (
                      <span className="text-sm font-medium truncate">{resolved?.name || tickerSymbol}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveTicker(tickerSymbol)}
                    className="text-on-surface-variant hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-auto">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t.addNew}</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-surface-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-primary"
                placeholder="e.g. EIMI"
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTicker()}
              />
              <button
                onClick={() => handleAddTicker()}
                className="bg-primary text-surface p-3 rounded hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Chart Section */}
      <section className="bg-surface rounded-xl p-8 shadow-sm border border-outline-variant/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h3 className="font-headline font-bold text-xl mb-1">{t.performance}</h3>
            <p className="text-on-surface-variant text-sm font-medium">{t.trailing}</p>
          </div>
          <div className="flex gap-2">
            {["1M", "3M", "12M", "YTD"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p.toLowerCase())}
                className={cn(
                  "px-4 py-1.5 rounded text-xs font-bold border border-outline-variant/10 transition-all",
                  period === p.toLowerCase() ? "bg-primary text-surface shadow-sm" : "bg-surface-low hover:bg-surface-container"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-80">
          {data && data.data.length > 0 && data.data[0].history ? (
            <ResponsiveContainer width="100%" height="100%" key={period}>
              <LineChart data={buildChartData(data, period, language)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#3d4452" : "#eceef0"} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: darkMode ? "#b0b3b8" : "#45464d" }}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: darkMode ? "#b0b3b8" : "#45464d" }}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `${val}%`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: darkMode ? "#161a22" : "#ffffff", borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  formatter={(val: number, name: string) => [`${val.toFixed(2)}%`, name]}
                  itemSorter={(item: any) => -(item.value as number)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                {data.data.map((d, i) => {
                  const colors = [...CHART_COLORS];
                  colors[0] = darkMode ? "#ffffff" : "#000000";
                  return (
                    <Line
                      key={d.ticker}
                      type="monotone"
                      dataKey={d.ticker}
                      stroke={colors[i % colors.length]}
                      strokeWidth={d.ticker === data.recommendation ? 3 : 1.5}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-low rounded-lg">
              <p className="text-on-surface-variant">{t.noData}</p>
            </div>
          )}
        </div>
      </section>

      {/* Data Grid Section */}
      <section className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline-variant/5">
        <div className="p-8 border-b border-surface-low flex justify-between items-center">
          <h3 className="font-headline font-bold text-xl">{t.analytics}</h3>
          <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
            <Download className="w-4 h-4" />
            {t.export}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t.ticker}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t.momentum}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t.price}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-low">
              {data?.data.map((ticker) => (
                <tr key={ticker.ticker} className="hover:bg-surface-low/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-bold text-primary font-headline">{ticker.ticker}</span>
                    <p className="text-xs text-on-surface-variant">{ticker.name}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-bold font-headline",
                        ticker.returnPct > 0 ? "text-tertiary" : "text-red-500"
                      )}>
                        {ticker.returnPct > 0 ? "+" : ""}{ticker.returnPct.toFixed(2)}%
                      </span>
                      {ticker.returnPct > 0 ? <TrendingUp className="w-4 h-4 text-tertiary" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold font-headline">${ticker.currentPrice?.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded-full uppercase",
                      ticker.ticker === data?.recommendation
                        ? "bg-tertiary text-white"
                        : ticker.returnPct > 0 ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant"
                    )}>
                      {ticker.ticker === data?.recommendation ? t.activeLong : ticker.returnPct > 0 ? t.watchlist : t.underperform}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/** Build chart data points from the API response, filtered by the selected period */
function buildChartData(data: MomentumResponse, period: string, language: string) {
  const refHistory = data.data[0].history;
  const lastDateStr = refHistory[refHistory.length - 1]?.date;
  const baselineDate = lastDateStr ? new Date(lastDateStr) : new Date();

  let cutoff = new Date(baselineDate);
  if (period === "1m") cutoff.setMonth(baselineDate.getMonth() - 1);
  else if (period === "3m") cutoff.setMonth(baselineDate.getMonth() - 3);
  else if (period === "ytd") cutoff = new Date(baselineDate.getFullYear(), 0, 1);
  else cutoff = new Date(0); // 12m — show all data the backend provided

  const cutoffTime = cutoff.getTime();
  let startIndex = refHistory.findIndex((h) => new Date(h.date).getTime() >= cutoffTime);
  if (startIndex === -1) startIndex = 0;

  const dateFormatter = new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-US", {
    day: "numeric",
    month: "short",
    year: language === "pl" ? "numeric" : undefined,
  });

  return refHistory.slice(startIndex).map((_, idx) => {
    const originalIdx = startIndex + idx;
    const rawDateString = refHistory[originalIdx]?.date;
    const formattedDate = rawDateString ? dateFormatter.format(new Date(rawDateString)) : "";

    const point: Record<string, string | number> = { name: formattedDate };
    data.data.forEach((d) => {
      if (d.history?.[originalIdx] && d.history?.[startIndex]) {
        const currentPrice = (d.history[originalIdx] as any).close || d.history[originalIdx].price;
        const startPrice = (d.history[startIndex] as any).close || d.history[startIndex].price;
        point[d.ticker] = startPrice > 0 ? ((currentPrice / startPrice) - 1) * 100 : 0;
      }
    });
    return point;
  });
}
