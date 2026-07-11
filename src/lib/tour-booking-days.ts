// Day-of-week restrictions per tour (JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
// Matched against the Spanish tour name (case-insensitive, exact).
// Longer/more-specific names must come first to avoid false substring matches.
const TOUR_DAY_RULES: { match: string; days: number[] }[] = [
  {
    match: 'EN LOS CERROS DE MAVICURE Y LA ESTRELLA FLUVIAL, SENDERO LA VUELTA AL CERRO PAJARITO',
    days: [4, 5], // Thu, Fri
  },
  {
    match: 'EN LOS CERROS DE MAVICURE Y LOS DELFINES ROSADOS',
    days: [5, 6], // Fri, Sat
  },
  {
    match: 'EN LOS CERROS DE MAVICURE Y LA ESTRELLA FLUVIAL',
    days: [5, 6], // Fri, Sat
  },
  {
    match: 'AVENTURA EN LOS CERROS DE MAVICURE',
    days: [5], // Fri only
  },
];

/**
 * Returns the allowed booking days (JS day-of-week numbers) for a tour,
 * or null if there are no restrictions.
 */
export function getAllowedDays(tourNameEs: string): number[] | null {
  const upper = tourNameEs.trim().toUpperCase();
  for (const rule of TOUR_DAY_RULES) {
    if (upper === rule.match) return rule.days;
  }
  return null;
}
