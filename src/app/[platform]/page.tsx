import { notFound } from "next/navigation";

import { PlatformView } from "@/components/platform-view";
import { PLATFORM_LIST } from "@/lib/platforms";
import { getEntriesByPlatform } from "@/lib/queries";
import type { Platform } from "@/generated/prisma/enums";

export function generateStaticParams() {
  return PLATFORM_LIST.map((config) => ({ platform: config.id.toLowerCase() }));
}

function resolvePlatform(slug: string): Platform | null {
  const match = PLATFORM_LIST.find((config) => config.id.toLowerCase() === slug.toLowerCase());
  return match?.id ?? null;
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform: slug } = await params;
  const platform = resolvePlatform(slug);
  if (!platform) notFound();

  const entries = await getEntriesByPlatform(platform);

  return <PlatformView platform={platform} entries={entries} />;
}
