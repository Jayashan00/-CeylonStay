import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/client.js'
import { shadeColor } from '../utils/color.js'

const SiteSettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  siteName: 'Official Direct Booking Platform',
  tagline: 'Find your next stay with an extra discount anywhere in Sri Lanka',
  heroDescription: 'From colonial hotels on Galle Face Green to clifftop resorts above Weligama Bay — search hotels, resorts, villas and homestays island-wide.',
  logoUrl: '', faviconUrl: '',
  heroImageUrl: 'https://images.pexels.com/photos/11434425/pexels-photo-11434425.jpeg?auto=compress&cs=tinysrgb&w=1800',
  primaryColor: '#003580', accentColor: '#febb02',
  contactEmail: 'directbookinglk@gmail.com', contactPhone: '+94 777186226',
  footerAbout: 'Direct Booking Platform for hotels, resorts, Guest Houses, villas, bungalows, and all accommodation in Sri Lanka',
  footerCopyright: '© 2026 Official Direct Booking Platform. All rights reserved from Layathraa Holidays.',
  currencySymbol: 'Rs', translationEnabled: true, defaultLanguage: 'en',
  availableLanguages: ['en','si','ta','hi','fr','de','es','it','ja','ko','zh-CN','ar'],
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const applyTheme = useCallback((s) => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', s.primaryColor || DEFAULT_SETTINGS.primaryColor)
    root.style.setProperty('--color-primary-light', shadeColor(s.primaryColor || DEFAULT_SETTINGS.primaryColor, 25))
    root.style.setProperty('--color-primary-dark', shadeColor(s.primaryColor || DEFAULT_SETTINGS.primaryColor, -30))
    root.style.setProperty('--color-accent', s.accentColor || DEFAULT_SETTINGS.accentColor)
    root.style.setProperty('--color-accent-dark', shadeColor(s.accentColor || DEFAULT_SETTINGS.accentColor, -15))
    document.title = s.siteName || DEFAULT_SETTINGS.siteName
    if (s.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']")
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
      link.href = s.faviconUrl
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/settings')
      const merged = { ...DEFAULT_SETTINGS, ...data }
      setSettings(merged); applyTheme(merged)
    } catch { applyTheme(DEFAULT_SETTINGS) }
    finally { setLoading(false) }
  }, [applyTheme])

  useEffect(() => { load() }, [load])
  return <SiteSettingsContext.Provider value={{ settings, loading, refresh: load }}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() { return useContext(SiteSettingsContext) }
