import { useEffect, useRef, useState } from "react"

export const useStrictVotingLock = (isActive: boolean = true) => {
  const [isLocked, setIsLocked] = useState(isActive)
  const [violated, setViolated] = useState(false)
  const violationCount = useRef(0)

  useEffect(() => {
    if (!isActive) return;
    setIsLocked(true);

    const enterFullscreen = async () => {
      try {
        const docElmWithBrowsersFullScreenFunctions = document.documentElement as HTMLElement & {
          mozRequestFullScreen(): Promise<void>;
          webkitRequestFullscreen(): Promise<void>;
          msRequestFullscreen(): Promise<void>;
        };

        if (!document.fullscreenElement) {
          if (docElmWithBrowsersFullScreenFunctions.requestFullscreen) {
            await docElmWithBrowsersFullScreenFunctions.requestFullscreen();
          } else if (docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen) {
            await docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen();
          } else if (docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen) {
            await docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen();
          } else if (docElmWithBrowsersFullScreenFunctions.msRequestFullscreen) {
            await docElmWithBrowsersFullScreenFunctions.msRequestFullscreen();
          }
        }
      } catch (e) {
        console.warn("Fullscreen failed", e);
      }
    };

    enterFullscreen();

    // ⚡ Dev Mode Bypass: Don't terminate the session if ?dev=true is in the URL
    const isDev = typeof window !== 'undefined' && window.location.search.includes('dev=true');

    // 🚫 TAB SWITCH / WINDOW BLUR
    const handleBlur = () => {
      if (isLocked && !isDev) {
        violationCount.current += 1;
        setViolated(true);
      } else if (isDev) {
        console.warn("Dev Mode: Ignoring Window Blur violation.");
      }
    };

    // 🚫 VISIBILITY CHANGE
    const handleVisibility = () => {
      if (document.hidden && isLocked && !isDev) {
        violationCount.current += 1;
        setViolated(true);
      } else if (isDev && document.hidden) {
        console.warn("Dev Mode: Ignoring Visibility Change violation.");
      }
    };

    // 🚫 EXIT FULLSCREEN
    const handleFullscreenExit = () => {
      const isFullscreen = document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      if (!isFullscreen && isLocked) {
        setViolated(true);
      }
    };

    // 🚫 KEYBOARD BLOCK
    const blockKeys = (e: KeyboardEvent) => {
      if (isLocked) {
        if (
          e.ctrlKey ||
          e.metaKey ||
          e.altKey ||
          e.key === "Tab" ||
          e.key === "Escape" ||
          e.key === "F12" ||
          e.key === "Option" ||
          e.key === "F5" ||
          (e.ctrlKey && e.key === "r") ||
          (e.metaKey && e.key === "r")
        ) {
          e.preventDefault();
          e.stopPropagation();
          setViolated(true);
        }
      }
    };

    // 🚫 RIGHT CLICK
    const blockRightClick = (e: MouseEvent) => {
      if (isLocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 🚫 NAVIGATION
    const preventUnload = (e: BeforeUnloadEvent) => {
      if (isLocked) {
        e.preventDefault();
        e.stopPropagation();
        e.returnValue = "Are you sure you want to leave the voting session? Your attempt will be voided.";
        return e.returnValue;
      }
    };

    const interval = setInterval(() => {
      if (isLocked && !document.fullscreenElement) {
        enterFullscreen();
      }
    }, 3000);

    window.addEventListener("blur", handleBlur, { capture: true });
    document.addEventListener("visibilitychange", handleVisibility, { capture: true });
    document.addEventListener("fullscreenchange", handleFullscreenExit, { capture: true });
    document.addEventListener("webkitfullscreenchange", handleFullscreenExit, { capture: true });
    document.addEventListener("mozfullscreenchange", handleFullscreenExit, { capture: true });
    document.addEventListener("MSFullscreenChange", handleFullscreenExit, { capture: true });
    document.addEventListener("keydown", blockKeys, { capture: true });
    document.addEventListener("contextmenu", blockRightClick, { capture: true });
    window.addEventListener("beforeunload", preventUnload, { capture: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("blur", handleBlur, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibility, { capture: true });
      document.removeEventListener("fullscreenchange", handleFullscreenExit, { capture: true });
      document.removeEventListener("webkitfullscreenchange", handleFullscreenExit, { capture: true });
      document.removeEventListener("mozfullscreenchange", handleFullscreenExit, { capture: true });
      document.removeEventListener("MSFullscreenChange", handleFullscreenExit, { capture: true });
      document.removeEventListener("keydown", blockKeys, { capture: true });
      document.removeEventListener("contextmenu", blockRightClick, { capture: true });
      window.removeEventListener("beforeunload", preventUnload, { capture: true });
    };
  }, [isActive, isLocked]);

  const unlock = () => {
    setIsLocked(false)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Exit fullscreen failed", err))
    }
  }

  return {
    isLocked,
    violated,
    violationCount: violationCount.current,
    unlock
  }
}
