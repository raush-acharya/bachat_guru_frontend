import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import PasswordChangedScreen from "../screens/PasswordChangedScreen";
import CheckEmailScreen from "../screens/CheckEmailScreen";
import HomeScreen from "../screens/HomeScreen";
import ExpenseScreen from "../screens/ExpenseScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AnalysisScreen from "../screens/AnalysisScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: ["bachatguru://"],
  config: {
    screens: {
      ResetPassword: "reset-password/:token",
    },
  },
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === "Home") iconName = focused ? "home" : "home-outline";
        else if (route.name === "Analysis") iconName = focused ? "bar-chart" : "bar-chart-outline";
        else if (route.name === "AddTransaction") iconName = focused ? "add-circle" : "add-circle-outline";
        else if (route.name === "Transactions") iconName = focused ? "swap-horizontal" : "swap-horizontal-outline";
        else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";

        const icon = <Ionicons name={iconName} size={24} color={focused ? "#fff" : "#0E3E3E"} />;

        return focused ? (
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#00D09E",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {icon}
          </View>
        ) : (
          icon
        );
      },
      tabBarActiveTintColor: "#fff",
      tabBarInactiveTintColor: "#666",
      tabBarStyle: {
        backgroundColor: "#E6F7F3",
        borderTopWidth: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 15,
        paddingTop: 15,
        height: 70,
      },
      tabBarItemStyle: {
        alignItems: "center",
        justifyContent: "center",
      },
      tabBarLabelStyle: {
        display: "none",
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Analysis" component={AnalysisScreen} options={{ headerShown: false }} />
    <Tab.Screen name="AddTransaction" component={AddTransactionScreen} options={{ headerShown: false, title: "" }} />
    <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer linking={linking}>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PasswordChanged" component={PasswordChangedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CheckEmail" component={CheckEmailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Expenses" component={ExpenseScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;