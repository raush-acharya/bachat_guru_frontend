import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import IncomeForm from '../components//IncomeForm';
import ExpenseForm from '../components//ExpenseForm';
import BudgetForm from '../components//BudgetForm';
import LoanForm from '../components//LoanForm';

const Tab = createMaterialTopTabNavigator();

const AddTransactionScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>Add Transactions</Text>
      <Tab.Navigator
        initialRouteName="Loan"
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#0E3E3E',
          tabBarStyle: {
            backgroundColor: '#E6F7F3',
            borderBottomWidth: 0,
            elevation: 0,
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#00D09E',
            height: '100%',
            borderRadius: 20,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen name="Income" component={IncomeForm} />
        <Tab.Screen name="Expense" component={ExpenseForm} />
        <Tab.Screen name="Budget" component={BudgetForm} />
        <Tab.Screen name="Loan" component={LoanForm} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 40,
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0E3E3E',
  },
});

export default AddTransactionScreen;
