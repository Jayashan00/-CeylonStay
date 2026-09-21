import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Keeps route navigation at the top of the new page.
 * This is especially important on mobile, where React Router can otherwise
 * preserve the previous page's scroll position when moving between routes.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useLayoutEffect(() => {
    // Prevent the browser from restoring the previous page's scroll position
    // when React Router renders a new route.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Use direct scrollTop assignments so the existing global
    // `scroll-behavior: smooth` style does not animate the page back to top.
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search, hash])

  return null
}
