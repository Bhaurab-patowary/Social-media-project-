export function isAuthenticated() {
  const token = localStorage.getItem("token"); // or read from cookie if using httpOnly
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch {
    return false;
  }
}