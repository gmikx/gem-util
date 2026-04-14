import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calculator } from "lucide-react";

interface CalculatorPageProps {
  t: any;
  darkMode: boolean;
}

export function CalculatorPage({ t, darkMode }: CalculatorPageProps) {
  const [initialAmount, setInitialAmount] = useState<number | "">(1000);
  const [monthlyContribution, setMonthlyContribution] = useState<number | "">(1000);
  const [contributionIncrease, setContributionIncrease] = useState<number | "">(5);
  const [expectedReturn, setExpectedReturn] = useState<number | "">(8);
  const [years, setYears] = useState<number>(25);

  const chartData = useMemo(() => {
    const result = [];
    const _initial = Number(initialAmount) || 0;
    const _monthly = Number(monthlyContribution) || 0;
    const _return = Number(expectedReturn) || 0;
    const _increase = Number(contributionIncrease) || 0;

    let currentTotal = _initial;
    let currentDeposited = _initial;

    result.push({
      year: 0,
      deposited: currentDeposited,
      value: currentTotal
    });

    let currentMonthly = _monthly;

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        currentTotal += currentMonthly;
        // monthly compound interest approximation
        currentTotal *= (1 + (_return / 100) / 12);
        currentDeposited += currentMonthly;
      }
      currentMonthly *= (1 + (_increase / 100));

      result.push({
        year: y,
        deposited: Math.round(currentDeposited),
        value: Math.round(currentTotal)
      });
    }
    return result;
  }, [initialAmount, monthlyContribution, expectedReturn, years, contributionIncrease]);

  const finalValue = chartData[chartData.length - 1]?.value || 0;
  const finalDeposited = chartData[chartData.length - 1]?.deposited || 0;
  const monthlyPassiveIncome = finalValue * (Number(expectedReturn) || 0) / 100 / 12;

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
            {t.totalValue}: <span className="font-bold text-primary">${finalValue.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 space-y-4 lg:col-span-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                {t.initialAmount}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-surface-low rounded-lg border border-outline-variant/20 px-8 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 text-lg font-headline font-bold text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                {t.monthlyContribution}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-surface-low rounded-lg border border-outline-variant/20 px-8 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 text-lg font-headline font-bold text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                {t.expectedReturn}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={expectedReturn}
                  step="0.5"
                  onChange={(e) => setExpectedReturn(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-surface-low rounded-lg border border-outline-variant/20 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 text-lg font-headline font-bold text-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">%</span>
              </div>
            </div>

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

          <div className="mt-8 pt-6 border-t border-outline-variant/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-on-surface-variant">{t.totalDeposited}:</span>
              <span className="font-bold text-lg">${finalDeposited.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-tertiary">
              <span className="text-sm font-semibold">{t.performance}:</span>
              <span className="font-bold text-lg">+${(finalValue - finalDeposited).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 lg:col-span-8 shadow-sm flex flex-col">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={darkMode ? "#58a6ff" : "#0052cc"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={darkMode ? "#58a6ff" : "#0052cc"} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDeposited" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={darkMode ? "#8b949e" : "#5d6b82"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={darkMode ? "#8b949e" : "#5d6b82"} stopOpacity={0} />
                  </linearGradient>
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
                  tickFormatter={(val) => {
                    if (val >= 1e15) return `$${+(val / 1e15).toFixed(1)}${t.unitQ}`;
                    if (val >= 1e12) return `$${+(val / 1e12).toFixed(1)}${t.unitT}`;
                    if (val >= 1e9)  return `$${+(val / 1e9).toFixed(1)}${t.unitB}`;
                    if (val >= 1e6)  return `$${+(val / 1e6).toFixed(1)}${t.unitM}`;
                    if (val >= 1e3)  return `$${+(val / 1e3).toFixed(1)}${t.unitK}`;
                    return `$${val}`;
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataValue = payload.find((p: any) => p.dataKey === 'value')?.value || 0;
                      const monthlyPassive = dataValue * ((Number(expectedReturn) || 0) / 100) / 12;

                      return (
                        <div className="p-3 rounded-lg shadow-xl border border-outline-variant/20" style={{ backgroundColor: darkMode ? "#161a22" : "#ffffff" }}>
                          <p className="font-bold text-sm mb-3 border-b border-outline-variant/10 pb-2" style={{ color: darkMode ? "#c9d1d9" : "#24292f" }}>
                            {`${t.yearLabel} ${label}`}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex justify-between gap-6 text-xs font-bold mb-1" style={{ color: entry.color }}>
                              <span>{entry.name}:</span>
                              <span>${entry.value.toLocaleString()}</span>
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
                <Area
                  type="monotone"
                  dataKey="value"
                  name={t.totalValue}
                  stroke={darkMode ? "#58a6ff" : "#0052cc"}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
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
