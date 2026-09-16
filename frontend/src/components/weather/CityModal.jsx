// import { useState } from "react";

// export default function CityModal({ isOpen, onClose, savedCities, allCities, onAddCity, onRemoveCity }) {
//   const [searchQuery, setSearchQuery] = useState("");

//   if (!isOpen) return null;

//   const filteredCities = allCities.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//       <div className="bg-white w-full max-w-sm rounded-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-gray-800 animate-in fade-in zoom-in-95 duration-200">
        
//         {/* Header */}
//         <div className="p-5 border-b border-gray-100 flex items-center justify-between">
//           <h3 className="font-bold text-lg">Select City</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
//         </div>

//         {/* Search Input */}
//         <div className="p-4 border-b border-gray-50">
//           <input 
//             type="text" 
//             placeholder="Search dataset cities..." 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full bg-gray-100 border-none text-gray-800 px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-400 transition text-sm font-medium"
//           />
//         </div>

//         {/* Cities List */}
//         <div className="overflow-y-auto no-scrollbar p-2 flex-1">
          
//           {savedCities.length > 0 && !searchQuery && (
//             <div className="mb-4">
//               <p className="text-[10px] uppercase font-bold text-gray-400 px-3 mb-2 tracking-wider">Saved Cities</p>
//               {savedCities.map(c => (
//                 <div key={`saved-${c}`} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => { onAddCity(c); setSearchQuery(""); }}>
//                   <span className="font-bold text-gray-700">📍 {c}</span>
//                   <button onClick={(e) => onRemoveCity(c, e)} className="text-gray-300 hover:text-red-500 transition">✕</button>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div>
//             <p className="text-[10px] uppercase font-bold text-gray-400 px-3 mb-2 tracking-wider">
//               {searchQuery ? "Search Results" : "Available Cities"}
//             </p>
//             {filteredCities.map(c => (
//               <div key={c} onClick={() => { onAddCity(c); setSearchQuery(""); }} className="px-3 py-2.5 hover:bg-blue-50 rounded-xl cursor-pointer transition flex items-center gap-2">
//                 <span className="text-gray-400">🌍</span> 
//                 <span className="font-medium text-gray-700">{c}</span>
//               </div>
//             ))}
//             {filteredCities.length === 0 && (
//               <p className="text-center text-sm text-gray-400 py-4">No cities found.</p>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MapPin, Search, Sparkles, X } from "lucide-react";
import AnimatedContent from "../reactbits/AnimatedContent.jsx";

export default function CityModal({ isOpen, onClose, savedCities = [], allCities = [], onAddCity, onRemoveCity }) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredCities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return allCities;
    }

    return allCities.filter((city) => city.toLowerCase().includes(query));
  }, [allCities, searchQuery]);

  if (!isOpen) return null;

  function handleSelectCity(city) {
    onAddCity(city);
    setSearchQuery("");
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div onMouseDown={handleBackdropClick} className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xl">
      <AnimatedContent distance={35} direction="vertical" duration={0.55} ease="power3.out" initialOpacity={0}>
        <div className="relative flex max-h-[82vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.96] shadow-[0_40px_120px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-300/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-200/20 blur-[90px]" />

          <div className="relative z-10 flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-[-0.03em] text-slate-950">Select Location</h3>
                  <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-400">Choose a city to update weather, radar and farming intelligence.</p>
              </div>
            </div>

            <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all duration-300 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500" aria-label="Close city selector">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative z-10 px-5 pb-4 pt-4 sm:px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input ref={inputRef} type="text" placeholder="Search cities..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-[20px] border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100" />

              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Clear city search">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
            {savedCities.length > 0 && !searchQuery && (
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Saved Locations</p>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-400">{savedCities.length}</span>
                </div>

                <div className="space-y-1.5">
                  {savedCities.map((city, index) => (
                    <AnimatedContent key={`saved-${city}`} distance={18} direction="vertical" duration={0.45} delay={index * 0.04} ease="power3.out" initialOpacity={0}>
                      <div className="group flex items-center justify-between gap-3 rounded-[18px] border border-slate-100 bg-slate-50/80 px-3 py-3 transition-all duration-300 hover:border-sky-100 hover:bg-sky-50/70">
                        <button type="button" onClick={() => handleSelectCity(city)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                            <MapPin className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">{city}</p>
                            <p className="mt-0.5 text-[10px] font-medium text-slate-400">Saved location</p>
                          </div>
                        </button>

                        <button type="button" onClick={(event) => onRemoveCity(city, event)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition-all duration-300 hover:bg-rose-50 hover:text-rose-500" aria-label={`Remove ${city}`}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </AnimatedContent>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{searchQuery ? "Search Results" : "Available Cities"}</p>

                <span className="text-[9px] font-semibold text-slate-300">{filteredCities.length} results</span>
              </div>

              {filteredCities.length > 0 ? (
                <div className="space-y-1">
                  {filteredCities.map((city, index) => {
                    const isSaved = savedCities.includes(city);

                    return (
                      <AnimatedContent key={city} distance={15} direction="vertical" duration={0.4} delay={Math.min(index * 0.025, 0.25)} ease="power3.out" initialOpacity={0}>
                        <button type="button" onClick={() => handleSelectCity(city)} className="group flex w-full items-center justify-between gap-4 rounded-[18px] px-3 py-3 text-left transition-all duration-300 hover:bg-sky-50">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${isSaved ? "bg-emerald-50 text-emerald-500" : "bg-slate-100 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-500"}`}>
                              {isSaved ? <Check className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-950">{city}</p>
                              <p className="mt-0.5 text-[10px] text-slate-400">{isSaved ? "Already saved" : "Weather station available"}</p>
                            </div>
                          </div>

                          <span className="shrink-0 translate-x-1 text-lg text-slate-200 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span>
                        </button>
                      </AnimatedContent>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-[220px] items-center justify-center px-5 text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                      <Search className="h-6 w-6" />
                    </div>

                    <h4 className="mt-4 text-sm font-bold text-slate-700">No cities found</h4>

                    <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-400">No city matches “{searchQuery}”. Try another search.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Dataset Ready</span>
            </div>

            <span className="text-[9px] font-medium text-slate-300">Press ESC to close</span>
          </div>
        </div>
      </AnimatedContent>
    </div>
  );
}