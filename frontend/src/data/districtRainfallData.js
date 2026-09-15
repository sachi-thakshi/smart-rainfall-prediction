/**
 * Real-Time and Historical District-wise Weather & Rainfall Data Module
 *
 * Requirements:
 * - "Today" and "Yesterday" are ALWAYS dynamically determined from the actual current system date.
 * - Real-time/live observed weather is fetched via Open-Meteo free API for all Sri Lankan districts.
 * - The 2010-2023 historical dataset is preserved as a baseline/reference and used for estimation
 *   when live telemetry is unreachable.
 * - Data source provenance is tracked ('live' vs 'estimated' vs 'historical_ref').
 */

/**
 * Dynamically computes actual calendar dates for Today and Yesterday
 */
export function getCurrentDates() {
  const now = new Date();
  
  // Format helper YYYY-MM-DD
  const formatIso = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Format helper YYYY/MM/DD
  const formatDateSlash = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };

  const todayIso = formatIso(now);
  const todaySlash = formatDateSlash(now);
  const todayFormatted = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = formatIso(yesterday);
  const yesterdaySlash = formatDateSlash(yesterday);
  const yesterdayFormatted = yesterday.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    todayIso,
    todaySlash,
    todayFormatted,
    yesterdayIso,
    yesterdaySlash,
    yesterdayFormatted,
    month: now.getMonth() + 1,
    hour: now.getHours()
  };
}

/**
 * 17 Meteorological districts covering all 30 stations with exact geographic centroids
 */
