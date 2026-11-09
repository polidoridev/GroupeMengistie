export const consentCookie = "gm_consent_v1";
export const floorCookie = "gm_floor_v1";
export const maxAge = 60 * 60 * 24 * 180;
export interface FloorSelection {room:string;finish:string;palette:number;base:string;accent:string;comparison:number}
export function parseFloorSelection(value: string | undefined): FloorSelection | null {
  if (!value) return null;
  try {
    const s = JSON.parse(value);
    if (!s || !["Garage","Kitchen","Bathroom","Basement"].includes(s.room) || !["Metallic","Flake"].includes(s.finish)
      || !Number.isInteger(s.palette) || s.palette < -1 || s.palette > 5
      || typeof s.base !== "string" || !/^#[\da-f]{6}$/i.test(s.base)
      || typeof s.accent !== "string" || !/^#[\da-f]{6}$/i.test(s.accent)
      || typeof s.comparison !== "number" || !Number.isFinite(s.comparison) || s.comparison < 0 || s.comparison > 100) return null;
    return {room:s.room,finish:s.finish,palette:s.palette,base:s.base,accent:s.accent,comparison:s.comparison};
  } catch { return null; }
}
export function readCookie(name: string): string | undefined {
  try {
    const value = document.cookie.split("; ").find(item=>item.startsWith(name+"="))?.slice(name.length+1);
    return value === undefined ? undefined : decodeURIComponent(value);
  } catch { return undefined; }
}
export function writeCookie(name: string, value: string, age = maxAge) {
  try { document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${age}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; }
  catch { /* Preferences still work for this visit if browser storage is blocked. */ }
}
