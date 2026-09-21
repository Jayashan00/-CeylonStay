import React, { useEffect, useRef, useState } from 'react'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'

const LANGS = [
  ['en', 'English'], ['si', 'සිංහල'], ['ta', 'தமிழ்'], ['hi', 'हिन्दी'],
  ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'], ['it', 'Italiano'],
  ['ja', '日本語'], ['ko', '한국어'], ['zh-CN', '中文'], ['ar', 'العربية'],
]

export default function LanguageSelector() {
  const { settings } = useSiteSettings()
  const [language, setLanguage] = useState(localStorage.getItem('directbooking_language') || settings.defaultLanguage || 'en')
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (settings.translationEnabled === false || scriptLoaded.current) return
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        autoDisplay: false,
        includedLanguages: (settings.availableLanguages || LANGS.map(([code]) => code)).join(','),
      }, 'google_translate_element')
    }
    const existing = document.querySelector('script[data-google-translate]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    script.dataset.googleTranslate = 'true'
    document.body.appendChild(script)
    scriptLoaded.current = true
  }, [settings.translationEnabled, settings.availableLanguages])

  function selectLanguage(code) {
    setLanguage(code)
    localStorage.setItem('directbooking_language', code)
    const combo = document.querySelector('.goog-te-combo')
    if (combo) {
      combo.value = code
      combo.dispatchEvent(new Event('change'))
    } else if (code === 'en') {
      document.cookie = 'googtrans=/en/en;path=/;max-age=31536000'
      window.location.reload()
    }
  }

  if (settings.translationEnabled === false) return null

  const allowed = settings.availableLanguages?.length
    ? LANGS.filter(([code]) => settings.availableLanguages.includes(code))
    : LANGS

  return (
    <>
      <div id="google_translate_element" className="absolute -left-[99999px] -top-[99999px]" aria-hidden="true" />
      <select
        value={language}
        onChange={(e) => selectLanguage(e.target.value)}
        className="bg-white/10 text-white border border-white/20 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none max-w-[118px]"
        aria-label="Choose language"
      >
        {allowed.map(([code, label]) => <option key={code} value={code} className="text-slate-800">{label}</option>)}
      </select>
    </>
  )
}