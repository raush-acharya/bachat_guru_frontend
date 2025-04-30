import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { format, isSameMonth } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { getTransactions, getIncome, getExpenses, getCategories } from "../api/api";

const TransactionsScreen = ({ navigation }) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState(null); // null = show both, "income" = show income, "expense" = show expense
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);
  const [datePickerTitle, setDatePickerTitle] = useState("Select Start Date");

  // Computed filtered transactions instead of state
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    
    // Apply type filter (income/expense)
    if (activeTab) {
      result = result.filter(item => item.type === activeTab);
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(item => item.categoryId._id === selectedCategory);
    }
    
    return result;
  }, [transactions, activeTab, selectedCategory]);

  // Fetch totals (balance, income, expense)
  const fetchTotals = async () => {
    try {
      setError(null);
      const { data } = await getTransactions();
      setTotalBalance(data.netMoney);
      setTotalIncome(data.totalIncome);
      setTotalExpense(data.totalExpenses);
    } catch (error) {
      console.error("Fetch Totals Error:", error);
      setError("Failed to load balance information");
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      setError(null);
      const { data } = await getCategories();
      setCategories(data.categories);
    } catch (error) {
      console.error("Fetch Categories Error:", error);
      setError("Failed to load categories");
    }
  };

  // Fetch transactions
  const fetchTransactions = async (startDateParam = startDate, endDateParam = endDate) => {
    setLoading(true);
    setError(null);
    let params = {};
    
    // Handle date filters
    if (startDateParam) {
      params.startDate = startDateParam.toISOString();
    }
    
    if (endDateParam) {
      // Set time to end of day for end date
      const endOfDay = new Date(endDateParam);
      endOfDay.setHours(23, 59, 59, 999);
      params.endDate = endOfDay.toISOString();
    }
    
    try {
      const [incomeResponse, expenseResponse] = await Promise.all([
        getIncome(params),
        getExpenses(params),
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
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Group transactions by month for SectionList
  const groupTransactionsByMonth = (transactions) => {
    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = format(date, "MMMM yyyy");
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(transaction);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((monthYear) => ({
        title: monthYear,
        data: grouped[monthYear],
      }));
  };

  // Handle tab press
  const handleTabPress = (tab) => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setActiveTab(tab);
    }
  };

  // Improved date picker flow with better user feedback
  const openDatePicker = () => {
    setIsSelectingStartDate(true);
    setDatePickerTitle("Select Start Date");
    setShowDatePicker(true);
  };

  // Handle date picker confirmation
  const handleDateConfirm = (date) => {
    if (isSelectingStartDate) {
      setStartDate(date);
      setIsSelectingStartDate(false);
      setDatePickerTitle("Select End Date");
      // Stay open for end date selection
    } else {
      const newEndDate = date;
      setEndDate(newEndDate);
      setShowDatePicker(false);
      // Call fetchTransactions with the confirmed dates to avoid async state issues
      fetchTransactions(startDate, newEndDate);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedCategory(null);
    setActiveTab(null);
    fetchTransactions(null, null);
  };

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await Promise.all([fetchTotals(), fetchCategories(), fetchTransactions()]);
    } catch (error) {
      setError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionIconText}>
          {item.type === "income" ? "💸" : "🛒"}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>
          {item.categoryId?.name || "Category"}
        </Text>
        <Text style={styles.transactionSubtitle}>{item.notes || "No description"}</Text>
        <Text style={styles.transactionDate}>
          {format(new Date(item.date), "HH:mm")} -{" "}
          {format(new Date(item.date), "MMM d")}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === "income" ? styles.income : styles.expense,
        ]}
      >
        {item.type === "income" ? "+" : "-"}${(item.amount || 0).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0E3E3E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#0E3E3E" />
        </TouchableOpacity>
      </View>

      {/* Error message display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Balance Summary */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <TouchableOpacity
            style={[
              styles.summaryItem,
              activeTab === "income" && styles.activeSummaryItem,
            ]}
            onPress={() => handleTabPress("income")}
          >
            <Ionicons name="trending-up" size={24} color="#F1FFF3" />
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryAmount}>
              ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.summaryItem,
              activeTab === "expense" && styles.activeSummaryItem,
            ]}
            onPress={() => handleTabPress("expense")}
          >
            <Ionicons name="trending-down" size={24} color="#F1FFF3" />
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={styles.summaryAmount}>
              ${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        {/* <View style={styles.dateFilter}>
          <Text style={styles.sectionHeader}>
            {startDate && endDate
              ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
              : "All Transactions"}
          </Text>
          <TouchableOpacity onPress={openDatePicker}>
            <Ionicons name="calendar-outline" size={24} color="#0E3E3E" />
          </TouchableOpacity>
        </View> */}
        <View style={styles.categoryFilter}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => {
              setSelectedCategory(itemValue);
            }}
            style={styles.picker}
          >
            <Picker.Item label="All Categories" value={null} />
            {categories.map((category) => (
              <Picker.Item
                key={category._id}
                label={category.name}
                value={category._id}
              />
            ))}
          </Picker>
          {(startDate || endDate || selectedCategory) && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Picker with title for better UX */}
      {/* <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        headerTextIOS={datePickerTitle}
        confirmTextIOS={isSelectingStartDate ? "Next" : "Confirm"}
        onConfirm={handleDateConfirm}
        onCancel={() => {
          setShowDatePicker(false);
          setIsSelectingStartDate(true);
          setDatePickerTitle("Select Start Date");
        }}
        maximumDate={new Date()}
        minimumDate={isSelectingStartDate ? undefined : startDate}
        display="spinner"
      /> */}

      {/* Transactions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09E" />
        </View>
      ) : filteredTransactions.length === 0 ? (
        <Text style={styles.noTransactions}>
          No transactions found for this period.
        </Text>
      ) : (
        <SectionList
          sections={groupTransactionsByMonth(filteredTransactions)}
          renderItem={renderTransaction}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#00D09E"]}
              tintColor="#00D09E"
            />
          }
        />
      )}
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
  errorContainer: {
    backgroundColor: "#FFECEC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6347",
  },
  errorText: {
    color: "#FF6347",
    fontSize: 14,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: "#00D09E",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#F1FFF3",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F1FFF3",
    marginVertical: 5,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  summaryItem: {
    backgroundColor: "#052224",
    padding: 15,
    borderRadius: 15,
    width: "48%",
    alignItems: "center",
  },
  activeSummaryItem: {
    backgroundColor: "#0068FF",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#F1FFF3",
    marginVertical: 5,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F1FFF3",
  },
  filterSection: {
    marginBottom: 10,
  },
  dateFilter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryFilter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    height: 60,
    color: "#0E3E3E",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  clearButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#FF6347",
    borderRadius: 10,
  },
  clearButtonText: {
    color: "#F1FFF3",
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginTop: 10,
    marginBottom: 5,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
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
  transactionIconText: {
    fontSize: 24,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0E3E3E",
  },
  transactionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  income: {
    color: "#00D09E",
  },
  expense: {
    color: "#FF6347",
  },
  noTransactions: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TransactionsScreen;