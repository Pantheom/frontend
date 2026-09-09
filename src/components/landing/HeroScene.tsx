import { useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

interface HeroSceneProps {
  isVisible?: boolean;
}

export default function HeroScene({ isVisible = true }: HeroSceneProps) {
  const splineAppRef = useRef<Application | null>(null);

  const handleLoad = (app: Application) => {
    splineAppRef.current = app;
    if (!isVisible) {
      app.stop();
    }
  };

  useEffect(() => {
    const app = splineAppRef.current;
    if (!app) return;

    if (isVisible) {
      if (app.isStopped) {
        app.play();
      }
    } else {
      if (!app.isStopped) {
        app.stop();
      }
    }
  }, [isVisible]);

  return (
    <Spline
      scene="https://prod.spline.design/yIoJ7jg3Qd5Q6XzM/scene.splinecode"
      className="w-full h-full"
      onLoad={handleLoad}
    />
  );
}
