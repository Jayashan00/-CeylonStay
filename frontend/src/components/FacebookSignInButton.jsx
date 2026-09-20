import React, { useEffect, useState } from 'react'
import { FACEBOOK_APP_ID } from '../facebookConfig.js'

/**
 * "Continue with Facebook" button using Facebook's own JS SDK. Facebook
 * doesn't provide a ready-made official widget like Google does, so this
 * renders a standard custom button and calls FB.login() directly — the
 * same approach most sites use.
 */
export default function FacebookSignInButton({ onAccessToken, label = 'Continue with Facebook' }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.FB) {
      setReady(true)
      return
    }

    window.fbAsyncInit = function () {
      window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0' })
      setReady(true)
    }

    if (document.getElementById('facebook-jssdk')) return
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  function handleClick() {
    if (!window.FB) return
    window.FB.login((response) => {
      if (response.authResponse) {
        onAccessToken(response.authResponse.accessToken)
      }
    }, { scope: 'public_profile,email' })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready}
      className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2.5 font-medium text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95Z" />
      </svg>
      {label}
    </button>
  )
}