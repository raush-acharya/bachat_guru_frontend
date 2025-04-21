import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const PasswordChangedScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.checkmark}>
        <Text style={styles.checkmarkText}>✔</Text>
      </View>
      <Text style={styles.title}>Password Has Been Changed Successfully</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("Login")}
        style={styles.button}
        buttonColor="#00D09E"
        textColor="#F1FFF3"
      >
        Log In
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FFF3",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#0E3E3E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  checkmarkText: { fontSize: 50, color: "#0E3E3E" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    width: "80%",
  },
});

export default PasswordChangedScreen;