export const BASE_DISTRICTS = [
  {
    district: 'Ampara',
    zone: 'Dry Zone',
    latitude: 7.40,
    longitude: 81.80,
    elevation: 8,
    historical_avg_rain: 0.9,
    historical_yesterday_rain: 0.9,
    historical_temp: 30.0,
    historical_wind: 14.8,
    stations: [
      { station: 'Kalmunai', latitude: 7.40, longitude: 81.80, elevation: 8 }
    ]
  },
  {
    district: 'Badulla',
    zone: 'Intermediate Zone',
    latitude: 7.10,
    longitude: 81.10,
    elevation: 652,
    historical_avg_rain: 0.0,
    historical_yesterday_rain: 0.4,
    historical_temp: 26.3,
    historical_wind: 16.2,
    stations: [
      { station: 'Badulla', latitude: 7.10, longitude: 81.10, elevation: 652 }
    ]
  },
  {
    district: 'Colombo',
    zone: 'Wet Zone',
    latitude: 6.9271,
    longitude: 79.8612,
    elevation: 16,
    historical_avg_rain: 4.11,
    historical_yesterday_rain: 5.82,
    historical_temp: 27.3,
    historical_wind: 17.8,
    stations: [
      { station: 'Colombo', latitude: 6.93, longitude: 79.86, elevation: 16 },
      { station: 'Mount Lavinia', latitude: 6.83, longitude: 79.86, elevation: 10 },
      { station: 'Kesbewa', latitude: 6.78, longitude: 79.94, elevation: 15 },
      { station: 'Moratuwa', latitude: 6.77, longitude: 79.88, elevation: 10 },
      { station: 'Maharagama', latitude: 6.85, longitude: 79.93, elevation: 20 },
      { station: 'Kolonnawa', latitude: 6.93, longitude: 79.89, elevation: 12 },
      { station: 'Sri Jayewardenepura Kotte', latitude: 6.89, longitude: 79.90, elevation: 15 },
      { station: 'Athurugiriya', latitude: 6.87, longitude: 79.99, elevation: 25 },
      { station: 'Oruwala', latitude: 6.90, longitude: 80.01, elevation: 30 }
    ]
  },
  {
    district: 'Galle',
    zone: 'Wet Zone',
    latitude: 6.0535,
    longitude: 80.2210,
    elevation: 12,
    historical_avg_rain: 6.2,
    historical_yesterday_rain: 3.0,
    historical_temp: 27.2,
    historical_wind: 26.1,
    stations: [
      { station: 'Galle', latitude: 6.05, longitude: 80.22, elevation: 12 }
    ]
  },
  {
    district: 'Gampaha',
    zone: 'Wet Zone',
    latitude: 7.09,
    longitude: 79.99,
    elevation: 15,
    historical_avg_rain: 5.0,
    historical_yesterday_rain: 5.6,
    historical_temp: 27.5,
    historical_wind: 16.3,
    stations: [
      { station: 'Gampaha', latitude: 7.09, longitude: 79.99, elevation: 15 },
      { station: 'Negombo', latitude: 7.21, longitude: 79.84, elevation: 5 },
      { station: 'Mabole', latitude: 7.00, longitude: 79.88, elevation: 8 }
    ]
  },
  {
    district: 'Hambantota',
    zone: 'Dry Zone',
    latitude: 6.12,
    longitude: 81.12,
    elevation: 10,
    historical_avg_rain: 0.0,
    historical_yesterday_rain: 0.0,
    historical_temp: 28.5,
    historical_wind: 28.8,
    stations: [
      { station: 'Hambantota', latitude: 6.12, longitude: 81.12, elevation: 10 }
    ]
  },
  {
    district: 'Jaffna',
    zone: 'Dry Zone',
    latitude: 9.6615,
    longitude: 80.0255,
    elevation: 5,
    historical_avg_rain: 1.2,
    historical_yesterday_rain: 0.0,
    historical_temp: 30.2,
    historical_wind: 29.8,
    stations: [
      { station: 'Jaffna', latitude: 9.66, longitude: 80.03, elevation: 5 }
    ]
  },
  {
    district: 'Kalutara',
    zone: 'Wet Zone',
    latitude: 6.58,
    longitude: 79.96,
    elevation: 8,
    historical_avg_rain: 3.4,
    historical_yesterday_rain: 6.0,
    historical_temp: 27.2,
    historical_wind: 17.8,
    stations: [
      { station: 'Kalutara', latitude: 6.58, longitude: 79.96, elevation: 8 },
      { station: 'Bentota', latitude: 6.42, longitude: 80.00, elevation: 10 }
    ]
  },
  {
    district: 'Kandy',
    zone: 'Wet Zone',
    latitude: 7.2906,
    longitude: 80.6337,
    elevation: 510,
    historical_avg_rain: 1.5,
    historical_yesterday_rain: 1.9,
    historical_temp: 24.1,
    historical_wind: 16.7,
    stations: [
      { station: 'Kandy', latitude: 7.29, longitude: 80.63, elevation: 510 }
    ]
  },
  {
    district: 'Kurunegala',
    zone: 'Intermediate Zone',
    latitude: 7.4863,
    longitude: 80.3623,
    elevation: 125,
    historical_avg_rain: 5.5,
    historical_yesterday_rain: 1.9,
    historical_temp: 26.1,
    historical_wind: 20.0,
    stations: [
      { station: 'Kurunegala', latitude: 7.49, longitude: 80.36, elevation: 124 },
      { station: 'Pothuhera', latitude: 7.42, longitude: 80.31, elevation: 125 }
    ]
  },
  {
    district: 'Mannar',
    zone: 'Dry Zone',
    latitude: 8.98,
    longitude: 79.90,
    elevation: 6,
    historical_avg_rain: 0.6,
    historical_yesterday_rain: 0.4,
    historical_temp: 29.5,
    historical_wind: 29.6,
    stations: [
      { station: 'Mannar', latitude: 8.98, longitude: 79.90, elevation: 6 }
    ]
  },
  {
    district: 'Matale',
    zone: 'Intermediate Zone',
    latitude: 7.47,
    longitude: 80.62,
    elevation: 376,
    historical_avg_rain: 0.9,
    historical_yesterday_rain: 0.9,
    historical_temp: 26.3,
    historical_wind: 21.0,
    stations: [
      { station: 'Matale', latitude: 7.47, longitude: 80.62, elevation: 376 }
    ]
  },
  {
    district: 'Matara',
    zone: 'Wet Zone',
    latitude: 5.95,
    longitude: 80.53,
    elevation: 7,
    historical_avg_rain: 6.2,
    historical_yesterday_rain: 3.0,
    historical_temp: 27.1,
    historical_wind: 26.1,
    stations: [
      { station: 'Matara', latitude: 5.95, longitude: 80.53, elevation: 7 },
      { station: 'Weligama', latitude: 5.97, longitude: 80.43, elevation: 5 }
    ]
  },
  {
    district: 'Nuwara Eliya',
    zone: 'Wet Zone',
    latitude: 6.95,
    longitude: 80.78,
    elevation: 1281,
    historical_avg_rain: 0.7,
    historical_yesterday_rain: 2.0,
    historical_temp: 20.7,
    historical_wind: 15.5,
    stations: [
      { station: 'Hatton', latitude: 6.89, longitude: 80.60, elevation: 1281 }
    ]
  },
  {
    district: 'Puttalam',
    zone: 'Dry Zone',
    latitude: 8.03,
    longitude: 79.83,
    elevation: 5,
    historical_avg_rain: 1.5,
    historical_yesterday_rain: 1.3,
    historical_temp: 28.5,
    historical_wind: 23.2,
    stations: [
      { station: 'Puttalam', latitude: 8.03, longitude: 79.83, elevation: 5 }
    ]
  },
  {
    district: 'Ratnapura',
    zone: 'Wet Zone',
    latitude: 6.68,
    longitude: 80.40,
    elevation: 27,
    historical_avg_rain: 4.4,
    historical_yesterday_rain: 6.6,
    historical_temp: 25.4,
    historical_wind: 16.9,
    stations: [
      { station: 'Ratnapura', latitude: 6.68, longitude: 80.40, elevation: 27 }
    ]
  },
  {
    district: 'Trincomalee',
    zone: 'Dry Zone',
    latitude: 8.58,
    longitude: 81.23,
    elevation: 7,
    historical_avg_rain: 0.3,
    historical_yesterday_rain: 0.3,
    historical_temp: 29.9,
    historical_wind: 29.8,
    stations: [
      { station: 'Trincomalee', latitude: 8.58, longitude: 81.23, elevation: 7 }
    ]
  }
];

