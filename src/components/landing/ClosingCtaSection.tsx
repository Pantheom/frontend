import { Link } from 'react-router-dom';

export const ClosingCtaSection = () => {
  return (
    <section className="w-full border-t border-line py-24 md:py-32">
      <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="headline font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-fog">
            Stop paying full price<br />for every token.
          </h2>
          <p className="font-body text-mist text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            Cerberus caches, routes, and classifies every request before it reaches an LLM — cutting cost without cutting quality.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Link
              to="/chat"
              className="bg-gold hover:bg-gold-hover text-void font-body font-medium px-8 h-12 inline-flex items-center justify-center rounded transition-colors"
            >
              Start chatting →
            </Link>
            <a
              href="#architecture"
              className="border border-line hover:border-fog/40 font-body px-8 h-12 inline-flex items-center justify-center rounded text-fog transition-colors"
            >
              View the architecture
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
