// src/screens/CheckEmailScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const CheckEmailScreen = ({ route, navigation }) => {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>
        We’ve sent a password reset link to {email}.{"\n"}
        Please click the link in your email to proceed.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("Login")}
        style={styles.button}
        buttonColor="#00D09E"
        textColor="#F1FFF3"
      >
        Back to Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F1FFF3",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#0E3E3E",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    marginBottom: 16,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
  },
});

export default CheckEmailScreen;
