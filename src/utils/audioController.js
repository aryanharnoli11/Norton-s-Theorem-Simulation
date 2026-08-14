let currentAudioEntry = null
let playbackToken = 0

const resolveAudioUrl = (src, bustCache = false) => {
  if (!src) return ''

  // Handles spaces, brackets and leading "/" paths safely.
  const url = new URL(src, window.location.origin)

  if (bustCache) {
    url.searchParams.set('_audioRetry', Date.now().toString())
  }

  return url.href
}

const cleanAudioElement = (audio) => {
  if (!audio) return

  audio.onplay = null
  audio.onpause = null
  audio.onended = null
  audio.onerror = null
  audio.oncanplaythrough = null

  try {
    audio.pause()
    audio.currentTime = 0
    audio.removeAttribute('src')
    audio.load()
  } catch {
    // Ignore cleanup errors.
  }
}

export const stopSharedAudio = (
  reason = 'manual-stop',
  expectedOwner = null,
) => {
  const entry = currentAudioEntry

  // Walkthrough cleanup sirf walkthrough audio ko stop kare.
  // AI Guide cleanup sirf AI Guide audio ko stop kare.
  if (
    expectedOwner &&
    entry &&
    entry.owner !== expectedOwner
  ) {
    console.log('IGNORE AUDIO STOP:', {
      reason,
      expectedOwner,
      currentOwner: entry.owner,
    })

    return false
  }

  playbackToken += 1
  currentAudioEntry = null

  if (entry) {
    cleanAudioElement(entry.audio)
    entry.onStop?.()
  }

  window.speechSynthesis?.cancel()

  console.log('STOP SHARED AUDIO:', {
    reason,
    stoppedOwner: entry?.owner ?? null,
  })

  return true
}

export const playSharedAudio = ({
  src,
  owner = 'global',
  enabled = true,
  onStart,
  onEnd,
  onStop,
  onError,
}) => {
  if (!enabled || !src) {
    return null
  }

  // Every new narration interrupts the previous narration.
  stopSharedAudio(`before-play:${owner}:${src}`)

  const token = ++playbackToken

  const startAttempt = (bustCache = false) => {
    if (token !== playbackToken) return null

    const resolvedSrc = resolveAudioUrl(src, bustCache)
    const audio = new Audio()

    audio.preload = 'auto'
    audio.src = resolvedSrc

    const entry = {
      audio,
      owner,
      onStop,
      token,
    }

    currentAudioEntry = entry

    audio.onplay = () => {
      if (
        token !== playbackToken ||
        currentAudioEntry?.audio !== audio
      ) {
        return
      }

      console.log('PLAY SHARED AUDIO:', owner, resolvedSrc)
      onStart?.()
    }

    audio.onended = () => {
      if (
        token !== playbackToken ||
        currentAudioEntry?.audio !== audio
      ) {
        return
      }

      currentAudioEntry = null
      cleanAudioElement(audio)
      onEnd?.()
    }

    audio.onerror = () => {
      if (token !== playbackToken) return

      const mediaError = audio.error

      console.warn('SHARED AUDIO LOAD ERROR:', {
        owner,
        originalSrc: src,
        resolvedSrc,
        mediaErrorCode: mediaError?.code,
        mediaErrorMessage: mediaError?.message,
        retrying: !bustCache,
      })

      cleanAudioElement(audio)

      // Edge/Vite cache error: retry once with a unique query parameter.
      if (!bustCache) {
        window.setTimeout(() => {
          startAttempt(true)
        }, 50)

        return
      }

      if (currentAudioEntry?.audio === audio) {
        currentAudioEntry = null
      }

      onStop?.()
      onError?.(mediaError)
    }

    audio.load()

    audio.play().catch((error) => {
      if (token !== playbackToken) return

      // Normal when user moves to next narration before play() resolves.
      if (error?.name === 'AbortError') {
        return
      }

      console.warn('SHARED AUDIO PLAY FAILED:', {
        owner,
        src: resolvedSrc,
        name: error?.name,
        message: error?.message,
      })

      // Retry cache-related failures once.
      if (!bustCache) {
        cleanAudioElement(audio)

        window.setTimeout(() => {
          startAttempt(true)
        }, 50)

        return
      }

      if (currentAudioEntry?.audio === audio) {
        currentAudioEntry = null
      }

      onStop?.()
      onError?.(error)
    })

    return audio
  }

  return startAttempt(false)
}

export const pauseSharedAudio = (owner) => {
  const entry = currentAudioEntry

  if (!entry || (owner && entry.owner !== owner)) {
    return false
  }

  entry.audio.pause()
  return true
}

export const resumeSharedAudio = async (owner) => {
  const entry = currentAudioEntry

  if (!entry || (owner && entry.owner !== owner)) {
    return false
  }

  try {
    await entry.audio.play()
    return true
  } catch (error) {
    if (error?.name !== 'AbortError') {
      console.warn('SHARED AUDIO RESUME FAILED:', error)
    }

    return false
  }
}

export const getSharedAudioState = () => {
  const entry = currentAudioEntry

  return {
    isPlaying: Boolean(entry && !entry.audio.paused),
    owner: entry?.owner ?? null,
    src: entry?.audio?.src ?? '',
  }
}