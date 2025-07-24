import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert
} from "react-native";
import { format } from "date-fns";
import { getBudget } from "../api/api";
import * as Progress from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";

const BudgetScreen = ({ navigation }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await getBudget();
      setBudgets(data.budgets || []);
    } catch (error) {
      console.error("Fetch Budgets Error:", error);
      Alert.alert("Error", "Failed to load budgets. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBudgets();
  };

  const renderBudget = ({ item }) => {
    const progress = item.spent / item.amount;
    const isOverBudget = item.isOverBudget;

    return (
      <View style={styles.budgetItem}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>{item.budgetName}</Text>
          <Text style={styles.categoryName}>{item.categoryId.name}</Text>
        </View>
        <View style={styles.budgetDetails}>
          <Text style={styles.budgetDate}>
            {format(new Date(item.startDate), "MMM d, yyyy")} -{" "}
            {format(new Date(item.endDate), "MMM d, yyyy")}
          </Text>
          <Text style={styles.budgetAmount}>
            Budget: Rs.{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.spentAmount}>
            Spent: Rs.{item.spent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.remainingAmount, isOverBudget && styles.overBudget]}>
            Remaining: Rs.{item.remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}
        </View>
        <Progress.Bar
          progress={progress}
          width={null}
          color={isOverBudget ? "#FF6347" : "#00D09E"}
          unfilledColor="#E0E0E0"
          borderWidth={0}
          style={styles.progressBar}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#00D09E" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0E3E3E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Budgets</Text>
      </View>

      {budgets.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noBudgets}>No budgets found.</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={budgets}
          renderItem={renderBudget}
          keyExtractor={(item) => item._id}
          style={styles.budgetList}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1FFF3", padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginLeft: 10,
  },
  budgetList: { flex: 1 },
  budgetItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0E3E3E",
  },
  categoryName: {
    fontSize: 16,
    color: "#666",
  },
  budgetDetails: { marginBottom: 10 },
  budgetDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  budgetAmount: {
    fontSize: 16,
    color: "#0E3E3E",
    marginBottom: 5,
  },
  spentAmount: {
    fontSize: 16,
    color: "#FF6347",
    marginBottom: 5,
  },
  remainingAmount: {
    fontSize: 16,
    color: "#00D09E",
  },
  overBudget: {
    color: "#FF6347",
  },
  notes: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  progressBar: {
    height: 6,
  },
  noBudgets: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    backgroundColor: "#00D09E",
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  refreshButtonText: {
    color: "#F1FFF3",
    fontWeight: "bold",
  },
});

export default BudgetScreen;