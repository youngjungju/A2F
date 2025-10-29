'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const IDLE_TIMEOUT = 60000; // 1 minute (60 seconds)

export default function ScreenSaver() {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  // Update ref when state changes
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If screen saver is active, deactivate it
    if (isActiveRef.current) {
      setIsActive(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Activating screen saver');
      setIsActive(true);
    }, IDLE_TIMEOUT);
  }, []);

  // Play video when screen saver becomes active
  useEffect(() => {
    if (isActive && videoRef.current) {
      console.log('Playing video');
      const video = videoRef.current;

      // Ensure video is ready
      const attemptPlay = () => {
        // Force reload and play
        video.load();

        // Small delay to ensure video is loaded
        setTimeout(() => {
          const playPromise = video.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Video playing successfully');
              })
              .catch((error) => {
                console.error('Error playing video:', error);
                // Retry multiple times
                let retries = 0;
                const retryInterval = setInterval(() => {
                  if (retries < 5 && isActiveRef.current) {
                    video.play()
                      .then(() => {
                        console.log('Video playing after retry');
                        clearInterval(retryInterval);
                      })
                      .catch(() => {
                        retries++;
                        console.log(`Retry attempt ${retries}`);
                      });
                  } else {
                    clearInterval(retryInterval);
                  }
                }, 500);
              });
          }
        }, 100);
      };

      attemptPlay();
    }
  }, [isActive]);

  useEffect(() => {
    // Events to monitor for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [resetTimer]);

  if (!isActive) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source
          src="https://njdeanhnuzthyptzsjtw.supabase.co/storage/v1/object/sign/video/A2F%20Background%20video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jM2Q0ZjM3MS05YThjLTQ3NGMtOGM2MS0xNzAxNWZiYTAyZjIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby9BMkYgQmFja2dyb3VuZCB2aWRlby5tcDQiLCJpYXQiOjE3NjE2OTg5MTEsImV4cCI6ODY1NzYxNjEyNTExfQ.FFUiu80MXR7gMz00VJYFjLU2ITagOzrsm55w5hDsa8o"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