/**
 * Returns descriptive status and badges for rainfall amounts
 */
export function getRainStatus(mm) {
  const val = Number(mm) || 0;
  if (val <= 0.1) {
    return {
      label: 'No Rain / Dry',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotColor: '#10b981',
      description: 'Clear or cloudy conditions without measurable rainfall.'
    };
  }
  if (val <= 2.5) {
    return {
      label: 'Light Rain',
      badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dotColor: '#0ea5e9',
      description: 'Gentle passing showers or intermittent drizzle.'
    };
  }
  if (val <= 10.0) {
    return {
      label: 'Moderate Rain',
      badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      dotColor: '#3b82f6',
      description: 'Steady monsoonal precipitation across district.'
    };
  }
  if (val <= 35.0) {
    return {
      label: 'Heavy Rain',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      dotColor: '#f59e0b',
      description: 'Substantial downpour, water accumulation likely.'
    };
  }
  return {
    label: 'Torrential Rain',
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    dotColor: '#ef4444',
    description: 'Severe weather downpour with localized flood risks.'
  };
}

/**
 * Helper to compute percentage change safely
 */
export function computePercentageChange(today, yesterday) {
  const t = Number(today) || 0;
  const y = Number(yesterday) || 0;
  if (y === 0) {
    return t > 0 ? 100 : 0;
  }
  const pct = ((t - y) / y) * 100;
  return Math.round(pct);
}

/**
 * Fetch real-time live district rainfall from Open-Meteo API
 * Automatically extracts Today and Yesterday based on current calendar date.
 * If network request fails, smoothly falls back to estimated historical patterns.
 */
