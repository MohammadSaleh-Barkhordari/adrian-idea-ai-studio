// Single source of truth for who can access the "Our Life" section.
export const OUR_LIFE_EMAILS = [
  'r.sattari@adrianidea.ir',
  'm.barkhordari@adrianidea.ir',
] as const;

export function hasOurLifeAccess(email?: string | null): boolean {
  if (!email) return false;
  return OUR_LIFE_EMAILS.includes(email.trim().toLowerCase() as typeof OUR_LIFE_EMAILS[number]);
}
