/**
 * Categorize rainfall amount in millimeters based on standard meteorological guidelines
 */
export function getRainfallCategory(mm) {
  if (mm === undefined || mm === null) return { name: 'Unknown', color: 'slate', desc: 'No data available' };
  if (mm < 0.2) {
    return {
      name: 'Dry / Trace',
      level: 'Minimal',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      iconColor: '#10b981',
      desc: 'Negligible or no precipitation expected.'
    };
  }
  if (mm < 2.5) {
    return {
      name: 'Light Rain',
      level: 'Light',
      badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      iconColor: '#38bdf8',
      desc: 'Light showers or drizzle. Minimal disruption to outdoor routines.'
    };
  }
  if (mm <= 15.0) {
    return {
      name: 'Moderate Rain',
      level: 'Moderate',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      iconColor: '#3b82f6',
      desc: 'Steady rain likely. Roads may be slick; carry an umbrella.'
    };
  }
  if (mm <= 50.0) {
    return {
      name: 'Heavy Rainfall',
      level: 'Heavy',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      iconColor: '#f59e0b',
      desc: 'Significant precipitation. Waterlogging in low-lying areas possible.'
    };
  }
  return {
    name: 'Torrential Downpour',
    level: 'Extreme',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    iconColor: '#f43f5e',
    desc: 'Intense rain. Flash flood watch and hillside slope caution advised.'
  };
}

/**
 * Probability level classification
 */
export function getProbabilityLevel(prob) {
  if (prob < 25) {
    return { label: 'Low Chance', color: 'text-emerald-400', progressColor: '#10b981' };
  }
  if (prob < 60) {
    return { label: 'Moderate Chance', color: 'text-amber-400', progressColor: '#f59e0b' };
  }
  if (prob < 85) {
    return { label: 'High Chance', color: 'text-sky-400', progressColor: '#0ea5e9' };
  }
  return { label: 'Very High / Certain', color: 'text-blue-400', progressColor: '#3b82f6' };
}

/**
 * Sri Lanka Season breakdown based on Month/Season ID
 */
export function getSeasonDetails(seasonId) {
  switch (seasonId) {
    case 1:
      return {
        name: 'Northeast Monsoon (Maha)',
        months: 'December – February',
        characteristics: 'Brings widespread rain to the North, East, and Hill slopes.'
      };
    case 2:
      return {
        name: 'First Inter-Monsoon',
        months: 'March – May',
        characteristics: 'Convective thunderstorm showers usually occurring in the afternoon.'
      };
    case 3:
      return {
        name: 'Southwest Monsoon (Yala)',
        months: 'June – September',
        characteristics: 'Heavy rainfall across Western, Southern, and Central highland slopes.'
      };
    case 4:
      return {
        name: 'Second Inter-Monsoon',
        months: 'October – November',
        characteristics: 'Widespread island-wide thunderstorms and depression formations.'
      };
    default:
      return {
        name: 'Sri Lankan Monsoonal Climate',
        months: 'All Year',
        characteristics: 'Tropical maritime climate influenced by seasonal monsoon winds.'
      };
  }
}

/**
 * Generate actionable meteorological advisory
 */
export function generateAdvisory(rainTomorrow, probability, rainfallMm, rollingRain = 0) {
  const isRain = rainTomorrow === 'YES' || probability >= 50;

  if (!isRain) {
    return {
      headline: 'Favorable Outdoor Conditions Expected',
      advice: 'Rainfall is unlikely tomorrow. Ideal for open-air agricultural work, outdoor construction, and travel.',
      travelNotice: 'Dry road conditions anticipated across major expressways and urban routes.',
      alertType: 'clear'
    };
  }

  if (rainfallMm > 40 || (rainfallMm > 25 && rollingRain > 60)) {
    return {
      headline: 'Caution: Heavy Rainfall & Drainage Alert',
      advice: `High probability (${probability}%) of heavy rainfall (~${rainfallMm} mm). Ground is saturated from past rolling rain (${rollingRain} mm).`,
      travelNotice: 'Expect delays and localized ponding on urban roads. Use caution on hill-country roads prone to earth slips.',
      alertType: 'danger'
    };
  }

  if (rainfallMm > 10 || probability > 75) {
    return {
      headline: 'Wet Weather Advisory',
      advice: `Rain is anticipated (~${rainfallMm} mm) with a ${probability}% model confidence. Waterproof clothing and umbrellas recommended.`,
      travelNotice: 'Reduced visibility and wet pavement during morning/evening commutes.',
      alertType: 'warning'
    };
  }

  return {
    headline: 'Scattered Showers Possible',
    advice: `Passing showers expected (~${rainfallMm} mm). Minimal disruption expected, keep an umbrella handy just in case.`,
    travelNotice: 'Standard transit conditions with occasional damp roads.',
    alertType: 'info'
  };
}
