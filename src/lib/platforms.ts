import type { IconType } from "react-icons";
import { FaInstagram, FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa6";
import type { Platform } from "@/generated/prisma/enums";

export interface PlatformConfig {
  id: Platform;
  label: string;
  icon: IconType;
  /** Couleur de marque, utilisée uniquement pour les petits repères UI (icônes, nav). */
  color: string;
  /** Couleur de série pour les graphiques (palette catégorielle validée CVD/contraste). */
  chartVar: string;
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
    color: "#E4405F",
    chartVar: "var(--chart-3)",
    followersLabel: "Abonnés",
    impressionsLabel: "Impressions",
    engagementsLabel: "Engagements",
    hasWatchTime: false,
  },
  FACEBOOK: {
    id: "FACEBOOK",
    label: "Facebook",
    icon: FaFacebook,
    color: "#1877F2",
    chartVar: "var(--chart-4)",
    followersLabel: "Abonnés",
    impressionsLabel: "Impressions",
    engagementsLabel: "Engagements",
    hasWatchTime: false,
  },
  YOUTUBE: {
    id: "YOUTUBE",
    label: "YouTube",
    icon: FaYoutube,
    color: "#FF0000",
    chartVar: "var(--chart-5)",
    followersLabel: "Abonnés",
    impressionsLabel: "Vues totales",
    engagementsLabel: "Engagements",
    hasWatchTime: true,
  },
  TIKTOK: {
    id: "TIKTOK",
    label: "TikTok",
    icon: FaTiktok,
    color: "#000000",
    chartVar: "var(--chart-6)",
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
