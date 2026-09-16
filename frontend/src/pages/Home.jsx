import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDown, CloudRain, Droplets, LocateFixed, MapPinned, Navigation, Sparkles, Sprout } from "lucide-react";

import WeatherHero from "../components/weather/WeatherHero.jsx";
import WeatherStatsStrip from "../components/weather/WeatherStatsStrip.jsx";
import DayToggle from "../components/weather/DayToggle.jsx";
import SeasonTabs from "../components/farming/SeasonTabs.jsx";
import CropList from "../components/farming/CropList.jsx";
import CityModal from "../components/weather/CityModal.jsx";
import WeatherMap from "../components/weather/WeatherMap.jsx";
import SkyBackdrop from "../components/weather/sky/SkyBackdrop.jsx";
import DailyForecastList from "../components/weather/DailyForecastList.jsx";
import WeeklyForecastChart from "../components/weather/WeeklyForecastChart.jsx";
import Footer from "../components/layout/Footer.jsx";

import AnimatedContent from "../components/reactbits/AnimatedContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";

import useWeatherData from "../hooks/useWeatherData.js";
import useCropRecommendation from "../hooks/useCropRecommendation.js";

import { resolveCondition } from "../utils/weatherCondition.js";
import { fetchCities } from "../services/api.js";

const SECTIONS = [
  {
    id: "weather",
    number: "01",
    short: "Now",
    title: "Weather",
    icon: CloudRain,
  },
  {
    id: "rain",
    number: "02",
    short: "Rain",
    title: "Rain Intelligence",
    icon: Droplets,
  },
  {
    id: "radar",
    number: "03",
    short: "Radar",
    title: "Island Radar",
    icon: MapPinned,
  },
  {
    id: "forecast",
    number: "04",
    short: "Week",
    title: "7-Day Outlook",
    icon: Activity,
  },
  {
    id: "farming",
    number: "05",
    short: "Farm",
    title: "Smart Farming",
    icon: Sprout,
  },
];

function ChapterNavigation({ activeSection, onChange }) {
  return (
    <nav className="fixed right-4 top-1/2 z-[90] hidden -translate-y-1/2 xl:block">
      <div className="flex flex-col gap-1.5 rounded-[24px] border border-white/[0.08] bg-[#06131d]/75 p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        {SECTIONS.map((section, index) => {
          const active = activeSection === index;
          const Icon = section.icon;

          return (
            <button key={section.id} type="button" onClick={() => onChange(index)} className={`group relative flex h-11 items-center justify-end overflow-hidden rounded-[17px] transition-all duration-500 ${active ? "bg-white text-[#06131d] shadow-lg" : "text-white/35 hover:bg-white/[0.06] hover:text-white"}`} aria-label={`Open ${section.title}`}>
              <span className={`overflow-hidden whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.16em] transition-all duration-500 ${active ? "mr-2 max-w-[90px] opacity-100" : "max-w-0 opacity-0 group-hover:mr-2 group-hover:max-w-[90px] group-hover:opacity-100"}`}>{section.short}</span>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                <Icon className="h-3.5 w-3.5" />
              </span>

              {active && <span className="absolute bottom-1 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-cyan-500" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SectionHeading({ number, eyebrow, title, description, icon: Icon }) {
  return (
    <AnimatedContent distance={35} direction="vertical" duration={0.75} ease="power3.out" initialOpacity={0}>
      <div>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.07] text-cyan-300">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300/65">{number} / SmartRain</p>
            <p className="mt-0.5 text-[10px] font-semibold text-white/25">{eyebrow}</p>
          </div>
        </div>

        <h2 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">{title}</h2>

        {description && <p className="mt-6 max-w-xl text-sm leading-7 text-white/38 sm:text-base">{description}</p>}
      </div>
    </AnimatedContent>
  );
}

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#06131d]">
      <div className="absolute -left-[25%] top-[12%] h-[700px] w-[700px] rounded-full bg-cyan-500/[0.055] blur-[180px]" />
      <div className="absolute -right-[20%] top-[42%] h-[700px] w-[700px] rounded-full bg-emerald-400/[0.04] blur-[180px]" />
      <div className="absolute bottom-[-30%] left-[25%] h-[700px] w-[700px] rounded-full bg-blue-500/[0.04] blur-[180px]" />
      <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:70px_70px]" />
    </div>
  );
}

