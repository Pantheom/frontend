import { lazy, Suspense, useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingNav } from '../components/landing/LandingNav';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { ConcreteExampleSection } from '../components/landing/ConcreteExampleSection';
import { ArchitectureSection } from '../components/landing/ArchitectureSection';
import { ClosingCtaSection } from '../components/landing/ClosingCtaSection';

const HeroScene = lazy(() => import('../components/landing/HeroScene'));

export const LandingPage = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-void text-fog font-body selection:bg-gold/20 selection:text-gold scroll-smooth overflow-x-hidden">
      {/* Full-bleed Editorial Marketing Nav */}
      <LandingNav />

      {/* Section 1: Hero — Full-Width Edge-to-Edge */}
      <section
        ref={sectionRef}
        className="w-full pt-2 pb-12 sm:pt-4 sm:pb-16 lg:pt-6 lg:pb-20"
      >
        <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="w-full pt-4 sm:pt-6 lg:pt-10">
            <h1 className="headline font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-6 text-fog">
              Stop paying full price<br />for every token.
            </h1>
            <p className="font-body text-mist text-base sm:text-lg lg:text-xl leading-relaxed mb-8 max-w-xl">
              Cerberus caches, routes, and classifies every request before it reaches an LLM — cutting cost without cutting quality.
            </p>
            <div className="flex flex-wrap gap-4">
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

          {/* Spline 3D Scene Container */}
          <div className="h-[480px] sm:h-[540px] lg:h-[620px] w-full max-w-[640px] lg:max-w-none mx-auto relative flex items-center justify-center bg-void -mt-4 sm:-mt-8 lg:-mt-12">
            <Suspense
              fallback={
                <div className="w-full h-full bg-void border border-line rounded-lg flex items-center justify-center font-mono text-xs text-mist">
                  Initializing 3D viewport...
                </div>
              }
            >
              <HeroScene isVisible={inView} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works — Full-Width Edge-to-Edge */}
      <HowItWorksSection />

      {/* Section 3: Concrete Example (Hit vs Miss) — Full-Width Edge-to-Edge */}
      <ConcreteExampleSection />

      {/* Section 4: System Architecture — Full-Width Edge-to-Edge */}
      <ArchitectureSection />

      {/* Section 5: Closing CTA — Full-Width Edge-to-Edge */}
      <ClosingCtaSection />

      {/* Full-bleed Footer */}
      <footer className="w-full py-10 bg-void">
        <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-mist">
          <span>CERBERUS • Intelligent Token Optimization</span>
          <div className="flex items-center gap-8">
            <a href="#how-it-works" className="hover:text-fog transition-colors">How it works</a>
            <a href="#architecture" className="hover:text-fog transition-colors">Architecture</a>
            <Link to="/chat" className="text-gold hover:underline">Launch Chat</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
