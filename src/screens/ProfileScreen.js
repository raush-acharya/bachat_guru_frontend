import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { getUser } from "../api/api";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ name: "", email: "" });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getUser();
        setUserData({ name: data.name, email: data.email });
      } catch (error) {
        console.error("Fetch User Error:", error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };
    fetchUser();
  }, []);

  // Generate random background color for the avatar
  const getRandomColor = () => {
    const colors = [
      "#FF6F61",
      "#6B5B95",
      "#88B04B",
      "#F7CAC9",
      "#92A8D1",
      "#FFCC5C",
      "#FF9F80",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get user's initials from their name
  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    const initials = nameParts
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
    return initials.slice(0, 2); // Limit to 2 characters
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to Log Out of BachatGuru?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("token");
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Logout Error:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ]
    );
  };
  return (
    <View style={styles.container}>
      {/* Header with back and help icons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0E3E3E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#0E3E3E" />
        </TouchableOpacity>
      </View>

      {/* User Info Section */}
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: getRandomColor() }]}>
          <Text style={styles.initials}>{getInitials(userData.name)}</Text>
        </View>
        <Text style={styles.fullName}>{userData.name || "User"}</Text>
        <Text style={styles.email}>{userData.email || "email@example.com"}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#0E3E3E" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("SecurityScreen")}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#0E3E3E" />
          <Text style={styles.menuText}>Security</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#0E3E3E" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#0E3E3E" />
          <Text style={styles.menuText}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#0E3E3E" />
          <Text style={styles.menuText}>Logout</Text>
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
  userInfo: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  initials: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  fullName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  menu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: "#0E3E3E",
    marginLeft: 15,
  },
});

export default ProfileScreen;