import { Activity, ArrowUpRight, BookOpen, CloudRain, Database, Droplets, ExternalLink, Leaf, Mail, MapPinned, Radio, ShieldAlert, Sprout } from "lucide-react";

const PRODUCT_LINKS = [
  {
    label: "Weather Overview",
    description: "Current conditions",
    href: "#weather",
  },
  {
    label: "Rain Intelligence",
    description: "Rainfall analytics",
    href: "#rain",
  },
  {
    label: "Island Radar",
    description: "30 weather stations",
    href: "#radar",
  },
  {
    label: "7-Day Forecast",
    description: "Weekly outlook",
    href: "#forecast",
  },
  {
    label: "Smart Farming",
    description: "Crop intelligence",
    href: "#farming",
  },
];

const OFFICIAL_RESOURCES = [
  {
    label: "Department of Meteorology",
    description: "Official Sri Lanka weather forecasts and observations",
    href: "https://meteo.gov.lk/en/",
    icon: CloudRain,
  },
  {
    label: "Agromet & Drought",
    description: "Agricultural weather and drought information",
    href: "https://meteo.gov.lk/index.php?Itemid=582&catid=2&id=188%3Adrought&lang=en&option=com_content&view=article",
    icon: Leaf,
  },
  {
    label: "Disaster Management Centre",
    description: "Weather warnings and emergency information",
    href: "https://www.dmc.gov.lk/index.php?lang=en",
    icon: ShieldAlert,
  },
  {
    label: "Sri Lanka Crop Calendar",
    description: "Official crop calendars from the Department of Agriculture",
    href: "https://doa.gov.lk/naicc-publications-crop-calender/",
    icon: Sprout,
  },
];

function ResourceCard({ resource }) {
  const Icon = resource.icon;

  return (
    <a href={resource.href} target="_blank" rel="noreferrer" className="group relative overflow-hidden rounded-[22px] border border-cyan-300/[0.06] bg-[#081c28] p-4 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/[0.16] hover:bg-[#0a2230]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/[0.04] blur-2xl transition-all duration-500 group-hover:bg-cyan-400/[0.08]" />

      <div className="relative z-10 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-cyan-300/[0.08] bg-cyan-300/[0.05] text-cyan-300 transition-all duration-500 group-hover:scale-105 group-hover:bg-cyan-300/[0.09]">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-bold leading-5 text-white/75 transition-colors duration-300 group-hover:text-white">{resource.label}</p>
            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
          </div>

          <p className="mt-1.5 text-[10px] leading-4 text-white/28">{resource.description}</p>
        </div>
      </div>
    </a>
  );
}

function ProductLink({ item, index }) {
  return (
    <a href={item.href} className="group flex items-center justify-between gap-3 border-b border-white/[0.045] py-3 transition-all duration-300 last:border-b-0 hover:pl-1">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-[8px] font-black tracking-[0.15em] text-white/15 transition-colors duration-300 group-hover:text-cyan-300/50">{String(index + 1).padStart(2, "0")}</span>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-white/55 transition-colors duration-300 group-hover:text-white">{item.label}</p>
          <p className="mt-0.5 text-[9px] text-white/20">{item.description}</p>
        </div>
      </div>

      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/10 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-cyan-300/[0.05] bg-[#04131d]">
      <div className="pointer-events-none absolute -left-[250px] top-[10%] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.045] blur-[170px]" />
      <div className="pointer-events-none absolute -right-[250px] bottom-[-200px] h-[600px] w-[600px] rounded-full bg-emerald-400/[0.035] blur-[180px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:70px_70px]" />

      <div className="relative z-10 mx-auto max-w-[1750px] px-5 pb-8 pt-10 md:px-8 lg:px-12 xl:px-16">

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[16px] border border-cyan-300/[0.08] bg-[#092433] text-cyan-300">
                <Droplets className="h-5 w-5" />
              </div>

              <div>
                <p className="text-lg font-black tracking-[-0.045em] text-white">SmartRain</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-cyan-300/45">Weather Intelligence</p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-xs leading-6 text-white/30">A weather intelligence platform focused on rainfall prediction, Sri Lankan meteorological stations and practical agricultural decision support.</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-full border border-cyan-300/[0.06] bg-[#081c28] px-3 py-2">
                <Radio className="h-3 w-3 text-cyan-300" />
                <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/35">Network Online</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-cyan-300/[0.06] bg-[#081c28] px-3 py-2">
                <Database className="h-3 w-3 text-cyan-300" />
                <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/35">ML Predictions</span>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3 border-t border-white/[0.045] pt-5">
              <a href="mailto:info@meteo.gov.lk" className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-[#081c28] text-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/[0.12] hover:bg-[#0a2432] hover:text-cyan-300" aria-label="Meteorology email">
                <Mail className="h-3.5 w-3.5" />
              </a>

              <a href="https://meteo.gov.lk/en/" target="_blank" rel="noreferrer" className="group flex h-9 items-center gap-2 rounded-xl border border-white/[0.05] bg-[#081c28] px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/[0.12] hover:bg-[#0a2432] hover:text-cyan-300">
                Official Weather
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <MapPinned className="h-3.5 w-3.5 text-cyan-300" />
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Explore SmartRain</h4>
            </div>

            <div className="border-t border-white/[0.045]">
              {PRODUCT_LINKS.map((item, index) => (
                <ProductLink key={item.label} item={item} index={index} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-cyan-300" />
                <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Sri Lanka Weather Resources</h4>
              </div>

              <span className="hidden text-[8px] font-bold uppercase tracking-[0.12em] text-white/15 sm:block">External sources</span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OFFICIAL_RESOURCES.map((resource) => (
                <ResourceCard key={resource.label} resource={resource} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-2 border-t border-white/[0.05] pt-6 sm:grid-cols-3">
          <div className="group flex items-center gap-3 rounded-[18px] border border-white/[0.04] bg-[#071923] px-4 py-3 transition-colors duration-300 hover:bg-[#091f2b]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/[0.05] text-cyan-300">
              <CloudRain className="h-3.5 w-3.5" />
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/20">Weather</p>
              <p className="mt-0.5 text-[10px] font-semibold text-white/45">Rainfall & local predictions</p>
            </div>
          </div>

          <div className="group flex items-center gap-3 rounded-[18px] border border-white/[0.04] bg-[#071923] px-4 py-3 transition-colors duration-300 hover:bg-[#091f2b]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-300/[0.05] text-sky-300">
              <Activity className="h-3.5 w-3.5" />
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/20">Forecast</p>
              <p className="mt-0.5 text-[10px] font-semibold text-white/45">Seven-day trend intelligence</p>
            </div>
          </div>

          <div className="group flex items-center gap-3 rounded-[18px] border border-white/[0.04] bg-[#071923] px-4 py-3 transition-colors duration-300 hover:bg-[#091f2b]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-300/[0.05] text-emerald-300">
              <Sprout className="h-3.5 w-3.5" />
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/20">Agriculture</p>
              <p className="mt-0.5 text-[10px] font-semibold text-white/45">Yala & Maha crop guidance</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-medium text-white/25">© {year} SmartRain. Weather intelligence for Sri Lanka.</p>
            <p className="mt-1 max-w-3xl text-[8px] leading-4 text-white/15">SmartRain predictions are informational. Always refer to official authorities for severe weather warnings and emergency instructions.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-35" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>

            <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/20">SmartRain system active</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes smart-footer-pulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }

          50% {
            opacity: 0.7;
            transform: scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .smart-footer-motion {
            animation: none !important;
          }
        }
      `}</style>
    </footer>
  );
}