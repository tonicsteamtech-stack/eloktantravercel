import { useEffect, useState } from "react"

export const useSecureVoting = () => {
  const [isLocked, setIsLocked] = useState(true)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (err) {
        console.error("Fullscreen request failed", err)
      }
    }

    enterFullscreen()

    // Webcam proctoring
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        console.log("Camera active")
      })
      .catch(() => {
        console.log("Camera denied")
      })

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1)
        alert("Tab switching is not allowed during voting")
      }
    }

    const disableKeys = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.key === "F12" ||
        e.key === "Escape" ||
        e.key === "Tab"
      ) {
        e.preventDefault()
      }
    }

    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault()
    }

    const preventExit = (e: BeforeUnloadEvent) => {
      if (isLocked) {
        e.preventDefault()
        // @ts-ignore
        e.returnValue = ""
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    document.addEventListener("keydown", disableKeys)
    document.addEventListener("contextmenu", disableRightClick)
    window.addEventListener("beforeunload", preventExit)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      document.removeEventListener("keydown", disableKeys)
      document.removeEventListener("contextmenu", disableRightClick)
      window.removeEventListener("beforeunload", preventExit)
    }
  }, [isLocked])

  const unlockVoting = () => {
    setIsLocked(false)
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  return { isLocked, unlockVoting, tabSwitchCount }
}
