import type { IconType } from "react-icons";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaDailymotion,
} from "react-icons/fa6";
import type { Platform } from "@/generated/prisma/enums";

export interface PlatformConfig {
  id: Platform;
  label: string;
  icon: IconType;
  /** Couleur de marque (icônes, nav ET courbes du graphique) — référence une
   *  variable CSS pour pouvoir s'adapter au mode sombre (ex: TikTok, Dailymotion). */
  color: string;
  /** Couleur de texte lisible par-dessus `color` (blanc pour la plupart des
   *  marques ; TikTok a besoin de la sienne, propre elle aussi au mode sombre). */
  contrastColor: string;
  followersLabel: string;
  viewsLabel: string;
  reachLabel: string;
  /** false pour WhatsApp, YouTube et Dailymotion : uniquement Abonnés + Vues. */
  hasReach: boolean;
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  INSTAGRAM: {
    id: "INSTAGRAM",
    label: "Instagram",
    icon: FaInstagram,
    color: "var(--brand-instagram)",
    contrastColor: "#ffffff",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    hasReach: true,
  },
  FACEBOOK: {
    id: "FACEBOOK",
    label: "Facebook",
    icon: FaFacebook,
    color: "var(--brand-facebook)",
    contrastColor: "#ffffff",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    hasReach: true,
  },
  TIKTOK: {
    id: "TIKTOK",
    label: "TikTok",
    icon: FaTiktok,
    color: "var(--brand-tiktok)",
    contrastColor: "var(--brand-tiktok-contrast)",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    hasReach: true,
  },
  WHATSAPP: {
    id: "WHATSAPP",
    label: "WhatsApp",
    icon: FaWhatsapp,
    color: "var(--brand-whatsapp)",
    contrastColor: "#ffffff",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    hasReach: false,
  },
  YOUTUBE: {
    id: "YOUTUBE",
    label: "YouTube",
    icon: FaYoutube,
    color: "var(--brand-youtube)",
    contrastColor: "#ffffff",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    hasReach: false,
  },
  DAILYMOTION: {
    id: "DAILYMOTION",
    label: "Dailymotion",
    icon: FaDailymotion,
    color: "var(--brand-dailymotion)",
    contrastColor: "#ffffff",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    hasReach: false,
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export const PERIOD_TYPE_LABELS: Record<"WEEKLY" | "MONTHLY", string> = {
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuel",
};
