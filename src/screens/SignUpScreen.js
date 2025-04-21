import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { signup } from "../api/api";

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      alert("Sign Up Successful! Please log in.");
      navigation.navigate("Login");
    } catch (err) {
      setError(err.response?.data?.message || "Sign Up failed");
      console.error("Sign Up Error:", err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        mode="outlined"
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        style={styles.input}
        outlineColor="#00D09E"
        activeOutlineColor="#00D09E"
        backgroundColor="#DFF7E2"
        textColor="#0E3E3E"
        placeholderTextColor="#0E3E3E"
      />
      <TextInput
        mode="outlined"
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
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
        placeholder="Confirm Password"
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
      <Text style={styles.terms}>
        By continuing, you agree to{"\n"}
        <Text style={styles.link}>Terms of Use and Privacy Policy.</Text>
      </Text>
      <Button
        mode="contained"
        onPress={handleSignUp}
        style={styles.button}
        buttonColor="#00D09E"
        textColor="#F1FFF3"
      >
        Sign Up
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log In</Text>
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
  terms: { color: "#0E3E3E", textAlign: "center", marginBottom: 16 },
  button: {
    marginBottom: 16,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
  },
  link: { color: "#0068FF", textAlign: "center" },
});

export default SignUpScreen;
