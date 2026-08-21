import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Entry } from "@/generated/prisma/client";
import { PLATFORMS, PERIOD_TYPE_LABELS } from "@/lib/platforms";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 12, fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e1e0d9" },
  headerRow: { backgroundColor: "#f4f4f2", fontFamily: "Helvetica-Bold" },
  cell: { padding: 6, flex: 1 },
});

export function EntriesPdfDocument({ entries }: { entries: Entry[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Historique des statistiques réseaux sociaux</Text>

        <View style={[styles.row, styles.headerRow]}>
          <Text style={styles.cell}>Réseau</Text>
          <Text style={styles.cell}>Période</Text>
          <Text style={styles.cell}>Date</Text>
          <Text style={styles.cell}>Abonnés</Text>
          <Text style={styles.cell}>Vues</Text>
          <Text style={styles.cell}>Portée</Text>
          <Text style={styles.cell}>Interactions</Text>
          <Text style={styles.cell}>Taux (%)</Text>
        </View>

        {entries.map((entry) => {
          const config = PLATFORMS[entry.platform];
          return (
            <View style={styles.row} key={entry.id}>
              <Text style={styles.cell}>{config.label}</Text>
              <Text style={styles.cell}>{PERIOD_TYPE_LABELS[entry.periodType]}</Text>
              <Text style={styles.cell}>{entry.periodDate.toISOString().slice(0, 10)}</Text>
              <Text style={styles.cell}>{entry.followers}</Text>
              <Text style={styles.cell}>{entry.views}</Text>
              <Text style={styles.cell}>{entry.reach ?? "—"}</Text>
              <Text style={styles.cell}>{entry.interactions ?? "—"}</Text>
              <Text style={styles.cell}>{entry.engagementRate?.toFixed(2) ?? "—"}</Text>
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
