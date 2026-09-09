/**
 * Lightens (positive percent) or darkens (negative percent) a hex color.
 * Used to derive hover/dark shades from a single admin-picked brand color.
 * e.g. shadeColor('#003580', -20) -> a darker navy for hover states.
 */
export function shadeColor(hex, percent) {
  if (!hex || !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
    return hex
  }

  let color = hex.replace('#', '')
  if (color.length === 3) {
    color = color.split('').map((c) => c + c).join('')
  }

  const num = parseInt(color, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff

  r = Math.min(255, Math.max(0, Math.round(r + (percent / 100) * (percent > 0 ? 255 - r : r))))
  g = Math.min(255, Math.max(0, Math.round(g + (percent / 100) * (percent > 0 ? 255 - g : g))))
  b = Math.min(255, Math.max(0, Math.round(b + (percent / 100) * (percent > 0 ? 255 - b : b))))

  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}