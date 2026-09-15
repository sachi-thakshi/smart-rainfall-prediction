import { useState } from "react";

export default function CityModal({ isOpen, onClose, savedCities, allCities, onAddCity, onRemoveCity }) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredCities = allCities.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-gray-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg">Select City</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-50">
          <input 
            type="text" 
            placeholder="Search dataset cities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none text-gray-800 px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-400 transition text-sm font-medium"
          />
        </div>

        {/* Cities List */}
        <div className="overflow-y-auto no-scrollbar p-2 flex-1">
          
          {savedCities.length > 0 && !searchQuery && (
            <div className="mb-4">
              <p className="text-[10px] uppercase font-bold text-gray-400 px-3 mb-2 tracking-wider">Saved Cities</p>
              {savedCities.map(c => (
                <div key={`saved-${c}`} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => { onAddCity(c); setSearchQuery(""); }}>
                  <span className="font-bold text-gray-700">📍 {c}</span>
                  <button onClick={(e) => onRemoveCity(c, e)} className="text-gray-300 hover:text-red-500 transition">✕</button>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 px-3 mb-2 tracking-wider">
              {searchQuery ? "Search Results" : "Available Cities"}
            </p>
            {filteredCities.map(c => (
              <div key={c} onClick={() => { onAddCity(c); setSearchQuery(""); }} className="px-3 py-2.5 hover:bg-blue-50 rounded-xl cursor-pointer transition flex items-center gap-2">
                <span className="text-gray-400">🌍</span> 
                <span className="font-medium text-gray-700">{c}</span>
              </div>
            ))}
            {filteredCities.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">No cities found.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}