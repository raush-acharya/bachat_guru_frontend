import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { changePassword } from "../api/api";

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Password strength validation
  const validatePasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (criteriaMet === 5) return "Strong";
    if (criteriaMet >= 3) return "Moderate";
    return "Weak";
  };

  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
    setPasswordStrength(validatePasswordStrength(text));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "Strong":
        return "#00D09E";
      case "Moderate":
        return "#FFCC5C";
      case "Weak":
      default:
        return "#FF6F61";
    }
  };

  const handleChangePassword = async () => {
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    // Password strength check
    if (passwordStrength === "Weak") {
      Alert.alert(
        "Error",
        "New password is too weak. It must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters."
      );
      return;
    }

    // Confirm password match
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }

    // Confirmation dialog
    Alert.alert(
      "Change Password",
      "Are you sure you want to change your password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change",
          onPress: async () => {
            setLoading(true);
            try {
              await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
              });
              Alert.alert(
                "Success",
                "Password changed successfully. Please log in again.",
                [
                  {
                    text: "OK",
                    onPress: async () => {
                      await SecureStore.deleteItemAsync("token");
                      navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to change password."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0E3E3E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#0E3E3E" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            placeholder="Enter current password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <Ionicons
              name={showCurrentPassword ? "eye-off" : "eye"}
              size={24}
              color="#0E3E3E"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={handleNewPasswordChange}
            secureTextEntry={!showNewPassword}
            placeholder="Enter new password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={24}
              color="#0E3E3E"
            />
          </TouchableOpacity>
        </View>
        {newPassword ? (
          <Text
            style={[styles.strengthText, { color: getPasswordStrengthColor() }]}
          >
            Password Strength: {passwordStrength}
          </Text>
        ) : null}

        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder="Confirm new password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="#0E3E3E"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Changing..." : "Change Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FFF3",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0E3E3E",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: "#0E3E3E",
  },
  eyeIcon: {
    padding: 10,
  },
  strengthText: {
    fontSize: 14,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#00D09E",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F1FFF3",
  },
});

export default ChangePasswordScreen;
