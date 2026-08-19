const activeScrollLocks = new Set()

let originalBodyOverflow = ''
let originalHtmlOverflow = ''

const getScrollElements = () => ({
  body: document.body,
  html: document.documentElement,
})

export const acquirePageScrollLock = (owner) => {
  if (!owner || activeScrollLocks.has(owner)) {
    return
  }

  const { body, html } = getScrollElements()

  if (activeScrollLocks.size === 0) {
    originalBodyOverflow = body.style.overflow
    originalHtmlOverflow = html.style.overflow
  }

  activeScrollLocks.add(owner)
  body.style.overflow = 'hidden'
  html.style.overflow = 'hidden'
}

export const releasePageScrollLock = (owner) => {
  if (!owner || !activeScrollLocks.delete(owner)) {
    return
  }

  if (activeScrollLocks.size > 0) {
    return
  }

  const { body, html } = getScrollElements()

  body.style.overflow = originalBodyOverflow
  html.style.overflow = originalHtmlOverflow
  originalBodyOverflow = ''
  originalHtmlOverflow = ''
}
