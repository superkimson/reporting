import { Document, Page, Text, View, Svg, Path, StyleSheet } from "@react-pdf/renderer";
import type { PlatformExportStats } from "@/lib/dashboard-metrics";
import { PLATFORM_ICON_PATHS } from "@/lib/platform-icon-paths";
import { formatCompactNumber, formatEvolution } from "@/lib/metrics";
import type { Evolution } from "@/lib/metrics";

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b7280", marginBottom: 24 },
  block: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
  },
  blockHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  platformLabel: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  stats: { flexDirection: "row", gap: 24 },
  statTile: { flexDirection: "column" },
  statLabel: { fontSize: 9, color: "#6b7280", marginBottom: 2 },
  statValue: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  statEvolution: { fontSize: 9, marginTop: 2 },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 8, color: "#9ca3af" },
});

function evolutionColor(evolution: Evolution): string {
  if (evolution.direction === "up") return "#0a7d0a";
  if (evolution.direction === "down") return "#c0392b";
  return "#9ca3af";
}

function StatTile({
  label,
  value,
  evolution,
}: {
  label: string;
  value: number | null;
  evolution: Evolution;
}) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value != null ? formatCompactNumber(value) : "—"}</Text>
      <Text style={[styles.statEvolution, { color: evolutionColor(evolution) }]}>
        {formatEvolution(evolution)}
      </Text>
    </View>
  );
}

export function SummaryPdfDocument({
  stats,
  editionLabel,
  rangeLabel,
}: {
  stats: PlatformExportStats[];
  editionLabel: string;
  rangeLabel: string;
}) {
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Récapitulatif réseaux sociaux</Text>
        <Text style={styles.subtitle}>
          {editionLabel} · {rangeLabel} · généré le {generatedAt}
        </Text>

        {stats.map(({ config, followers, views }) => {
          const icon = PLATFORM_ICON_PATHS[config.id];
          return (
            <View key={config.id} style={styles.block} wrap={false}>
              <View style={styles.blockHeader}>
                <View style={[styles.iconBadge, { backgroundColor: `${icon.color}1a` }]}>
                  <Svg viewBox={icon.viewBox} width={14} height={14}>
                    <Path d={icon.d} fill={icon.color} />
                  </Svg>
                </View>
                <Text style={styles.platformLabel}>{config.label}</Text>
              </View>

              <View style={styles.stats}>
                <StatTile
                  label={config.followersLabel}
                  value={followers.value}
                  evolution={followers.evolution}
                />
                <StatTile label={config.viewsLabel} value={views.value} evolution={views.evolution} />
              </View>
            </View>
          );
        })}

        <Text style={styles.footer}>Social Dashboard — export généré automatiquement</Text>
      </Page>
    </Document>
  );
}
