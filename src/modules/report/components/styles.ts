import {
  StyleSheet,
} from "@react-pdf/renderer";

export const styles =
  StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 11,
      fontFamily: "Helvetica",
      lineHeight: 1.5,
    },

    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 6,
      color: "#1e293b",
    },

    subtitle: {
      fontSize: 12,
      color: "#64748b",
      marginBottom: 24,
    },

    heading: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
      color: "#0f172a",
    },

    card: {
      border: "1 solid #e2e8f0",
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },

    label: {
      fontWeight: "bold",
    },

    text: {
      marginBottom: 4,
    },

    section: {
  marginTop: 18,
},

    footer: {
      marginTop: 40,
      textAlign: "center",
      color: "#64748b",
      fontSize: 10,
    },
  });