import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calculator, Plus, X, GripVertical } from "lucide-react";

interface Investment {
  id: string;
  name: string;
  initialAmount: number | "";
  monthlyContribution: number | "";
  expectedReturn: number | "";
}

import type { MomentumResponse } from "../types";

interface CalculatorPageProps {
  t: Record<string, string>;
  darkMode: boolean;
  data: MomentumResponse | null;
}

const INVESTMENT_COLORS = [
  { stroke: "#009668", dark: "#6ffbbe", gradient: "colorInv0" }, // Green
  { stroke: "#e6a100", dark: "#ffd54f", gradient: "colorInv1" }, // Yellow
  { stroke: "#ba1a1a", dark: "#ff6b6b", gradient: "colorInv2" }, // Red
  { stroke: "#8e24aa", dark: "#ce93d8", gradient: "colorInv3" }, // Purple
  { stroke: "#039be5", dark: "#81d4fa", gradient: "colorInv4" }, // Light Blue
  { stroke: "#d84315", dark: "#ff8a65", gradient: "colorInv5" }, // Orange
];

function createDefaultInvestment(name: string, monthly: number, returnPct: number): Investment {
  return {
    id: crypto.randomUUID(),
    name,
    initialAmount: 0,
    monthlyContribution: monthly,
    expectedReturn: returnPct,
  };
}

