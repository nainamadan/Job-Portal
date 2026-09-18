"use client";

import React, { useEffect, useRef, useState } from "react";

export default function FooterVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 700);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handle initial video load metadata
    const handleLoadedMetadata = () => {
      if (isMobile) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    if (isMobile) {
      video.loop = true;
      video.play().catch(() => {});
      return;
    }

    let animationFrameId: number | null = null;
    let targetTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!video || isNaN(video.duration) || video.duration === 0) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Center point of the video component or viewport
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      // Calculate angle from -PI to PI, then normalize to 0..1 ratio
      let angle = Math.atan2(dy, dx); // radians: -PI to PI
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      
      const ratio = angle / (2 * Math.PI);
      targetTime = ratio * video.duration;

      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          if (video && Math.abs(video.currentTime - targetTime) > 0.03) {
            video.currentTime = targetTime;
          }
          animationFrameId = null;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMobile]);

  return (
    <div ref={containerRef} className="video-container">
      <video
        ref={videoRef}
        src="/footer-background.mp4"
        muted
        playsInline
        preload="auto"
        className="video-element"
      />
    </div>
  );
}