export default function Home() {
  const scrollContainerRef = useRef(null);
  const sectionRefs = useRef([]);

  const [savedCities, setSavedCities] = useState(() => {
    try {
      const saved = localStorage.getItem("smartrain_cities");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCity, setActiveCity] = useState(savedCities[0] || "");
  const [day, setDay] = useState("today");
  const [season, setSeason] = useState("maha");
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allCities, setAllCities] = useState([]);

  useEffect(() => {
    fetchCities()
      .then((response) => setAllCities(response.cities || []))
      .catch((error) => console.error("Failed to load cities:", error));
  }, []);

  const { data: weather, loading: weatherLoading, error: weatherError } = useWeatherData(activeCity);
  const { crops, loading: cropsLoading, error: cropsError } = useCropRecommendation(activeCity, season);

  const prediction = day === "today" ? weather?.prediction_today : weather?.prediction_tomorrow;

  const conditionToken = useMemo(() => resolveCondition(prediction?.weather_condition).token, [prediction]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    function handleScroll() {
      const maximum = container.scrollHeight - container.clientHeight;
      const progress = maximum > 0 ? (container.scrollTop / maximum) * 100 : 0;

      setScrollProgress(progress);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const nodes = sectionRefs.current.filter(Boolean);

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;

        const index = Number(visible[0].target.dataset.sectionIndex);

        if (!Number.isNaN(index)) {
          setActiveSection(index);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, []);

  function scrollToSection(index) {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleAddCity(cityName) {
    let updated = savedCities;

    if (!savedCities.includes(cityName)) {
      updated = [cityName, ...savedCities];

      setSavedCities(updated);
      localStorage.setItem("smartrain_cities", JSON.stringify(updated));
    }

    setActiveCity(cityName);
    setIsModalOpen(false);
  }

  function handleRemoveCity(cityName, event) {
    event.stopPropagation();

    const updated = savedCities.filter((city) => city !== cityName);

    setSavedCities(updated);
    localStorage.setItem("smartrain_cities", JSON.stringify(updated));

    if (activeCity === cityName) {
      setActiveCity(updated[0] || "");
    }
  }

  function handleMapCitySelect(city) {
    if (!savedCities.includes(city)) {
      const updated = [city, ...savedCities];

      setSavedCities(updated);
      localStorage.setItem("smartrain_cities", JSON.stringify(updated));
    }

    setActiveCity(city);

    window.setTimeout(() => {
      scrollToSection(0);
    }, 220);
  }

  return (
    <>
      <AmbientBackground />

      <div className="fixed left-0 right-0 top-0 z-[100] h-[2px] bg-white/[0.04]">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-[width] duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <ChapterNavigation activeSection={activeSection} onChange={scrollToSection} />

      <main ref={scrollContainerRef} className="relative z-10 h-screen overflow-x-hidden overflow-y-auto scroll-smooth bg-transparent selection:bg-cyan-400 selection:text-[#06131d] xl:snap-y xl:snap-proximity">
        {/* ==========================================================
            01 — LIVE WEATHER
        ========================================================== */}
        <section id="weather" ref={(element) => { sectionRefs.current[0] = element; }} data-section-index="0" data-condition={activeCity && prediction ? conditionToken : "clear"} className="relative min-h-[100svh] snap-start overflow-hidden">
          <SkyBackdrop token={activeCity && prediction ? conditionToken : "clear"} windy={prediction?.wind_speed_kmh > 15} />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06131d]/20 via-transparent to-[#06131d]/90" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-[#06131d] via-[#06131d]/55 to-transparent" />

          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1800px] flex-col px-5 pb-7 pt-5 md:px-8 lg:px-12 xl:px-16">
            <AnimatedContent distance={25} direction="vertical" reverse duration={0.75} ease="power3.out" initialOpacity={0}>
              <header className="flex items-center justify-between gap-4">
                <button type="button" onClick={() => scrollToSection(0)} className="group flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl">
                    <Droplets className="h-5 w-5 text-cyan-200" />
                    <div className="absolute inset-x-2 bottom-1 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
                  </div>

                  <div className="text-left">
                    <p className="text-base font-black tracking-[-0.04em] text-white">SmartRain</p>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/35">Weather Intelligence</p>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  {!weatherLoading && !weatherError && prediction && activeCity && <div className="hidden md:block"><DayToggle value={day} onChange={setDay} /></div>}

                  <button type="button" onClick={() => setIsModalOpen(true)} className="group flex items-center gap-2.5 rounded-full border border-white/15 bg-[#06131d]/30 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-cyan-300/30 hover:bg-white/[0.09]">
                    <LocateFixed className="h-3.5 w-3.5 text-cyan-200" />
                    <span className="max-w-[130px] truncate sm:max-w-[200px]">{activeCity || "Select location"}</span>
                    <span className="text-white/30 transition-transform duration-300 group-hover:translate-y-0.5">⌄</span>
                  </button>
                </div>
              </header>
            </AnimatedContent>

            {!activeCity && !weatherLoading && (
              <div className="flex flex-1 items-center py-16">
                <div className="grid w-full items-center gap-12 lg:grid-cols-12">
                  <AnimatedContent distance={55} direction="horizontal" reverse duration={0.9} ease="power3.out" initialOpacity={0} className="lg:col-span-7">
                    <div className="max-w-5xl">
                      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-xl">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-40" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
                        </span>

                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">Sri Lanka Weather Network</span>
                      </div>

                      <h1 className="text-[clamp(4rem,8vw,9rem)] font-black leading-[0.82] tracking-[-0.075em] text-white">Weather,<br /><span className="text-white/38">understood.</span></h1>

                      <p className="mt-9 max-w-xl text-sm leading-7 text-white/45 sm:text-base">Predict rainfall, explore island-wide weather conditions and turn meteorological data into practical farming decisions.</p>

                      <button type="button" onClick={() => setIsModalOpen(true)} className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-[#06131d] shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(0,0,0,0.25)]">
                        <Navigation className="h-4 w-4 text-cyan-600" />
                        Choose your location
                      </button>
                    </div>
                  </AnimatedContent>

                  <AnimatedContent distance={55} direction="horizontal" duration={0.9} delay={0.1} ease="power3.out" initialOpacity={0} className="hidden lg:col-span-5 lg:block">
                    <SpotlightCard className="!rounded-[34px] !border-white/[0.08] !bg-[#06131d]/30 !p-6 backdrop-blur-2xl" spotlightColor="rgba(34,211,238,0.12)">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.04] p-4">
                          <p className="text-3xl font-black tracking-[-0.06em] text-white">30</p>
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">Weather Stations</p>
                        </div>

                        <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.04] p-4">
                          <p className="text-3xl font-black tracking-[-0.06em] text-cyan-300">7D</p>
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">Forecast Window</p>
                        </div>

                        <div className="col-span-2 rounded-[22px] border border-white/[0.07] bg-white/[0.04] p-4">
                          <div className="flex items-center gap-2">
                            <Sprout className="h-4 w-4 text-emerald-300" />
                            <p className="text-xs font-bold text-white/70">Weather-aware agriculture</p>
                          </div>

                          <p className="mt-2 text-[10px] leading-5 text-white/30">Season-based crop recommendations connected to your selected weather location.</p>
                        </div>
                      </div>
                    </SpotlightCard>
                  </AnimatedContent>
                </div>
              </div>
            )}

            {weatherLoading && activeCity && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full border border-cyan-300/20" />
                    <div className="absolute inset-3 animate-pulse rounded-full bg-cyan-300/10 blur-xl" />
                    <CloudRain className="relative h-7 w-7 animate-pulse text-cyan-200" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-white">Reading the atmosphere</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">Loading local prediction</p>
                </div>
              </div>
            )}

            {weatherError && (
              <div className="flex flex-1 items-center justify-center">
                <div className="max-w-md rounded-[28px] border border-rose-300/15 bg-rose-400/10 p-6 text-center backdrop-blur-xl">
                  <p className="text-sm font-bold text-white">Weather data unavailable</p>
                  <p className="mt-2 text-xs leading-5 text-white/40">{weatherError}</p>
                </div>
              </div>
            )}

            {!weatherLoading && !weatherError && prediction && activeCity && (
              <div className="flex flex-1 flex-col justify-center py-8">
                <div className="grid items-center gap-6 lg:grid-cols-[220px_minmax(0,1fr)_220px] xl:grid-cols-[260px_minmax(0,1fr)_260px]">
                  <AnimatedContent distance={40} direction="horizontal" reverse duration={0.8} initialOpacity={0} className="hidden lg:block">
                    <div className="space-y-5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-200/50">Location</p>
                        <p className="mt-2 text-xl font-bold tracking-[-0.03em] text-white">{activeCity}</p>
                      </div>

                      <div className="h-px w-16 bg-gradient-to-r from-cyan-300/40 to-transparent" />

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Forecast period</p>
                        <p className="mt-2 text-sm font-semibold text-white/55">{day === "today" ? "Today" : "Tomorrow"}</p>
                      </div>
                    </div>
                  </AnimatedContent>

                  <AnimatedContent distance={65} direction="vertical" duration={0.95} ease="power3.out" initialOpacity={0}>
                    <WeatherHero prediction={prediction} />
                  </AnimatedContent>

                  <AnimatedContent distance={40} direction="horizontal" duration={0.8} delay={0.1} initialOpacity={0} className="hidden lg:block">
                    <div className="space-y-3">
                      <div className="rounded-[22px] border border-white/[0.08] bg-[#06131d]/30 p-4 backdrop-blur-xl">
                        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/25">Expected rain</p>
                        <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">{Number(prediction.expected_rainfall_mm || 0).toFixed(1)}<span className="ml-1 text-[10px] font-semibold text-white/30">mm</span></p>
                      </div>

                      <div className="rounded-[22px] border border-white/[0.08] bg-[#06131d]/30 p-4 backdrop-blur-xl">
                        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/25">Alert status</p>
                        <p className="mt-2 text-sm font-bold text-cyan-200">{prediction.alert_status || "Normal"}</p>
                      </div>
                    </div>
                  </AnimatedContent>
                </div>

                <div className="mt-5 flex justify-center md:hidden">
                  <DayToggle value={day} onChange={setDay} />
                </div>
              </div>
            )}

            {!weatherLoading && !weatherError && prediction && activeCity && (
              <AnimatedContent distance={30} direction="vertical" duration={0.8} delay={0.25} initialOpacity={0}>
                <div className="rounded-[30px] border border-white/[0.08] bg-[#06131d]/30 p-4 shadow-[0_25px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
                  <DailyForecastList city={activeCity} />
                </div>
              </AnimatedContent>
            )}

            <button type="button" onClick={() => scrollToSection(1)} className="group mx-auto mt-5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-white/60">
              Explore intelligence
              <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            </button>
          </div>
        </section>

        {/* ==========================================================
            02 — RAIN INTELLIGENCE
        ========================================================== */}
        <section id="rain" ref={(element) => { sectionRefs.current[1] = element; }} data-section-index="1" className="relative min-h-screen snap-start overflow-hidden border-t border-white/[0.04] bg-[#071620]">
          <div className="pointer-events-none absolute left-[-20%] top-[20%] h-[650px] w-[650px] rounded-full bg-cyan-500/[0.055] blur-[160px]" />

          <div className="relative mx-auto grid min-h-screen max-w-[1750px] gap-12 px-5 py-24 md:px-8 lg:grid-cols-12 lg:px-12 xl:px-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <SectionHeading number="02" eyebrow="Atmospheric analytics" title={<>Rain has<br />a story.</>} description="See the predicted rainfall, atmospheric risk and local seven-day pattern without digging through disconnected weather cards." icon={Droplets} />

                {activeCity && (
                  <AnimatedContent distance={20} direction="vertical" duration={0.6} delay={0.15} initialOpacity={0}>
                    <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-2">
                      <LocateFixed className="h-3 w-3 text-cyan-300" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/40">{activeCity}</span>
                    </div>
                  </AnimatedContent>
                )}
              </div>
            </div>

            <div className="space-y-5 lg:col-span-8">
              {!activeCity ? (
                <div className="flex min-h-[550px] items-center justify-center rounded-[36px] border border-white/[0.07] bg-white/[0.025] text-center">
                  <div>
                    <Droplets className="mx-auto h-8 w-8 text-cyan-300/40" />
                    <h3 className="mt-5 text-lg font-bold text-white">Choose a location</h3>
                    <p className="mt-2 text-xs text-white/30">Rain intelligence will appear here.</p>
                  </div>
                </div>
              ) : weatherLoading ? (
                <div className="flex min-h-[550px] items-center justify-center rounded-[36px] border border-white/[0.07] bg-white/[0.025]">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-200/20 border-t-cyan-300" />
                    <p className="mt-4 text-xs font-semibold text-white/40">Analyzing rainfall...</p>
                  </div>
                </div>
              ) : prediction ? (
                <>
                  <AnimatedContent distance={40} direction="vertical" duration={0.8} initialOpacity={0}>
                    <div className="rounded-[36px] bg-[#eef5f7] p-5 shadow-[0_35px_90px_rgba(0,0,0,0.18)] sm:p-7">
                      <WeatherStatsStrip prediction={prediction} />
                    </div>
                  </AnimatedContent>

                  <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.12} initialOpacity={0}>
                    <SpotlightCard className="!rounded-[36px] !border-white/[0.08] !bg-white/[0.035] !p-5 sm:!p-7" spotlightColor="rgba(34,211,238,0.08)">
                      <DailyForecastList city={activeCity} />
                    </SpotlightCard>
                  </AnimatedContent>
                </>
              ) : (
                <div className="flex min-h-[350px] items-center justify-center rounded-[36px] border border-white/[0.07] bg-white/[0.025] text-center">
                  <p className="text-sm text-white/35">Prediction unavailable for this location.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================================
            03 — FULL WIDTH RADAR
        ========================================================== */}
        <section id="radar" ref={(element) => { sectionRefs.current[2] = element; }} data-section-index="2" className="relative snap-start overflow-hidden border-t border-white/[0.04] bg-[#06131d] py-20">
          <div className="pointer-events-none absolute left-1/2 top-[25%] h-[800px] w-[1100px] -translate-x-1/2 rounded-full bg-cyan-500/[0.055] blur-[180px]" />

          <div className="relative mx-auto max-w-[1900px] px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <SectionHeading number="03" eyebrow="Island command center" title={<>Sri Lanka,<br /><span className="text-cyan-300">live on one canvas.</span></>} description="This is the primary exploration surface. Search stations, compare rainfall probability and move directly from island-level intelligence into a city's complete forecast." icon={MapPinned} />
              </div>

              <AnimatedContent distance={35} direction="horizontal" duration={0.75} initialOpacity={0} className="lg:col-span-4">
                <div className="grid grid-cols-2 gap-2 lg:ml-auto lg:max-w-sm">
                  <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
                    <p className="text-2xl font-black tracking-[-0.05em] text-white">30</p>
                    <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-white/25">Stations</p>
                  </div>

                  <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
                    <p className="text-2xl font-black tracking-[-0.05em] text-cyan-300">{day === "today" ? "TDY" : "TMR"}</p>
                    <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-white/25">Active model</p>
                  </div>
                </div>
              </AnimatedContent>
            </div>

            <AnimatedContent distance={70} direction="vertical" duration={1} ease="power3.out" initialOpacity={0}>
              <div className="smartrain-radar relative overflow-hidden rounded-[38px] border border-white/[0.08] bg-white/[0.025] p-2 shadow-[0_50px_140px_rgba(0,0,0,0.32)] sm:p-3">
                <WeatherMap day={day} onDayChange={setDay} onSelectCity={handleMapCitySelect} large />
              </div>
            </AnimatedContent>

            <div className="mt-4 flex items-center justify-between px-2">
              <p className="text-[9px] font-medium text-white/20">Interactive station-level weather intelligence</p>

              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                </span>

                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25">Weather network online</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================
            04 — FORECAST STUDIO
        ========================================================== */}
        <section id="forecast" ref={(element) => { sectionRefs.current[3] = element; }} data-section-index="3" className="relative min-h-screen snap-start overflow-hidden border-t border-white/[0.04] bg-[#081722]">
          <div className="pointer-events-none absolute -right-[25%] top-[10%] h-[800px] w-[800px] rounded-full bg-sky-500/[0.05] blur-[180px]" />

          <div className="relative mx-auto max-w-[1750px] px-5 py-24 md:px-8 lg:px-12 xl:px-16">
            <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <SectionHeading number="04" eyebrow="Forecast studio" title={<>Seven days.<br />One clear signal.</>} description={`Understand how temperature, rainfall, wind and rainy hours evolve across the week${activeCity ? ` for ${activeCity}` : ""}.`} icon={Activity} />
              </div>

              <div className="lg:col-span-4 lg:text-right">
                {activeCity && <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300/60">Forecasting / {activeCity}</p>}
              </div>
            </div>

            <AnimatedContent distance={55} direction="vertical" duration={0.9} initialOpacity={0}>
              <div className="rounded-[40px] bg-[#eef5f7] p-4 shadow-[0_40px_110px_rgba(0,0,0,0.2)] sm:p-6 lg:p-8">
                {activeCity ? (
                  <WeeklyForecastChart city={activeCity} />
                ) : (
                  <div className="flex min-h-[560px] items-center justify-center text-center">
                    <div>
                      <Activity className="mx-auto h-9 w-9 text-slate-300" />
                      <h3 className="mt-5 text-lg font-bold text-slate-900">No forecast selected</h3>
                      <p className="mt-2 text-xs text-slate-400">Select a city to open the seven-day forecast studio.</p>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedContent>
          </div>
        </section>

        {/* ==========================================================
            05 — FARMING
        ========================================================== */}
        <section id="farming" ref={(element) => { sectionRefs.current[4] = element; }} data-section-index="4" className="relative min-h-screen snap-start overflow-hidden border-t border-white/[0.04] bg-[#071620]">
          <div className="pointer-events-none absolute -left-[20%] bottom-[5%] h-[700px] w-[700px] rounded-full bg-emerald-400/[0.055] blur-[180px]" />

          <div className="relative mx-auto max-w-[1750px] px-5 py-24 md:px-8 lg:px-12 xl:px-16">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <SectionHeading number="05" eyebrow="Agricultural intelligence" title={<>From weather<br />to action.</>} description="Turn predicted conditions into season-aware crop recommendations ranked by model confidence." icon={Sprout} />

                  <div className="mt-9">
                    <SeasonTabs activeSeason={season} onChange={setSeason} />
                  </div>

                  {activeCity && (
                    <div className="mt-5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/25">
                      <LocateFixed className="h-3 w-3 text-emerald-300" />
                      Recommendations for {activeCity}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8">
                <AnimatedContent distance={50} direction="vertical" duration={0.85} initialOpacity={0}>
                  <SpotlightCard className="!rounded-[40px] !border-white/[0.08] !bg-white/[0.035] !p-5 shadow-[0_35px_100px_rgba(0,0,0,0.18)] sm:!p-7 lg:!p-8" spotlightColor="rgba(52,211,153,0.08)">
                    {!activeCity ? (
                      <div className="flex min-h-[520px] items-center justify-center text-center">
                        <div>
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-emerald-300/10 bg-emerald-300/[0.06]">
                            <Sprout className="h-7 w-7 text-emerald-300/60" />
                          </div>

                          <h3 className="mt-5 text-lg font-bold text-white">Location required</h3>
                          <p className="mt-2 text-xs text-white/30">Select a city to generate seasonal crop recommendations.</p>
                        </div>
                      </div>
                    ) : (
                      <CropList crops={crops} loading={cropsLoading} error={cropsError} />
                    )}
                  </SpotlightCard>
                </AnimatedContent>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <CityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} savedCities={savedCities} allCities={allCities} onAddCity={handleAddCity} onRemoveCity={handleRemoveCity} />

      <style>{`
        html {
          background: #06131d;
        }

        @keyframes smartrain-ambient-float {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(2%, -3%, 0) scale(1.04);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </>
  );
}