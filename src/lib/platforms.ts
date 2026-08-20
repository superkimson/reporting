import type { IconType } from "react-icons";
import { FaInstagram, FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa6";
import type { Platform } from "@/generated/prisma/enums";

export interface PlatformConfig {
  id: Platform;
  label: string;
  icon: IconType;
  /** Couleur de marque (icônes, nav ET courbes du graphique) — référence une
   *  variable CSS pour pouvoir s'adapter au mode sombre (ex: TikTok). */
  color: string;
  followersLabel: string;
  impressionsLabel: string;
  engagementsLabel: string;
  hasWatchTime: boolean;
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  INSTAGRAM: {
    id: "INSTAGRAM",
    label: "Instagram",
    icon: FaInstagram,
    color: "var(--brand-instagram)",
    followersLabel: "Abonnés",
    impressionsLabel: "Impressions",
    engagementsLabel: "Engagements",
    hasWatchTime: false,
  },
  FACEBOOK: {
    id: "FACEBOOK",
    label: "Facebook",
    icon: FaFacebook,
    color: "var(--brand-facebook)",
    followersLabel: "Abonnés",
    impressionsLabel: "Impressions",
    engagementsLabel: "Engagements",
    hasWatchTime: false,
  },
  YOUTUBE: {
    id: "YOUTUBE",
    label: "YouTube",
    icon: FaYoutube,
    color: "var(--brand-youtube)",
    followersLabel: "Abonnés",
    impressionsLabel: "Vues totales",
    engagementsLabel: "Engagements",
    hasWatchTime: true,
  },
  TIKTOK: {
    id: "TIKTOK",
    label: "TikTok",
    icon: FaTiktok,
    color: "var(--brand-tiktok)",
    followersLabel: "Abonnés",
    impressionsLabel: "Vues totales",
    engagementsLabel: "Engagements",
    hasWatchTime: true,
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export const PERIOD_TYPE_LABELS: Record<"WEEKLY" | "MONTHLY", string> = {
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuel",
};
