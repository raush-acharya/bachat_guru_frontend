// src/screens/ExpenseScreen.js
import React from "react";
import { View } from "react-native";
import ExpenseForm from "../components/ExpenseForm";

const ExpenseScreen = () => (
  <View style={{ flex: 1 }}>
    <ExpenseForm />
  </View>
);

export default ExpenseScreen;
