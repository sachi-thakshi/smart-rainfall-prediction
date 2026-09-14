// Maps the API's free-text weather_condition into the token used by
// global.css ([data-condition="..."]) plus a small display icon/label.
// Centralizing this means the background-color logic never leaks into
// components as hardcoded Tailwind classes.

const CONDITION_MAP = [
  { match: /severe/i, token: "severe", icon: "⛈️", label: "Severe Rain" },
  { match: /heavy rain|rain/i, token: "rainy", icon: "🌧️", label: "Heavy Rain" },
  { match: /hot|sunlight|sunny/i, token: "hot", icon: "☀️", label: "High Sunlight" },
  { match: /clear|good day/i, token: "clear", icon: "🌤️", label: "Clear Skies" },
];

export function resolveCondition(weatherConditionText = "") {
  const found = CONDITION_MAP.find((c) => c.match.test(weatherConditionText));
  return found ?? { token: "clear", icon: "🌤️", label: weatherConditionText || "Clear Skies" };
}

export function alertTone(alertStatusText = "") {
  if (/high|severe|red/i.test(alertStatusText)) return "alert-high";
  if (/moderate|orange/i.test(alertStatusText)) return "alert-moderate";
  return "alert-low";
}