export async function fetchLiveDistrictWeather() {
  const dates = getCurrentDates();
  
  // Format coordinate list for multi-location query
  const lats = BASE_DISTRICTS.map(d => d.latitude.toFixed(4)).join(',');
  const lons = BASE_DISTRICTS.map(d => d.longitude.toFixed(4)).join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&daily=rain_sum,precipitation_sum,temperature_2m_mean,wind_speed_10m_max&current=temperature_2m,wind_speed_10m&timezone=Asia%2FColombo&past_days=2&forecast_days=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const jsonList = await res.json();
    const dataArray = Array.isArray(jsonList) ? jsonList : [jsonList];

    // Map each district to the live response
    const districtsData = BASE_DISTRICTS.map((base, idx) => {
      const liveItem = dataArray[idx];
      let todayRain = base.historical_avg_rain;
      let yesterdayRain = base.historical_yesterday_rain;
      let currentTemp = base.historical_temp;
      let currentWind = base.historical_wind;
      let isLive = false;

      if (liveItem && liveItem.daily && liveItem.daily.time) {
        const times = liveItem.daily.time;
        const rains = liveItem.daily.rain_sum || [];
        
        // Find indices matching todayIso and yesterdayIso
        const todayIdx = times.indexOf(dates.todayIso);
        const yestIdx = times.indexOf(dates.yesterdayIso);

        if (todayIdx !== -1 && rains[todayIdx] !== undefined) {
          todayRain = Math.round(Number(rains[todayIdx]) * 10) / 10;
          isLive = true;
        } else if (rains.length > 0) {
          // Last element is latest day
          todayRain = Math.round(Number(rains[rains.length - 1]) * 10) / 10;
          isLive = true;
        }

        if (yestIdx !== -1 && rains[yestIdx] !== undefined) {
          yesterdayRain = Math.round(Number(rains[yestIdx]) * 10) / 10;
        } else if (rains.length >= 2) {
          yesterdayRain = Math.round(Number(rains[rains.length - 2]) * 10) / 10;
        }

        if (liveItem.current) {
          if (liveItem.current.temperature_2m !== undefined) {
            currentTemp = Math.round(Number(liveItem.current.temperature_2m) * 10) / 10;
          }
          if (liveItem.current.wind_speed_10m !== undefined) {
            currentWind = Math.round(Number(liveItem.current.wind_speed_10m) * 10) / 10;
          }
        }
      }

      const delta = Math.round((todayRain - yesterdayRain) * 10) / 10;
      const pctChange = computePercentageChange(todayRain, yesterdayRain);

      // Station list
      const stations = base.stations.map(st => ({
        station: st.station,
        today_rain: todayRain,
        yesterday_rain: yesterdayRain,
        today_temp: currentTemp,
        yesterday_temp: currentTemp,
        today_wind: currentWind,
        elevation: st.elevation,
        latitude: st.latitude,
        longitude: st.longitude
      }));

      return {
        district: base.district,
        zone: base.zone,
        today_rain_mm: todayRain,
        yesterday_rain_mm: yesterdayRain,
        delta_mm: delta,
        pct_change: pctChange,
        today_temp_mean: currentTemp,
        today_wind_max: currentWind,
        latitude: base.latitude,
        longitude: base.longitude,
        elevation: base.elevation,
        source: isLive ? 'live' : 'estimated',
        stations
      };
    });

    return {
      success: true,
      dataSource: 'live',
      sourceLabel: 'Live Satellite & Meteorological Telemetry (Open-Meteo)',
      dates,
      districts: districtsData
    };

  } catch (err) {
    console.warn('Real-time weather fetch failed, using historical pattern estimation:', err.message);
    
    // Graceful estimation based on 2010-2023 historical patterns
    const districtsData = BASE_DISTRICTS.map((base) => {
      const delta = Math.round((base.historical_avg_rain - base.historical_yesterday_rain) * 10) / 10;
      const pctChange = computePercentageChange(base.historical_avg_rain, base.historical_yesterday_rain);

      const stations = base.stations.map(st => ({
        station: st.station,
        today_rain: base.historical_avg_rain,
        yesterday_rain: base.historical_yesterday_rain,
        today_temp: base.historical_temp,
        yesterday_temp: base.historical_temp,
        today_wind: base.historical_wind,
        elevation: st.elevation,
        latitude: st.latitude,
        longitude: st.longitude
      }));

      return {
        district: base.district,
        zone: base.zone,
        today_rain_mm: base.historical_avg_rain,
        yesterday_rain_mm: base.historical_yesterday_rain,
        delta_mm: delta,
        pct_change: pctChange,
        today_temp_mean: base.historical_temp,
        today_wind_max: base.historical_wind,
        latitude: base.latitude,
        longitude: base.longitude,
        elevation: base.elevation,
        source: 'estimated',
        stations
      };
    });

    return {
      success: false,
      dataSource: 'estimated',
      sourceLabel: 'Estimated from 2010–2023 Historical Patterns (Network Offline)',
      dates,
      districts: districtsData
    };
  }
}

/**
 * Computes island-wide summary metrics for any set of district results
 */
export function computeIslandSummary(data) {
  if (!data || data.length === 0) return null;

  const totalDistricts = data.length;
  const todaySum = data.reduce((acc, d) => acc + (Number(d.today_rain_mm) || 0), 0);
  const yesterdaySum = data.reduce((acc, d) => acc + (Number(d.yesterday_rain_mm) || 0), 0);

  const todayAvg = parseFloat((todaySum / totalDistricts).toFixed(2));
  const yesterdayAvg = parseFloat((yesterdaySum / totalDistricts).toFixed(2));
  const deltaAvg = parseFloat((todayAvg - yesterdayAvg).toFixed(2));
  const pctAvg = computePercentageChange(todayAvg, yesterdayAvg);

  // Wettest district
  const sortedToday = [...data].sort((a, b) => b.today_rain_mm - a.today_rain_mm);
  const sortedYesterday = [...data].sort((a, b) => b.yesterday_rain_mm - a.yesterday_rain_mm);

  const wettestToday = sortedToday[0] || null;
  const wettestYesterday = sortedYesterday[0] || null;

  // Rainiest station
  let allStations = [];
  data.forEach((d) => {
    d.stations.forEach((s) => {
      allStations.push({ ...s, district: d.district, zone: d.zone });
    });
  });

  const rainiestStationToday = [...allStations].sort((a, b) => b.today_rain - a.today_rain)[0] || null;

  const rainyDistrictsToday = data.filter((d) => (Number(d.today_rain_mm) || 0) > 0.1).length;
  const rainyDistrictsYesterday = data.filter((d) => (Number(d.yesterday_rain_mm) || 0) > 0.1).length;

  return {
    totalDistricts,
    totalStations: allStations.length,
    todayAvg,
    yesterdayAvg,
    deltaAvg,
    pctAvg,
    wettestToday,
    wettestYesterday,
    rainiestStationToday,
    rainyDistrictsToday,
    rainyDistrictsYesterday
  };
}
