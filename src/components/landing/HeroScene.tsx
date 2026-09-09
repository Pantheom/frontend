import { useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

interface HeroSceneProps {
  isVisible?: boolean;
}
export default function HeroScene({ isVisible = true }: HeroSceneProps) {
  const splineAppRef = useRef<Application | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetScene = (app: Application | null) => {
    if (!app) return;
    try {
      const eventMgr = (app as any)._eventManager || (app as any).eventManager;
      if (typeof eventMgr?.reset === 'function') {
        eventMgr.reset();
      }
    } catch {
      // Ignore any internal reset errors gracefully
    }
  };

  const startAnimationLoop = () => {
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }

    // ~3.5s animation playback + 6.0s pause between loops = 9.5s total cycle
    const ANIMATION_DURATION_MS = 3500;
    const PAUSE_BETWEEN_LOOPS_MS = 6000;
    const TOTAL_LOOP_CYCLE_MS = ANIMATION_DURATION_MS + PAUSE_BETWEEN_LOOPS_MS;

    loopTimerRef.current = setTimeout(() => {
      const app = splineAppRef.current;
      if (app && isVisible) {
        resetScene(app);
        startAnimationLoop();
      }
    }, TOTAL_LOOP_CYCLE_MS);
  };

  const handleLoad = (app: Application) => {
    splineAppRef.current = app;
    startAnimationLoop();
  };

  useEffect(() => {
    return () => {
      if (loopTimerRef.current) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    };
  }, []);

  return (
    <Spline
      scene="https://prod.spline.design/yIoJ7jg3Qd5Q6XzM/scene.splinecode"
      className="w-full h-full"
      onLoad={handleLoad}
    />
  );
}
