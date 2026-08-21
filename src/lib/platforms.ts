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
  followersLabel: string;
  viewsLabel: string;
  reachLabel: string;
  interactionsLabel: string;
  /** false pour YouTube et Dailymotion : uniquement Abonnés + Vues. */
  hasFullMetrics: boolean;
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  INSTAGRAM: {
    id: "INSTAGRAM",
    label: "Instagram",
    icon: FaInstagram,
    color: "var(--brand-instagram)",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    interactionsLabel: "Interactions",
    hasFullMetrics: true,
  },
  FACEBOOK: {
    id: "FACEBOOK",
    label: "Facebook",
    icon: FaFacebook,
    color: "var(--brand-facebook)",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    interactionsLabel: "Interactions",
    hasFullMetrics: true,
  },
  TIKTOK: {
    id: "TIKTOK",
    label: "TikTok",
    icon: FaTiktok,
    color: "var(--brand-tiktok)",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    interactionsLabel: "Interactions",
    hasFullMetrics: true,
  },
  WHATSAPP: {
    id: "WHATSAPP",
    label: "WhatsApp",
    icon: FaWhatsapp,
    color: "var(--brand-whatsapp)",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    interactionsLabel: "Interactions",
    hasFullMetrics: true,
  },
  YOUTUBE: {
    id: "YOUTUBE",
    label: "YouTube",
    icon: FaYoutube,
    color: "var(--brand-youtube)",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    interactionsLabel: "Interactions",
    hasFullMetrics: false,
  },
  DAILYMOTION: {
    id: "DAILYMOTION",
    label: "Dailymotion",
    icon: FaDailymotion,
    color: "var(--brand-dailymotion)",
    followersLabel: "Abonnés",
    viewsLabel: "Vues",
    reachLabel: "Portée",
    interactionsLabel: "Interactions",
    hasFullMetrics: false,
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export const PERIOD_TYPE_LABELS: Record<"WEEKLY" | "MONTHLY", string> = {
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuel",
};
