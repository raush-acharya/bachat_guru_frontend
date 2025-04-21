import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { format } from "date-fns";
import { getLoan } from "../api/api";
import { Ionicons } from "@expo/vector-icons";

const LoanScreen = ({ navigation, route }) => {
  const [loans, setLoans] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // If returning from payment screen with success
  useEffect(() => {
    if (route.params?.paymentSuccess) {
      fetchLoans(1);
      setPage(1);
    }
  }, [route.params?.paymentSuccess]);

  const fetchLoans = async (pageNum) => {
    setLoading(true);
    try {
      const { data } = await getLoan({ page: pageNum });
      if (pageNum === 1) {
        setLoans(data.loans || []);
      } else {
        setLoans((prev) => [...prev, ...(data.loans || [])]);
      }
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Fetch Loans Error:", error);
      Alert.alert("Error", "Failed to load loans. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoans(page);
  }, [page]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchLoans(1);
  };

  const handlePaymentOptions = (loan) => {
    Alert.alert(
      "Payment Options",
      "Choose a payment option",
      [
        {
          text: "Make Regular Payment",
          onPress: () => navigateToPayment(loan),
        },
        {
          text: "Pay Off Loan Early",
          onPress: () => navigateToEarlyPayoff(loan),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const navigateToPayment = (loan) => {
    navigation.navigate("PayLoanScreen", {
      loanId: loan._id,
      loanTitle: loan.title,
      paymentAmount: loan.paymentAmount,
      remainingBalance: loan.remainingBalance,
      loanDetails: {
        interestRate: loan.interestRate,
        startDate: loan.startDate,
        endDate: loan.endDate,
        lenderName: loan.lenderName,
        paymentFrequency: loan.paymentFrequency,
        totalAmount: loan.amount,
        amountPaid: loan.amountPaid,
      },
      isEarlyPayoff: false,
    });
  };

  const navigateToEarlyPayoff = (loan) => {
    navigation.navigate("PayLoanScreen", {
      loanId: loan._id,
      loanTitle: loan.title,
      paymentAmount: loan.remainingBalance, // Suggest the remaining balance as payment
      remainingBalance: loan.remainingBalance,
      loanDetails: {
        interestRate: loan.interestRate,
        startDate: loan.startDate,
        endDate: loan.endDate,
        lenderName: loan.lenderName,
        paymentFrequency: loan.paymentFrequency,
        totalAmount: loan.amount,
        amountPaid: loan.amountPaid,
      },
      isEarlyPayoff: true,
    });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Format payment frequency to be more readable
  const formatFrequency = (frequency) => {
    switch(frequency) {
      case "monthly": return "Monthly";
      case "quarterly": return "Quarterly";
      case "half-yearly": return "Semi-annually";
      default: return frequency;
    }
  };

  const calculateProgress = (amountPaid, totalAmount) => {
    const progress = (amountPaid / totalAmount) * 100;
    return Math.min(100, Math.max(0, progress)).toFixed(0) + "%";
  };

  const renderLoan = ({ item }) => (
    <View style={styles.loanItem}>
      <View style={styles.loanHeader}>
        <Text style={styles.loanTitle}>{item.title}</Text>
        <Text style={[styles.status, item.status === "active" ? styles.activeStatus : styles.paidStatus]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      <View style={styles.loanDetails}>
        <Text style={styles.lenderName}>Lender: {item.lenderName}</Text>
        <View style={styles.row}>
          <Text style={styles.loanAmount}>
            Amount: ${formatCurrency(item.amount)}
          </Text>
          <Text style={styles.interestRate}>Rate: {item.interestRate}%</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.paymentDetail}>
            Payment: ${formatCurrency(item.paymentAmount)}
          </Text>
          <Text style={styles.paymentDetail}>
            {formatFrequency(item.paymentFrequency)}
          </Text>
        </View>
        
        {item.status === "active" && (
          <View style={styles.balanceView}>
            <Text style={styles.remainingBalance}>
              Remaining: ${formatCurrency(item.remainingBalance)}
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: calculateProgress(item.amountPaid, item.amount) }
                ]} 
              />
            </View>
          </View>
        )}
        
        <Text style={styles.loanDate}>
          {format(new Date(item.startDate), "MMM d, yyyy")} -{" "}
          {format(new Date(item.endDate), "MMM d, yyyy")}
        </Text>
        
        {item.nextDueDate && item.status === "active" && (
          <Text style={styles.nextPayment}>
            Next payment due: {format(new Date(item.nextDueDate), "MMM d, yyyy")}
          </Text>
        )}
        
        {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}
      </View>
      {item.status === "active" && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePaymentOptions(item)}
        >
          <Text style={styles.payButtonText}>Payment Options</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
        <Text style={styles.headerTitle}>Your Loans</Text>
        {/* <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate("AddLoanScreen")}>
          <Ionicons name="add-circle-outline" size={24} color="#00D09E" />
        </TouchableOpacity> */}
      </View>

      {loans.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noLoans}>No loans found.</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={loans}
          renderItem={renderLoan}
          keyExtractor={(item) => item._id}
          style={styles.loanList}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
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
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0E3E3E",
    flex: 1,
    marginLeft: 10,
  },
  addButton: {
    padding: 5,
  },
  loanList: { flex: 1 },
  loanItem: {
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
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  loanTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0E3E3E",
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    padding: 5,
    borderRadius: 10,
  },
  activeStatus: {
    backgroundColor: "#00D09E",
    color: "#F1FFF3",
  },
  paidStatus: {
    backgroundColor: "#666",
    color: "#F1FFF3",
  },
  loanDetails: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  lenderName: {
    fontSize: 16,
    color: "#0E3E3E",
    marginBottom: 5,
  },
  loanAmount: {
    fontSize: 16,
    color: "#0E3E3E",
  },
  interestRate: {
    fontSize: 16,
    color: "#0E3E3E",
  },
  paymentDetail: {
    fontSize: 16,
    color: "#0E3E3E",
  },
  balanceView: {
    marginVertical: 8,
  },
  remainingBalance: {
    fontSize: 16,
    color: "#0E3E3E",
    fontWeight: "500",
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#00D09E",
  },
  loanDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  nextPayment: {
    fontSize: 14,
    color: "#0E3E3E",
    fontWeight: "500",
    marginBottom: 5,
  },
  notes: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  payButton: {
    backgroundColor: "#00D09E",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F1FFF3",
  },
  noLoans: {
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

export default LoanScreen;