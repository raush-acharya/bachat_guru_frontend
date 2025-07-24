import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { format } from "date-fns";
import {
  getTransactions,
  getBudget,
  getIncome,
  getExpenses,
  getUser,
} from "../api/api";
import * as Progress from "react-native-progress";

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("Raush");
  const [greeting, setGreeting] = useState("Good morning");
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [budgetProgress, setBudgetProgress] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("Monthly");
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

  const fetchUserData = async () => {
    try {
      const { data } = await getUser();
      const firstName = data.name.split(" ")[0];
      setUserName(firstName);
    } catch (error) {
      console.error("Fetch User Error:", error);
    }
  };

  const setTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  };

  const fetchTotals = async () => {
    try {
      const { data } = await getTransactions();
      setTotalBalance(data.netMoney);
      setTotalExpense(data.totalExpenses);
    } catch (error) {
      console.error("Fetch Totals Error:", error);
    }
  };

  const fetchBudgetData = async () => {
    try {
      const { data } = await getBudget();
      const budget = data.budgets[0];
      if (budget) {
        const spentPercentage = (budget.spent / budget.amount) * 100;
        setBudgetProgress(spentPercentage / 100);
      }
    } catch (error) {
      console.error("Fetch Budget Error:", error);
    }
  };

  const fetchTransactions = async (filterType) => {
    const endDate = new Date(); // Today
    let startDate = new Date();

    if (filterType === "Daily") {
      startDate.setDate(endDate.getDate() - 1); // Yesterday
    } else if (filterType === "Weekly") {
      startDate.setDate(endDate.getDate() - 7); // One week ago
    } else if (filterType === "Monthly") {
      startDate.setMonth(endDate.getMonth() - 1); // One month ago
    }

    // Set endDate to the end of the day
    endDate.setHours(23, 59, 59, 999);

    console.log("Fetching transactions with:", {
      filterType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    try {
      const [incomeResponse, expenseResponse] = await Promise.all([
        getIncome({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        getExpenses({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      ]);

      const incomes = incomeResponse.data.incomes.map((item) => ({
        ...item,
        type: "income",
      }));
      const expenses = expenseResponse.data.expenses.map((item) => ({
        ...item,
        type: "expense",
      }));

      const allTransactions = [...incomes, ...expenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
    }
  };

  // Function to handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserData(),
      setTimeBasedGreeting(),
      fetchTotals(),
      fetchBudgetData(),
      fetchTransactions(filter),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh(); // Initial load
  }, []);

  useEffect(() => {
    fetchTransactions(filter);
  }, [filter]);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionIconText}>
          {item.type === "income" ? "💸" : "🛒"}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.categoryId.name}</Text>
        <Text style={styles.transactionSubtitle}>{item.notes || "No description"}</Text>
        <Text style={styles.transactionDate}>
          {/* {format(new Date(item.date), "HH:mm")} -{" "} */}
          {format(new Date(item.date), "MMM d")}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === "income" ? styles.income : styles.expense,
        ]}
      >
        Rs.{item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {userName}</Text>
        <Text style={styles.subGreeting}>{greeting}</Text>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            Rs 
            {totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.balanceProgress}>
            {Math.round(budgetProgress * 100)}% of your expenses, looks good.
          </Text>
          <Progress.Bar
            progress={budgetProgress}
            width={200}
            color="#052224"
            unfilledColor="#E0E0E0"
            borderWidth={0}
            style={styles.progressBar}
          />
        </View>
        <View style={styles.expenseCard}>
          <Text style={styles.expenseLabel}>Total Expense</Text>
          <Text style={styles.expenseAmount}>
            Rs 
            {totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate("BudgetScreen")}
        >
          <Text style={styles.viewButtonText}>View Budgets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate("LoanScreen")}
        >
          <Text style={styles.viewButtonText}>View Loans</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "Daily" && styles.activeFilter,
          ]}
          onPress={() => setFilter("Daily")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "Daily" && styles.activeFilterText,
            ]}
          >
            Daily
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "Weekly" && styles.activeFilter,
          ]}
          onPress={() => setFilter("Weekly")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "Weekly" && styles.activeFilterText,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "Monthly" && styles.activeFilter,
          ]}
          onPress={() => setFilter("Monthly")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "Monthly" && styles.activeFilterText,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <Text style={styles.noTransactions}>
          No transactions found for this period.
        </Text>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item._id}
          style={styles.transactionList}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#00D09E"]} // Spinner color
              tintColor="#00D09E" // iOS spinner color
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1FFF3", padding: 20 },
  header: { marginBottom: 20, marginTop: 30 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#0E3E3E" },
  subGreeting: { fontSize: 16, color: "#0E3E3E" },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: "#00D09E",
    padding: 20,
    borderRadius: 15,
    width: "60%",
  },
  balanceLabel: { fontSize: 16, color: "#F1FFF3" },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F1FFF3",
    marginVertical: 5,
  },
  balanceProgress: { fontSize: 14, color: "#F1FFF3", marginBottom: 10 },
  progressBar: { alignSelf: "center" },
  expenseCard: {
    backgroundColor: "#FF6347",
    padding: 20,
    borderRadius: 15,
    width: "35%",
    justifyContent: "center",
  },
  expenseLabel: { fontSize: 16, color: "#F1FFF3" },
  expenseAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F1FFF3",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  viewButton: {
    backgroundColor: "#00D09E",
    padding: 15,
    borderRadius: 15,
    width: "48%",
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F1FFF3",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterButton: { padding: 10, borderRadius: 20 },
  activeFilter: { backgroundColor: "#00D09E" },
  filterText: { fontSize: 16, color: "#0E3E3E" },
  activeFilterText: { color: "#F1FFF3" },
  transactionList: { flex: 1 },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
    transactionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  transactionIcon: {
    backgroundColor: "#E0E0E0",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  transactionIconText: { fontSize: 24 },
  transactionDetails: { flex: 1 },
  transactionTitle: { fontSize: 16, fontWeight: "bold", color: "#0E3E3E" },
  transactionDate: { fontSize: 14, color: "#666" },
  transactionAmount: { fontSize: 16, fontWeight: "bold" },
  income: { color: "#00D09E" },
  expense: { color: "#FF6347" },
  noTransactions: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default HomeScreen;