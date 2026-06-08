import {
  Calendar, Briefcase, User, Home, HeartPulse, Users, Plane,
  Coffee, Cake, Gift, Music, Dumbbell, BookOpen,
  Stethoscope, GraduationCap, PartyPopper, Phone, Video, MapPin, Tag,
} from "lucide-react";

export const ICON_MAP = {
  Calendar, Briefcase, User, Home, HeartPulse, Users, Plane,
  Coffee, Cake, Gift, Music, Dumbbell, BookOpen,
  Stethoscope, GraduationCap, PartyPopper, Phone, Video, MapPin, Tag,
};

export function getIcon(name) {
  return ICON_MAP[name] || Calendar;
}

export const ICON_OPTIONS = [
  "Calendar", "Briefcase", "User", "Home", "HeartPulse", "Users", "Plane",
  "Coffee", "Cake", "Gift", "Music", "Dumbbell", "BookOpen",
  "Stethoscope", "GraduationCap", "PartyPopper", "Phone", "Video", "MapPin",
];