import { useState, useEffect } from "react";
import {
  TrendingDown,
  LineChart as AutoGraph,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import type { MomentumResponse } from "./types";
import { translations } from "./locales/translations";
import { Dashboard } from "./components/Dashboard";
import { AboutPage } from "./components/AboutPage";
import { CalculatorPage } from "./components/CalculatorPage";

type Tab = "dashboard" | "about" | "calculator";

const DEFAULT_TICKERS = ["IUSQ.DE", "EIMI.L", "CNDX.L", "IB01.L", "CBU0.L"];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<MomentumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickers, setTickers] = useState<string[]>(() => {
    const saved = localStorage.getItem("gem_tickers");
    return saved ? JSON.parse(saved) : DEFAULT_TICKERS;
  });
  const [newTicker, setNewTicker] = useState("");
  const [language, setLanguage] = useState<"pl" | "en">(() => {
    return (localStorage.getItem("gem_lang") as "pl" | "en") || "pl";
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("gem_theme") !== "light";
  });
  const [period, setPeriod] = useState<string>(() => {
    return localStorage.getItem("gem_period") || "12m";
  });

  const t = translations[language];

  // ── Data fetching ──

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── localStorage sync ──

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
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("gem_period", period);
  }, [period]);

  // ── Ticker handlers ──

  const handleRestoreDefaults = async () => {
    setTickers(DEFAULT_TICKERS);
    await fetchData(DEFAULT_TICKERS);
  };

  const handleAddTicker = async (tickerToAdd?: string) => {
    const ticker = (tickerToAdd || newTicker).toUpperCase().trim();
    if (!ticker || tickers.includes(ticker)) return;

    const nextTickers = [...tickers, ticker];
    setTickers(nextTickers);
    setNewTicker("");
    await fetchData(nextTickers);
  };

  const handleRemoveTicker = (tickerToRemove: string) => {
    const nextTickers = tickers.filter(t => t !== tickerToRemove);
    setTickers(nextTickers);

    if (data) {
      const nextData = data.data.filter(d => d.ticker !== tickerToRemove);
      const nextFailed = (data.failedTickers || []).filter(t => t !== tickerToRemove);

      // Recalculate recommendation: simply pick top performer
      let recommendation = "";
      if (nextData.length > 0) {
        const sorted = [...nextData].sort((a, b) => b.returnPct - a.returnPct);
        recommendation = sorted[0].ticker;
      }

      setData({
        ...data,
        recommendation,
        data: nextData,
        failedTickers: nextFailed,
      });
    }
  };

  // ── Render ──

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

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: t.dashboard },
    { key: "about", label: t.about },
    { key: "calculator", label: t.calculator },
  ];

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
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "font-bold pb-1 font-headline text-sm uppercase tracking-wide transition-all",
                  activeTab === tab.key
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === "pl" ? "en" : "pl")}
            className="p-2 hover:bg-surface-low transition-colors rounded-lg flex items-center gap-2"
            title="Change Language"
          >
            <Languages className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase">{language}</span>
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
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
            >
              <Dashboard
                data={data}
                tickers={tickers}
                period={period}
                setPeriod={setPeriod}
                language={language}
                darkMode={darkMode}
                newTicker={newTicker}
                setNewTicker={setNewTicker}
                handleAddTicker={handleAddTicker}
                handleRemoveTicker={handleRemoveTicker}
                handleRestoreDefaults={handleRestoreDefaults}
                t={t}
              />
            </motion.div>
          ) : activeTab === "about" ? (
            <AboutPage t={t} setActiveTab={setActiveTab} />
          ) : (
            <CalculatorPage t={t} darkMode={darkMode} data={data} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
