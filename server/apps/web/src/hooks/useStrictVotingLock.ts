import { useEffect, useRef, useState } from "react"

export const useStrictVotingLock = () => {
  const [isLocked, setIsLocked] = useState(true)
  const [violated, setViolated] = useState(false)
  const violationCount = useRef(0)

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen()
          }
        }
      } catch (e) {
        console.warn("Fullscreen failed", e)
      }
    }

    enterFullscreen()

    // 🚫 TAB SWITCH / WINDOW BLUR
    const handleBlur = () => {
      if (isLocked) {
        violationCount.current += 1
        setViolated(true)
      }
    }

    // 🚫 VISIBILITY CHANGE
    const handleVisibility = () => {
      if (document.hidden && isLocked) {
        violationCount.current += 1
        setViolated(true)
      }
    }

    // 🚫 EXIT FULLSCREEN
    const handleFullscreenExit = () => {
      if (!document.fullscreenElement && isLocked) {
        setViolated(true)
      }
    }

    // 🚫 KEYBOARD BLOCK
    const blockKeys = (e: KeyboardEvent) => {
      if (isLocked) {
        // console.log("Key pressed:", e.key, e.code);
        if (
          e.ctrlKey ||
          e.metaKey ||
          e.altKey ||
          e.key === "Tab" ||
          e.key === "Escape" ||
          e.key === "F12" ||
          e.key === "F5" ||
          (e.ctrlKey && e.key === "r") ||
          (e.metaKey && e.key === "r")
        ) {
          e.preventDefault()
          setViolated(true)
        }
      }
    }

    // 🚫 RIGHT CLICK
    const blockRightClick = (e: MouseEvent) => {
      if (isLocked) {
        e.preventDefault()
      }
    }

    // 🚫 NAVIGATION
    const preventUnload = (e: BeforeUnloadEvent) => {
      if (isLocked) {
        e.preventDefault()
        // @ts-ignore
        e.returnValue = ""
      }
    }

    const interval = setInterval(() => {
      if (isLocked && !document.fullscreenElement) {
        enterFullscreen();
      }
    }, 3000);

    window.addEventListener("blur", handleBlur)
    document.addEventListener("visibilitychange", handleVisibility)
    document.addEventListener("fullscreenchange", handleFullscreenExit)
    document.addEventListener("keydown", blockKeys)
    document.addEventListener("contextmenu", blockRightClick)
    window.addEventListener("beforeunload", preventUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("visibilitychange", handleVisibility)
      document.removeEventListener("fullscreenchange", handleFullscreenExit)
      document.removeEventListener("keydown", blockKeys)
      document.removeEventListener("contextmenu", blockRightClick)
      window.removeEventListener("beforeunload", preventUnload)
    }
  }, [isLocked])

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