export function CalculatorPage({ t, darkMode, data }: CalculatorPageProps) {
  const defaultReturn = useMemo(() => {
    if (!data || !data.recommendation) return 8; // fallback
    const recommended = data.data.find(d => d.ticker === data.recommendation);
    return recommended ? Number(recommended.returnPct.toFixed(1)) : 8;
  }, [data]);

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem("gem_calc_investments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* fall through */ }
    }
    return [
      createDefaultInvestment(t.defaultEtf || "GEM Portfolio", 500, defaultReturn),
    ];
  });
  const [contributionIncrease, setContributionIncrease] = useState<number | "">(() => {
    const saved = localStorage.getItem("gem_calc_increase");
    return saved ? Number(saved) : 5;
  });
  const [years, setYears] = useState<number>(() => {
    const saved = localStorage.getItem("gem_calc_years");
    return saved ? Number(saved) : 25;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("gem_calc_investments", JSON.stringify(investments));
  }, [investments]);
  useEffect(() => {
    localStorage.setItem("gem_calc_increase", String(contributionIncrease));
  }, [contributionIncrease]);
  useEffect(() => {
    localStorage.setItem("gem_calc_years", String(years));
  }, [years]);

  const addInvestment = () => {
    setInvestments(prev => [
      ...prev,
      createDefaultInvestment(`${t.investmentLabel || "Investment"} ${prev.length + 1}`, 500, 6),
    ]);
  };

  const removeInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  };

  const updateInvestment = (id: string, field: keyof Investment, value: string | number) => {
    setInvestments(prev =>
      prev.map(inv => inv.id === id ? { ...inv, [field]: value } : inv)
    );
  };

  const chartData = useMemo(() => {
    const result: Record<string, number | string>[] = [];
    const _increase = Number(contributionIncrease) || 0;

    // Initialize per-investment tracking
    const state = investments.map(inv => ({
      id: inv.id,
      name: inv.name || "Unnamed",
      total: Number(inv.initialAmount) || 0,
      deposited: Number(inv.initialAmount) || 0,
      monthly: Number(inv.monthlyContribution) || 0,
      returnRate: Number(inv.expectedReturn) || 0,
    }));

    // Year 0
    const initialPoint: Record<string, number | string> = { year: 0 };
    let totalDeposited = 0;
    let totalValue = 0;
    state.forEach(s => {
      initialPoint[s.id] = s.total;
      totalDeposited += s.deposited;
      totalValue += s.total;
    });
    initialPoint.deposited = totalDeposited;
    initialPoint.total = totalValue;
    result.push(initialPoint);

    for (let y = 1; y <= years; y++) {
      const point: Record<string, number | string> = { year: y };
      let yearTotalDeposited = 0;
      let yearTotalValue = 0;

      state.forEach(s => {
        for (let m = 0; m < 12; m++) {
          s.total += s.monthly;
          s.total *= (1 + (s.returnRate / 100) / 12);
          s.deposited += s.monthly;
        }
        // Apply yearly contribution increase
        s.monthly *= (1 + (_increase / 100));

        point[s.id] = Math.round(s.total);
        yearTotalDeposited += s.deposited;
        yearTotalValue += s.total;
      });

      point.deposited = Math.round(yearTotalDeposited);
      point.total = Math.round(yearTotalValue);
      result.push(point);
    }

    return result;
  }, [investments, contributionIncrease, years]);

  const finalTotal = (chartData[chartData.length - 1]?.total as number) || 0;
  const finalDeposited = (chartData[chartData.length - 1]?.deposited as number) || 0;

  // Weighted average return for passive income estimate
  const weightedReturn = useMemo(() => {
    const totalMonthly = investments.reduce((sum, inv) => sum + (Number(inv.monthlyContribution) || 0), 0);
    if (totalMonthly === 0) return 0;
    return investments.reduce((sum, inv) => {
      const w = (Number(inv.monthlyContribution) || 0) / totalMonthly;
      return sum + w * (Number(inv.expectedReturn) || 0);
    }, 0);
  }, [investments]);

  const formatValue = (val: number) => {
    if (val >= 1e15) return `$${+(val / 1e15).toFixed(1)}${t.unitQ}`;
    if (val >= 1e12) return `$${+(val / 1e12).toFixed(1)}${t.unitT}`;
    if (val >= 1e9) return `$${+(val / 1e9).toFixed(1)}${t.unitB}`;
    if (val >= 1e6) return `$${+(val / 1e6).toFixed(1)}${t.unitM}`;
    if (val >= 1e3) return `$${+(val / 1e3).toFixed(1)}${t.unitK}`;
    return `$${val}`;
  };

  return (
    <motion.div
      key="calculator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-xl">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-headline leading-tight">{t.calcTitle}</h2>
          <p className="text-sm text-on-surface-variant">
            {t.totalValue}: <span className="font-bold text-primary">${finalTotal.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 space-y-5 lg:col-span-4 shadow-sm flex flex-col">
          {/* Per-investment inputs */}
          <div className="space-y-4 flex-1">
            {investments.map((inv, idx) => {
              const color = INVESTMENT_COLORS[idx % INVESTMENT_COLORS.length];
              const stroke = darkMode ? color.dark : color.stroke;
              return (
                <div key={inv.id} className="p-4 bg-surface-low rounded-xl space-y-3 relative group">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stroke }} />
                    <input
                      type="text"
                      value={inv.name}
                      onChange={(e) => updateInvestment(inv.id, "name", e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-primary"
                      placeholder={t.investmentLabel || "Investment name"}
                    />
                    {investments.length > 1 && (
                      <button
                        onClick={() => removeInvestment(inv.id)}
                        className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-red-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t.initialAmount}</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold">$</span>
                        <input
                          type="number"
                          value={inv.initialAmount}
                          onChange={(e) => updateInvestment(inv.id, "initialAmount", e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-surface rounded border border-outline-variant/20 pl-5 pr-2 py-1.5 outline-none focus:ring-1 focus:ring-primary/50 text-sm font-bold text-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t.monthlyShort || "/mo"}</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold">$</span>
                        <input
                          type="number"
                          value={inv.monthlyContribution}
                          onChange={(e) => updateInvestment(inv.id, "monthlyContribution", e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-surface rounded border border-outline-variant/20 pl-5 pr-2 py-1.5 outline-none focus:ring-1 focus:ring-primary/50 text-sm font-bold text-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t.returnShort || "Return"}</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={inv.expectedReturn}
                          onChange={(e) => updateInvestment(inv.id, "expectedReturn", e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-surface rounded border border-outline-variant/20 px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary/50 text-sm font-bold text-primary"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={addInvestment}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.addInvestment || "Add Investment"}
            </button>
          </div>

          {/* Global controls */}
          <div className="pt-4 border-t border-outline-variant/10 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                {t.contributionIncrease}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={contributionIncrease}
                  step="0.5"
                  onChange={(e) => setContributionIncrease(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-surface-low rounded-lg border border-outline-variant/20 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 text-lg font-headline font-bold text-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                {t.investmentYears}
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="text-right mt-1 font-bold text-primary">{years}</div>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-outline-variant/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-on-surface-variant">{t.totalDeposited}:</span>
              <span className="font-bold text-lg">${finalDeposited.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-tertiary mb-2">
              <span className="text-sm font-semibold">{t.performance}:</span>
              <span className="font-bold text-lg">+${(finalTotal - finalDeposited).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-primary">
              <span className="text-sm font-semibold">{t.passiveIncome}:</span>
              <span className="font-bold text-lg">${Math.round(finalTotal * weightedReturn / 100 / 12).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 lg:col-span-8 shadow-sm flex flex-col">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {/* Total portfolio gradient */}
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={darkMode ? "#58a6ff" : "#0052cc"} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={darkMode ? "#58a6ff" : "#0052cc"} stopOpacity={0} />
                  </linearGradient>
                  {/* Deposited gradient */}
                  <linearGradient id="colorDeposited" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={darkMode ? "#8b949e" : "#5d6b82"} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={darkMode ? "#8b949e" : "#5d6b82"} stopOpacity={0} />
                  </linearGradient>
                  {/* Per-investment gradients */}
                  {investments.map((inv, idx) => {
                    const color = INVESTMENT_COLORS[idx % INVESTMENT_COLORS.length];
                    const c = darkMode ? color.dark : color.stroke;
                    return (
                      <linearGradient key={inv.id} id={color.gradient} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#3d4452" : "#eceef0"} />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: darkMode ? "#b0b3b8" : "#45464d" }}
                  tickFormatter={(val) => `${val} ${t.yearLabel.charAt(0)}`}
                  minTickGap={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: darkMode ? "#b0b3b8" : "#45464d" }}
                  width={60}
                  tickFormatter={formatValue}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const totalVal = payload.find((p: any) => p.dataKey === 'total')?.value || 0;
                      const monthlyPassive = (totalVal as number) * (weightedReturn / 100) / 12;

                      return (
                        <div className="p-3 rounded-lg shadow-xl border border-outline-variant/20" style={{ backgroundColor: darkMode ? "#161a22" : "#ffffff" }}>
                          <p className="font-bold text-sm mb-3 border-b border-outline-variant/10 pb-2" style={{ color: darkMode ? "#c9d1d9" : "#24292f" }}>
                            {`${t.yearLabel} ${label}`}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex justify-between gap-6 text-xs font-bold mb-1" style={{ color: entry.color }}>
                              <span>{entry.name}:</span>
                              <span>${(entry.value as number).toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between gap-6 text-xs font-black mt-2 pt-2 border-t border-outline-variant/10 text-primary">
                            <span>{t.passiveIncome}:</span>
                            <span>${Math.round(monthlyPassive).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px", fontWeight: "bold" }} />

                {/* Total portfolio value — prominent area */}
                <Area
                  type="monotone"
                  dataKey="total"
                  name={t.totalValue}
                  stroke={darkMode ? "#58a6ff" : "#0052cc"}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />

                {/* Individual investment lines */}
                {investments.map((inv, idx) => {
                  const color = INVESTMENT_COLORS[idx % INVESTMENT_COLORS.length];
                  const c = darkMode ? color.dark : color.stroke;
                  return (
                    <Area
                      key={inv.id}
                      type="monotone"
                      dataKey={inv.id}
                      name={inv.name || `${t.investmentLabel || "Investment"} ${idx + 1}`}
                      stroke={c}
                      strokeWidth={1.5}
                      strokeDasharray="6 3"
                      fillOpacity={0}
                      fill={`url(#${color.gradient})`}
                    />
                  );
                })}

                {/* Total deposited — baseline */}
                <Area
                  type="monotone"
                  dataKey="deposited"
                  name={t.totalDeposited}
                  stroke={darkMode ? "#8b949e" : "#5d6b82"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDeposited)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
