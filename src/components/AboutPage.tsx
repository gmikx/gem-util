import { TrendingUp, Globe as Language, Scale as Rule, Network as Hub, Quote as FormatQuote } from "lucide-react";
import { motion } from "motion/react";

interface AboutPageProps {
  t: Record<string, string>;
  setActiveTab: (tab: "dashboard" | "about" | "calculator") => void;
}

export function AboutPage({ t, setActiveTab }: AboutPageProps) {
  return (
    <motion.div
      key="about"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-16"
    >
      {/* Hero Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <span className="font-headline font-semibold text-secondary tracking-widest text-xs uppercase mb-4 block">{t.philosophy}</span>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-primary leading-[0.9] mb-8">
              {t.framework}
            </h1>
          </div>
          <div className="md:col-span-4 pb-4">
            <p className="text-on-surface-variant text-lg leading-relaxed font-light">
              {t.adaptive}
            </p>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface p-10 rounded-xl flex flex-col justify-between min-h-[400px] border border-outline-variant/5">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t.whatIsGem}</h2>
            <div className="space-y-4 max-w-2xl">
              <p className="text-on-surface text-lg leading-relaxed">
                {t.gemDesc1}
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                {t.gemDesc2}
              </p>
            </div>
          </div>
          <div className="mt-8 flex gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-wider">
              <Language className="w-4 h-4" />
              {t.globalExposure}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-tertiary-fixed text-tertiary rounded-full text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> {t.performanceFocused}
            </div>
          </div>
        </div>

        <div className="bg-surface-low rounded-xl relative overflow-hidden flex items-center justify-center group border border-outline-variant/5">
          <div className="absolute inset-0 z-0">
            <img
              alt="Financial chart overlay"
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              src="https://picsum.photos/seed/chart/600/800"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 text-center p-8">
            <Hub className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t.systemicPrecision}</h3>
            <p className="text-sm text-on-surface-variant">{t.emotionalBias}</p>
          </div>
        </div>

        <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/5">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Rule className="w-5 h-5" />
            {t.rules}
          </h3>
          <ul className="space-y-8">
            {[
              { id: "01", title: t.rule1Title, desc: t.rule1Desc },
              { id: "02", title: t.rule2Title, desc: t.rule2Desc },
              { id: "03", title: t.rule3Title, desc: t.rule3Desc }
            ].map((rule) => (
              <li key={rule.id} className="flex gap-4">
                <span className="text-2xl font-black text-outline-variant opacity-50">{rule.id}</span>
                <div>
                  <p className="font-bold text-sm">{rule.title}</p>
                  <p className="text-sm text-on-surface-variant">{rule.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 bg-surface p-10 rounded-xl border border-outline-variant/5">
          <h3 className="text-2xl font-bold mb-10">{t.whyWorks}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className="font-bold text-primary mb-3">{t.adaptiveIntel}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {t.adaptiveDesc}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-3">{t.crashProtection}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {t.crashDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric Quote Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5">
          <img
            alt="Financial analysis desk"
            className="w-full aspect-[4/5] object-cover rounded-xl shadow-lg"
            src="https://picsum.photos/seed/desk/800/1000"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="md:col-span-6 md:col-start-7 py-12">
          <FormatQuote className="w-12 h-12 text-outline-variant mb-6" />
          <blockquote className="text-4xl font-headline font-light leading-tight mb-8">
            "{t.quote}"
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <cite className="not-italic font-bold text-sm uppercase tracking-tighter">GEM Strategy Document • GemUtil</cite>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
