import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import StartGame from './main';

export const PhaserGame = forwardRef(function PhaserGame(_props, ref) {
  const mountRef = useRef(null);
  const apiRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      scene: {
        scene: {
          restart() {
            try {
              apiRef.current?.scene?.restart?.('Main');
            } catch {
              const scene = apiRef.current?.scene?.getScene?.('Main');
              scene?.scene?.restart?.();
            }
          },
        },
      },
    };
  }, []);

  useEffect(() => {
    apiRef.current = StartGame(mountRef.current);
    return () => {
      apiRef.current?.destroy?.(true);
      apiRef.current = null;
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: 340, borderRadius: 12, border: '1px solid #e0e0e0', overflow: 'hidden' }} />;
});

