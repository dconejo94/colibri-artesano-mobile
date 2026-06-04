import { StyleSheet } from "react-native";
import { s, vs, ms } from "@/utils/scale";

// Shared styles consumed by all store management screens.
// Screen-specific styles remain local to each screen file.
const shared = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  wrapperDark: { backgroundColor: "#000" },


  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    backgroundColor: "#fff",
  },
  headerDark: { backgroundColor: "#000" },
  headerTitle: { fontSize: ms(16), fontWeight: "700", color: "#000" },
  headerSpacer: { width: s(80) },


  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: vs(12) },


  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: ms(16),
    padding: s(20),
    gap: vs(16),
  },
  cardDark: { backgroundColor: "#1a1a1a" },


  section: {
    backgroundColor: "#f5f5f5",
    borderRadius: ms(16),
    padding: s(16),
    gap: vs(12),
  },
  sectionDark: { backgroundColor: "#1a1a1a" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: ms(15), fontWeight: "700", color: "#000" },


  catSection: { gap: vs(8) },
  catLabel: { fontSize: ms(14), fontWeight: "600", color: "#000" },
  catEmpty: { fontSize: ms(13), color: "#687076", fontStyle: "italic" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: s(8) },
  catChip: {
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
  },
  catChipLight: { borderColor: "#ccc", backgroundColor: "#fff" },
  catChipDark: { borderColor: "#444", backgroundColor: "#222" },
  catChipSelected: { borderColor: "#6B9E98", backgroundColor: "rgba(107,158,152,0.15)" },
  catChipText: { fontSize: ms(13), color: "#000" },
  catChipTextSelected: { color: "#6B9E98", fontWeight: "600" },


  errorText: { fontSize: ms(13), color: "#EF4444" },
  successRow: { flexDirection: "row", alignItems: "center", gap: s(6) },
  successText: { fontSize: ms(13), color: "#10B981", fontWeight: "600" },
  emptyText: { fontSize: ms(13), color: "#687076", fontStyle: "italic" },


  textDark: { color: "#fff" },
  textMuted: { color: "#9BA1A6" },
});

export default shared;
