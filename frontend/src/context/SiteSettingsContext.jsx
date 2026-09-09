import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/client.js'
import { shadeColor } from '../utils/color.js'

const SiteSettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  siteName: 'CeylonStay',
  tagline: "Find your next stay, anywhere in Sri Lanka",
  logoUrl: '',
  faviconUrl: '',
  heroImageUrl: 'https://images.pexels.com/photos/11434425/pexels-photo-11434425.jpeg?auto=compress&cs=tinysrgb&w=1800',
  primaryColor: '#003580',
  accentColor: '#febb02',
  contactEmail: 'help@ceylonstay.lk',
  contactPhone: '+94 11 234 5678',
  footerAbout: "Sri Lanka's own platform for hotels, resorts, villas and homestays — from Colombo's skyline to the beaches of the south.",
  currencySymbol: 'Rs',
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const applyTheme = useCallback((s) => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', s.primaryColor)
    root.style.setProperty('--color-primary-light', shadeColor(s.primaryColor, 25))
    root.style.setProperty('--color-primary-dark', shadeColor(s.primaryColor, -30))
    root.style.setProperty('--color-accent', s.accentColor)
    root.style.setProperty('--color-accent-dark', shadeColor(s.accentColor, -15))

    if (s.siteName) document.title = s.siteName
    if (s.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = s.faviconUrl
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/settings')
      setSettings(data)
      applyTheme(data)
    } catch {
      // Backend not reachable yet — keep defaults, still apply them so the
      // theme is consistent even before the API responds.
      applyTheme(DEFAULT_SETTINGS)
    } finally {
      setLoading(false)
    }
  }, [applyTheme])

  useEffect(() => { load() }, [load])

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: load }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}