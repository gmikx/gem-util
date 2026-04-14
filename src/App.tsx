import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Download,
  LineChart as AutoGraph,
  Moon,
  Sun,
  Languages
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { cn } from "@/src/lib/utils";

interface MomentumData {
  ticker: string;
  name: string;
  returnPct: number;
  currentPrice: number;
  history: { date: string; dateShort?: string; price: number; return?: number }[];
}

interface MomentumResponse {
  recommendation: string;
  data: MomentumData[];
  dates: {
    start: string;
    end: string;
    today: string;
  };
}

import { translations } from "./locales/translations";
import { AboutPage } from "./components/AboutPage";
import { CalculatorPage } from "./components/CalculatorPage";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "about" | "calculator">("dashboard");
  const [data, setData] = useState<MomentumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickers, setTickers] = useState<string[]>(() => {
    const saved = localStorage.getItem("gem_tickers");
    return saved ? JSON.parse(saved) : ["IUSQ.DE", "EIMI.L", "CNDX.L", "IB01.L", "CBU0.L"];
  });
  const [newTicker, setNewTicker] = useState("");
  const [language, setLanguage] = useState<"pl" | "en">(() => {
    return (localStorage.getItem("gem_lang") as "pl" | "en") || "pl";
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("gem_theme") === "dark";
  });
  const [period, setPeriod] = useState<string>(() => {
    return localStorage.getItem("gem_period") || "12m";
  });

  const t = translations[language];

  const fetchData = async (currentTickers: string[]) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/momentum?tickers=${currentTickers.join(",")}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tickers);
  }, []); // Initial load only. Tickers are handled by handleAdd/Remove

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("gem_tickers", JSON.stringify(tickers));
  }, [tickers]);

  useEffect(() => {
    localStorage.setItem("gem_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("gem_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("gem_period", period);
  }, [period]);

  const handleRestoreDefaults = async () => {
    const defaultTickers = ["IUSQ.DE", "EIMI.L", "CNDX.L", "IB01.L", "CBU0.L"];
    setTickers(defaultTickers);
    await fetchData(defaultTickers);
  };

  const handleAddTicker = async (tickerToAdd?: string) => {
    const ticker = (tickerToAdd || newTicker).toUpperCase().trim();
    if (!ticker) return;
    if (tickers.includes(ticker)) return;

    const nextTickers = [...tickers, ticker];
    setTickers(nextTickers);
    setNewTicker("");
    await fetchData(nextTickers);
  };

  const handleRemoveTicker = (tickerToRemove: string) => {
    const nextTickers = tickers.filter(t => t !== tickerToRemove);
    setTickers(nextTickers);

    // Update data locally without refetching
    if (data) {
      const nextData = data.data.filter(d => d.ticker !== tickerToRemove);

      // Recalculate recommendation if needed
      let recommendation = "CBU0.L";
      const ivv = nextData.find(r => r.ticker === "IUSQ.DE");
      const vxus = nextData.find(r => r.ticker === "EIMI.L");
      const bil = nextData.find(r => r.ticker === "IB01.L");

      if (ivv && vxus && bil) {
        if (ivv.returnPct > vxus.returnPct && ivv.returnPct > bil.returnPct) {
          recommendation = "IUSQ.DE";
        } else if (vxus.returnPct > ivv.returnPct && vxus.returnPct > bil.returnPct) {
          recommendation = "EIMI.L";
        }
      } else if (nextData.length > 0) {
        const sorted = [...nextData].sort((a, b) => b.returnPct - a.returnPct);
        recommendation = sorted[0].ticker;
      } else {
        recommendation = "";
      }

      setData({
        ...data,
        recommendation,
        data: nextData
      });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(language === "pl" ? "en" : "pl");
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-medium">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 bg-surface rounded-xl shadow-sm border border-outline-variant/20 text-center max-w-md">
          <TrendingDown className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t.error}</h2>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-md font-bold hover:bg-slate-800 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary font-sans antialiased transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-8 py-6 bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
              <AutoGraph className="text-surface w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-headline leading-tight">GemUtil</h1>
              <p className="text-[10px] text-on-surface-variant font-medium tracking-wider uppercase">Global Equity Momentum</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "font-bold pb-1 font-headline text-sm uppercase tracking-wide transition-all",
                activeTab === "dashboard" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
              )}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={cn(
                "font-bold pb-1 font-headline text-sm uppercase tracking-wide transition-all",
                activeTab === "about" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
              )}
            >
              {t.about}
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={cn(
                "font-bold pb-1 font-headline text-sm uppercase tracking-wide transition-all",
                activeTab === "calculator" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
              )}
            >
              {t.calculator}
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="p-2 hover:bg-surface-low transition-colors rounded-lg flex items-center gap-2"
            title="Change Language"
          >
            <Languages className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase">{language}</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-surface-low transition-colors rounded-lg"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
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
                    {data && data.data && data.data.length > 0 ? (
                      <div className="flex flex-col items-start gap-4">
                        <span className="font-headline font-extrabold text-7xl sm:text-[100px] leading-none text-primary tracking-tighter break-all">
                          {data?.recommendation}
                        </span>
                        <div className="flex flex-col items-start">
                          <span className="tonal-gradient-success text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 mb-2">
                            <TrendingUp className="w-3 h-3" />
                            {t.strongBuy}
                          </span>
                          <span className="text-on-surface-variant text-sm font-medium">
                            {data?.data.find(d => d.ticker === data.recommendation)?.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-on-surface-variant text-lg mt-4 max-w-sm">
                        {language === "pl" ? "Dodaj przynajmniej jeden fundusz ETF do porównania, aby uzyskać rekomendację." : "Please add at least one ETF ticker to compare first."}
                      </p>
                    )}
                  </div>
                  <div className="relative z-10 flex items-center gap-6 mt-8 flex-wrap">
                    {data && data.data && data.data.length > 0 && (
                      <>
                        <div>
                          <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">{t.momentumPeriod}</p>
                          <p className="text-xl font-headline font-bold text-primary">{data?.dates.start} — {data?.dates.end}</p>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-outline-variant/30"></div>
                        <div>
                          <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">{t.relativeStr}</p>
                          <p className="text-xl font-headline font-bold text-primary">
                            +{data.data.find(d => d.ticker === data.recommendation)?.returnPct !== undefined ? data.data.find(d => d.ticker === data.recommendation)?.returnPct.toFixed(2) : "0.00"}%
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
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
                    {data?.data.map((ticker, _, arr) => {
                      const maxLen = Math.max(5, ...arr.map(t => t.ticker.length));
                      return (
                        <div key={ticker.ticker} className="flex items-center justify-between p-3 bg-surface-low rounded-lg">
                          <div className="flex items-center gap-3 flex-1 overflow-hidden pr-2">
                            <span style={{ width: `${maxLen + 1.5}ch` }} className="h-8 shrink-0 flex items-center justify-center bg-surface rounded font-bold text-xs shadow-sm">{ticker.ticker}</span>
                            <span className="text-sm font-medium truncate">{ticker.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveTicker(ticker.ticker)}
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
                        onClick={handleAddTicker}
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
                  {data && data.data && data.data.length > 0 && data.data[0].history ? (
                    <ResponsiveContainer width="100%" height="100%" key={period}>
                      <LineChart data={(() => {
                        const lastDateStr = data.data[0].history[data.data[0].history.length - 1]?.date;
                        const baselineDate = lastDateStr ? new Date(lastDateStr) : new Date();
                        let cutoff = new Date(baselineDate);
                        if (period === "1m") cutoff.setMonth(baselineDate.getMonth() - 1);
                        else if (period === "3m") cutoff.setMonth(baselineDate.getMonth() - 3);
                        else if (period === "ytd") cutoff = new Date(baselineDate.getFullYear(), 0, 1);
                        else cutoff.setFullYear(baselineDate.getFullYear() - 10);

                        const cutoffTime = cutoff.getTime();
                        let startIndex = data.data[0].history.findIndex((h: any) => new Date(h.date).getTime() >= cutoffTime);
                        if (startIndex === -1) startIndex = 0;

                        const dateFormatter = new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-US", {
                          day: "numeric",
                          month: "short",
                          year: language === "pl" ? "numeric" : undefined
                        });

                        return data.data[0].history.slice(startIndex).map((_, idx) => {
                          const originalIdx = startIndex + idx;
                          const rawDateString = data.data[0].history[originalIdx]?.date;
                          const formattedDate = rawDateString ? dateFormatter.format(new Date(rawDateString)) : "";

                          const point: any = { name: formattedDate };
                          data.data.forEach(d => {
                            if (d.history && d.history[originalIdx] && d.history[startIndex]) {
                              const currentPrice = d.history[originalIdx].close || d.history[originalIdx].price;
                              const startPrice = d.history[startIndex].close || d.history[startIndex].price;
                              point[d.ticker] = startPrice > 0 ? ((currentPrice / startPrice) - 1) * 100 : 0;
                            }
                          });
                          return point;
                        });
                      })()}>
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
                          const customColors = [
                            darkMode ? "#ffffff" : "#000000",
                            "#515f74",
                            "#009668",
                            "#ba1a1a",
                            "#e6a100",
                            "#8e24aa",
                            "#039be5"
                          ];
                          return (
                            <Line
                              key={d.ticker}
                              type="monotone"
                              dataKey={d.ticker}
                              stroke={customColors[i % customColors.length]}
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
                              ticker.ticker === data.recommendation
                                ? "bg-tertiary text-white"
                                : ticker.returnPct > 0 ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant"
                            )}>
                              {ticker.ticker === data.recommendation ? t.activeLong : ticker.returnPct > 0 ? t.watchlist : t.underperform}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>
          ) : activeTab === "about" ? (
            <AboutPage t={t} setActiveTab={setActiveTab} />
          ) : (
            <CalculatorPage t={t} darkMode={darkMode} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
