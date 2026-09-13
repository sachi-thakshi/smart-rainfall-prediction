import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import WeatherMap from './components/WeatherMap';
import Simulator from './components/Simulator';
import HistoricalTrends from './components/HistoricalTrends';
import CityComparison from './components/CityComparison';
import Diagnostics from './components/Diagnostics';
import { weatherApi } from './api/weatherApi';
import { AlertTriangle, RefreshCw, Terminal, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cities, setCities] = useState([]);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [preselectedCity, setPreselectedCity] = useState('Colombo');

  const checkInitialBackend = async () => {
    try {
      const [citiesRes, datasetRes, healthRes] = await Promise.all([
        weatherApi.getCities(),
        weatherApi.getDatasetInfo(),
        weatherApi.getHealth()
      ]);
      setCities(citiesRes.cities || []);
      setDatasetInfo(datasetRes);
      setBackendStatus(healthRes.status === 'healthy' ? 'online' : 'offline');
    } catch (err) {
      console.warn('Initial backend check failed:', err.message);
      setBackendStatus('offline');
      // Fallback list of 30 Sri Lankan cities in case backend is being started
      setCities([
        'Athurugiriya', 'Badulla', 'Bentota', 'Colombo', 'Galle', 'Gampaha',
        'Hambantota', 'Hatton', 'Jaffna', 'Kalmunai', 'Kalutara', 'Kandy',
        'Kesbewa', 'Kolonnawa', 'Kurunegala', 'Mabole', 'Maharagama', 'Mannar',
        'Matale', 'Matara', 'Moratuwa', 'Mount Lavinia', 'Negombo', 'Oruwala',
        'Pothuhera', 'Puttalam', 'Ratnapura', 'Sri Jayewardenepura Kotte',
        'Trincomalee', 'Weligama'
      ]);
      setDatasetInfo({
        start_date: '2010-01-01',
        end_date: '2023-06-16',
        rows: 147480,
        cities: 30
      });
    }
  };

  useEffect(() => {
    checkInitialBackend();
    const interval = setInterval(async () => {
      try {
        const h = await weatherApi.getHealth();
        setBackendStatus(h.status === 'healthy' ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCitySelectFromMap = (cityName) => {
    setPreselectedCity(cityName);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendStatus={backendStatus}
        datasetInfo={datasetInfo}
      />

      {/* Backend Offline Warning Banner */}
      {backendStatus === 'offline' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-200 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Backend Server is Offline:</strong> Could not connect to FastAPI on <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">http://127.0.0.1:8000</code>.
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-slate-400 hidden sm:inline">Start with:</span>
              <code className="bg-slate-900 px-2 py-0.5 rounded font-mono text-cyan-300 border border-slate-700">
                uvicorn main:app --reload
              </code>
              <button 
                onClick={checkInitialBackend} 
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            cities={cities} 
            datasetInfo={datasetInfo}
            preselectedCity={preselectedCity}
            onSelectCityOnMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'map' && (
          <WeatherMap 
            onSelectCityForPrediction={handleCitySelectFromMap}
          />
        )}

        {activeTab === 'simulator' && (
          <Simulator 
            cities={cities}
          />
        )}

        {activeTab === 'trends' && (
          <HistoricalTrends 
            cities={cities}
          />
        )}

        {activeTab === 'comparison' && (
          <CityComparison 
            cities={cities}
            datasetInfo={datasetInfo}
            onSelectCityForPrediction={handleCitySelectFromMap}
          />
        )}

        {activeTab === 'diagnostics' && (
          <Diagnostics />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 glass-panel py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-200">SmartRain Sri Lanka</span>
            <span>•</span>
            <span>Gradient Boosting Classifier & Linear Regression ML Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('diagnostics')}
              className="hover:text-cyan-400 transition-colors"
            >
              System Health & Diagnostics
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('simulator')}
              className="hover:text-cyan-400 transition-colors"
            >
              What-If Simulator
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
