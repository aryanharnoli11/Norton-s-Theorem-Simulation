import { useCallback, useEffect, useMemo, useState } from 'react'

import defaultWalkthroughConfig from './walkthroughConfig.json'
import { WalkthroughContext } from './WalkthroughContext.js'
import { loadWalkthroughConfig } from './walkthroughConfigLoader.js'
import WalkthroughOverlay from './components/WalkthroughOverlay.jsx'
import './walkthrough.css'
import {
  pauseSharedAudio,
  playSharedAudio,
  resumeSharedAudio,
  stopSharedAudio,
} from '../utils/audioController.js'
import {
  acquirePageScrollLock,
  releasePageScrollLock,
} from '../utils/pageScrollLock.js'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const WALKTHROUGH_AUDIO_OWNER = 'walkthrough'
const WALKTHROUGH_SCROLL_LOCK = 'walkthrough'

const resetExperimentScroll = () => {
  document.querySelectorAll('.simulation-shell').forEach((element) => {
    element.scrollLeft = 0
    element.scrollTop = 0
  })
}

const scrollPageToTop = () => {
  const resetScroll = () => {
    const scrollRoot = document.scrollingElement

    resetExperimentScroll()

    window.scrollTo({
      behavior: 'auto',
      left: 0,
      top: 0,
    })

    /* Fallbacks for browsers that use either element as the scroll root. */
    if (scrollRoot) {
      scrollRoot.scrollTop = 0
    }

    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  resetScroll()

  /* Repeat after the overlay has unmounted and the scaled page has reflowed. */
  window.setTimeout(resetScroll, 0)
  window.requestAnimationFrame(() => {
    resetScroll()
    window.requestAnimationFrame(resetScroll)
  })
}

const scrollTargetIntoViewport = (target) => {
  /*
   * scrollIntoView also scrolls overflow:hidden ancestors. The experiment
   * shell is one of those ancestors, so it can become invisibly offset.
   */
  resetExperimentScroll()

  const rect = target.getBoundingClientRect()
  const centeredTop = (
    window.scrollY
    + rect.top
    - ((window.innerHeight - rect.height) / 2)
  )

  window.scrollTo({
    behavior: 'auto',
    left: 0,
    top: Math.max(0, centeredTop),
  })
}

const getElementRect = (element) => {
  if (!element) {
    return null
  }

  const rect = element.getBoundingClientRect()

  if (rect.width === 0 && rect.height === 0) {
    return null
  }

  return {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
  }
}

const WalkthroughProvider = ({
  autoPlayAudio = false,
  children,
  config = defaultWalkthroughConfig,
  locale,
  onComplete,
}) => {
  const walkthroughConfig = useMemo(
    () => loadWalkthroughConfig(config, locale ?? config?.defaultLocale),
    [config, locale],
  )
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPositioningTarget, setIsPositioningTarget] = useState(false)
  const [targetRect, setTargetRect] = useState(null)
  //const audioRef = useRef(null)
const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const totalSteps = walkthroughConfig.steps.length
  const activeStep = isOpen ? walkthroughConfig.steps[currentStepIndex] : null
  const activeTargetSelector = activeStep?.target
  const currentStep = currentStepIndex + 1
  const canGoPrevious = currentStepIndex > 0
  const canGoNext = currentStepIndex < totalSteps - 1
  const autoPlayAudioForStep = Boolean(
    activeStep?.autoplayAudio
    ?? walkthroughConfig.audio?.autoplay
    ?? autoPlayAudio
  )

  const readActiveTarget = useCallback(() => {
    if (!activeTargetSelector) {
      setTargetRect(null)
      return null
    }
    
    const target = document.querySelector(activeTargetSelector)
    
    const nextRect = getElementRect(target)

    setTargetRect(nextRect)

    return target
  }, [activeTargetSelector])

  const moveToStep = useCallback((stepIndex) => {
    if (totalSteps === 0) {
      return
    }

    setTargetRect(null)
    setIsPositioningTarget(true)
    setCurrentStepIndex(clamp(stepIndex, 0, totalSteps - 1))
  }, [totalSteps])

  const start = useCallback((stepIndex = 0) => {
    moveToStep(stepIndex)
    setIsOpen(true)
  }, [moveToStep])
  const stopAudio = useCallback((reason = 'walkthrough-stop') => {
  stopSharedAudio(reason, WALKTHROUGH_AUDIO_OWNER)
  setIsAudioPlaying(false)
}, [])

 const close = useCallback((completed = false) => {
  stopAudio('walkthrough-close')

  /* Unlock synchronously; effect cleanup otherwise runs after this callback. */
  releasePageScrollLock(WALKTHROUGH_SCROLL_LOCK)
  setIsOpen(false)
  setIsPositioningTarget(false)
  setTargetRect(null)

  if (completed) {
    scrollPageToTop()

    window.dispatchEvent(
      new Event('walkthrough-complete'),
    )

    onComplete?.()
  }
}, [onComplete, stopAudio])
  const next = useCallback(() => {
  stopAudio('walkthrough-next')

  if (currentStepIndex >= totalSteps - 1) {
    close(true)
    return
  }

  moveToStep(currentStepIndex + 1)
}, [
  close,
  currentStepIndex,
  moveToStep,
  stopAudio,
  totalSteps,
])
  const previous = useCallback(() => {
  stopAudio('walkthrough-previous')
  moveToStep(currentStepIndex - 1)
}, [
  currentStepIndex,
  moveToStep,
  stopAudio,
])

 const goToStep = useCallback((stepIndex) => {
  stopAudio('walkthrough-go-to-step')
  moveToStep(stepIndex)
}, [moveToStep, stopAudio])
  


const playStepAudio = useCallback(() => {
  if (!activeStep?.audio) {
    setIsAudioPlaying(false)
    return
  }

  playSharedAudio({
    src: activeStep.audio,
    owner: WALKTHROUGH_AUDIO_OWNER,
    enabled: true,

    onStart: () => {
      setIsAudioPlaying(true)
    },

    onEnd: () => {
      setIsAudioPlaying(false)
    },

    onStop: () => {
      setIsAudioPlaying(false)
    },

    onError: (error) => {
      console.error('Walkthrough audio could not play:', {
        stepId: activeStep.id,
        audio: activeStep.audio,
        error,
      })

      setIsAudioPlaying(false)
    },
  })
}, [activeStep])

const toggleStepAudio = useCallback(async () => {
  if (!activeStep?.audio) return

  if (isAudioPlaying) {
    const paused = pauseSharedAudio(WALKTHROUGH_AUDIO_OWNER)

    if (paused) {
      setIsAudioPlaying(false)
    }

    return
  }

  const resumed = await resumeSharedAudio(
    WALKTHROUGH_AUDIO_OWNER,
  )

  if (resumed) {
    setIsAudioPlaying(true)
    return
  }

  // Audio end ho chuki hai ya kisi doosre owner ne replace kar di.
  // Current step ki audio beginning se start hogi.
  playStepAudio()
}, [
  activeStep,
  isAudioPlaying,
  playStepAudio,
])

const skip = useCallback(() => {
  stopAudio('walkthrough-skip')
  moveToStep(totalSteps - 1)
}, [moveToStep, stopAudio, totalSteps])
useEffect(() => {
  if (!isOpen || !activeTargetSelector) {
    return undefined
  }

  const target = document.querySelector(activeTargetSelector)

  if (target) {
    scrollTargetIntoViewport(target)
  }

  let secondAnimationFrame = null

  const animationFrame = window.requestAnimationFrame(() => {
    secondAnimationFrame = window.requestAnimationFrame(() => {
      readActiveTarget()
      setIsPositioningTarget(false)
    })
  })

  return () => {
    window.cancelAnimationFrame(animationFrame)

    if (secondAnimationFrame) {
      window.cancelAnimationFrame(secondAnimationFrame)
    }
  }
}, [activeTargetSelector, isOpen, readActiveTarget])
useEffect(() => {
  if (!isOpen || isPositioningTarget) {
    return undefined
  }

  let animationFrame = null

  const scheduleRefresh = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame)
    }

    animationFrame = window.requestAnimationFrame(readActiveTarget)
  }

  window.addEventListener('resize', scheduleRefresh)
  window.visualViewport?.addEventListener('resize', scheduleRefresh)
  window.addEventListener('scroll', scheduleRefresh, true)

  return () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame)
    }

    window.removeEventListener('resize', scheduleRefresh)
    window.visualViewport?.removeEventListener('resize', scheduleRefresh)
    window.removeEventListener('scroll', scheduleRefresh, true)
  }
}, [isOpen, isPositioningTarget, readActiveTarget])
useEffect(() => {
  if (!isOpen || !activeTargetSelector) {
    return undefined
  }

  const target = document.querySelector(activeTargetSelector)

  if (!target) {
    return undefined
  }

  target.classList.add('walkthrough-active-target')

  return () => {
    target.classList.remove('walkthrough-active-target')
  }
}, [activeTargetSelector, isOpen])
 
