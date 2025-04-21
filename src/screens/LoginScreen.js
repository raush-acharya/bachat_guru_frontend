import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { login } from "../api/api";
import * as SecureStore from "expo-secure-store";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      console.log("Login Request:", { email, password });
      const { data } = await login(email, password);
      await SecureStore.setItemAsync("token", data.token);
      console.log("JWT Stored:", data.token);
      navigation.replace("Main");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      console.error("Login Error:", err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TextInput
        mode="outlined"
        placeholder="Username or Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        outlineColor="#00D09E"
        activeOutlineColor="#00D09E"
        backgroundColor="#DFF7E2"
        textColor="#0E3E3E"
        placeholderTextColor="#0E3E3E"
      />
      <TextInput
        mode="outlined"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
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
        onPress={handleLogin}
        style={styles.button}
        buttonColor="#00D09E"
        textColor="#F1FFF3"
      >
        Log In
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.link}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>
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
  link: { color: "#0068FF", textAlign: "center", marginTop: 8 },
});

export default LoginScreen;
