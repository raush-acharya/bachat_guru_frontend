// src/screens/ForgotPasswordScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { forgotPassword } from "../api/api";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    try {
      const { data } = await forgotPassword(email);
      alert(data.message);
      navigation.navigate("CheckEmail", { email });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
      console.error(
        "Forgot Password Error:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Reset Password?{"\n"}
        Enter your email address where you will receive a password reset link.
      </Text>
      <TextInput
        mode="outlined"
        placeholder="Enter Email Address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        outlineColor="#00D09E"
        activeOutlineColor="#00D09E"
        backgroundColor="#DFF7E2"
        textColor="#0E3E3E"
        placeholderTextColor="#0E3E3E"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={handleForgotPassword}
        style={styles.button}
        buttonColor="#00D09E"
        textColor="#F1FFF3"
      >
        Next Step
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
  input: {
    marginBottom: 16,
    borderRadius: 25,
    height: 50,
    fontSize: 16,
    backgroundColor: "#DFF7E2",
  },
  error: { color: "red", marginBottom: 16, textAlign: "center" },
  button: {
    marginBottom: 16,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
  },
});

export default ForgotPasswordScreen;