useEffect(() => {
  if (!isOpen) {
    return undefined
  }

  acquirePageScrollLock(WALKTHROUGH_SCROLL_LOCK)

  return () => {
    releasePageScrollLock(WALKTHROUGH_SCROLL_LOCK)
  }
}, [isOpen])
useEffect(() => {
  if (!isOpen) {
    return undefined
  }

  if (!activeStep?.audio) {
    return undefined
  }

  const animationFrame = window.requestAnimationFrame(playStepAudio)

  return () => {
    window.cancelAnimationFrame(animationFrame)
    stopAudio('walkthrough-step-cleanup')
  }
}, [
  activeStep?.id,
  activeStep?.audio,
  isOpen,
  playStepAudio,
  stopAudio,
])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }
   
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key === 'ArrowRight' && canGoNext) {
        event.preventDefault()
        next()
        return
      }

      if (event.key === 'ArrowLeft' && canGoPrevious) {
        event.preventDefault()
        previous()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, canGoPrevious, close, isOpen, next, previous])

  const contextValue = useMemo(() => ({
    activeStep,
    autoPlayAudioForStep,
    canGoNext,
    canGoPrevious,
    close,
    config: walkthroughConfig,
    currentStep,
    currentStepIndex,
    experimentName: walkthroughConfig.experimentName,
    goToStep,
    isOpen,
    isPositioningTarget,
    locale: walkthroughConfig.locale,
    next,
    previous,
    start,
    targetRect,
    totalSteps,
   isAudioPlaying,
skip,
toggleStepAudio,
  }), [
    activeStep,
    autoPlayAudioForStep,
    canGoNext,
    canGoPrevious,
    close,
    currentStep,
    currentStepIndex,
    goToStep,
    isOpen,
    isPositioningTarget,
    next,
    previous,
    start,
    targetRect,
    totalSteps,
    walkthroughConfig,
    isAudioPlaying,
skip,
toggleStepAudio,
  ])

  return (
    <WalkthroughContext.Provider value={contextValue}>
      {children}
      <WalkthroughOverlay />
    </WalkthroughContext.Provider>
  )
}

export default WalkthroughProvider
