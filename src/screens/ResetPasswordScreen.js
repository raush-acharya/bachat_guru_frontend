// src/screens/ResetPasswordScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { resetPassword } from "../api/api";

const ResetPasswordScreen = ({ route, navigation }) => {
  console.log("Route Params:", route.params); // Log all params
  const { token, email } = route.params || {};
  console.log("Extracted Token:", token);
  console.log("Extracted Email:", email);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Reset token is missing");
      return;
    }
    try {
      console.log("Calling resetPassword with:", {
        token,
        password: formData.password,
      });
      await resetPassword(token, formData.password);
      navigation.navigate("PasswordChanged");
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
      console.error("Reset Password Error:", err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Password</Text>
      <TextInput
        mode="outlined"
        placeholder="New Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        style={styles.input}
        outlineColor="#00D09E"
        activeOutlineColor="#00D09E"
        backgroundColor="#DFF7E2"
        textColor="#0E3E3E"
        placeholderTextColor="#0E3E3E"
      />
      <TextInput
        mode="outlined"
        placeholder="Confirm New Password"
        value={formData.confirmPassword}
        onChangeText={(text) =>
          setFormData({ ...formData, confirmPassword: text })
        }
        secureTextEntry
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
        onPress={handleResetPassword}
        style={styles.button}
        buttonColor="#00D09E"
        textColor="#F1FFF3"
      >
        Change Password
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
    marginBottom: 40,
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

export default ResetPasswordScreen;
