import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TransactionsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Transactions Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1FFF3",
  },
  title: { fontSize: 24, color: "#0E3E3E" },
});

export default TransactionsScreen;
