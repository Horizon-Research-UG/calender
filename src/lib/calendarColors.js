export const CALENDAR_COLORS = [
  { name: "Indigo", value: "#6366F1" },
  { name: "Blau", value: "#3B82F6" },
  { name: "Türkis", value: "#06B6D4" },
  { name: "Grün", value: "#10B981" },
  { name: "Limette", value: "#84CC16" },
  { name: "Gelb", value: "#F59E0B" },
  { name: "Orange", value: "#F97316" },
  { name: "Rot", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Violett", value: "#8B5CF6" },
  { name: "Schiefer", value: "#64748B" },
  { name: "Smaragd", value: "#059669" },
];

export const CATEGORIES = [
  { value: "work", label: "Arbeit", icon: "Briefcase" },
  { value: "personal", label: "Privat", icon: "User" },
  { value: "family", label: "Familie", icon: "Home" },
  { value: "health", label: "Gesundheit", icon: "HeartPulse" },
  { value: "social", label: "Sozial", icon: "Users" },
  { value: "travel", label: "Reisen", icon: "Plane" },
  { value: "other", label: "Sonstiges", icon: "Tag" },
];

export const EVENT_ICONS = [
  "Calendar", "Briefcase", "User", "Home", "HeartPulse", "Users", "Plane",
  "Coffee", "Cake", "Gift", "Music", "Dumbbell", "BookOpen", "Plane",
  "Stethoscope", "GraduationCap", "PartyPopper", "Phone", "Video", "MapPin",
];

export function getContrastText(hex) {
  if (!hex) return "#FFFFFF";
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1F2937" : "#FFFFFF";
}