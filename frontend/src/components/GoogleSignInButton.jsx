import React, { useEffect, useRef } from 'react'
import { GOOGLE_CLIENT_ID } from '../googleConfig.js'

/**
 * Renders Google's own "Sign in with Google" button (their official
 * Identity Services widget — not a custom-styled lookalike, so it always
 * matches Google's current branding requirements automatically).
 *
 * onCredential receives the raw ID token string; the parent component
 * sends that to the backend (/api/auth/google) to verify it and log in.
 */
export default function GoogleSignInButton({ onCredential, text = 'continue_with' }) {
  const buttonRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    function renderButton() {
      if (!window.google?.accounts?.id || !buttonRef.current || initialized.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 320,
        text,
        shape: 'rectangular',
      })
      initialized.current = true
    }

    if (window.google?.accounts?.id) {
      renderButton()
      return
    }

    const existing = document.getElementById('google-identity-script')
    if (existing) {
      existing.addEventListener('load', renderButton)
      return () => existing.removeEventListener('load', renderButton)
    }

    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = renderButton
    document.body.appendChild(script)
  }, [onCredential, text])

  return <div ref={buttonRef} className="flex justify-center" />
}