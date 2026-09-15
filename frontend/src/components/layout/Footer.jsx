import { Droplets, Mail, Sprout } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-ink/10 bg-surface-raised px-5 pb-8 pt-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">

          {/* Brand */}
          <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="clay-panel flex h-9 w-9 items-center justify-center rounded-2xl">
                <Droplets className="h-4.5 w-4.5 text-rice" />
              </span>
              <span className="font-display text-lg font-bold text-ink">SmartRain</span>
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              ML-powered rainfall forecasts and crop recommendations for Sri Lanka's 30 meteorological stations.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">Product</h4>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li><a href="#" className="transition-colors hover:text-rice-dark">Weather Map</a></li>
              <li><a href="#" className="transition-colors hover:text-rice-dark">Crop Recommendations</a></li>
              <li><a href="#" className="transition-colors hover:text-rice-dark">7-Day Forecast</a></li>
              <li><a href="#" className="transition-colors hover:text-rice-dark">Meteorological Stations</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">Resources</h4>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li><a href="#" className="transition-colors hover:text-rice-dark">Yala & Maha Seasons</a></li>
              <li><a href="#" className="transition-colors hover:text-rice-dark">API Documentation</a></li>
              <li><a href="#" className="transition-colors hover:text-rice-dark">About the ML Model</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">Connect</h4>
            <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="Email"
                className="clay-panel flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-rice-dark"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-6 text-xs text-ink-muted sm:flex-row">
          <p>© {year} SmartRain. Built for Sri Lankan farmers.</p>
          <p className="flex items-center gap-1.5">
            <Sprout className="h-3.5 w-3.5 text-rice" />
            Forecasts refreshed daily via ML pipeline
          </p>
        </div>
      </div>
    </footer>
  );
}