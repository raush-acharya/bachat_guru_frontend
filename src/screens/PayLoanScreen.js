import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { recordLoanPayment, payoffLoan } from "../api/api";
import { format } from "date-fns";

const PayLoanScreen = ({ navigation, route }) => {
  const {
    loanId,
    loanTitle,
    paymentAmount,
    remainingBalance,
    loanDetails,
    isEarlyPayoff,
  } = route.params;

  const [loading, setLoading] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [customAmount, setCustomAmount] = useState(paymentAmount.toString());
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const isValidAmount = () => {
    const amount = parseFloat(customAmount);
    return !isNaN(amount) && amount > 0 && amount <= remainingBalance * 1.1;
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Add this function to ensure valid input
  const handleAmountChange = (text) => {
    // Only allow numbers and decimal point
    const filteredText = text.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const decimalCount = (filteredText.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    setCustomAmount(filteredText);
  };

  const handlePayLoan = async () => {
    if (!isValidAmount()) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid payment amount that doesn't significantly exceed the remaining balance."
      );
      return;
    }

    setLoading(true);
    try {
      if (isEarlyPayoff) {
        await handleEarlyPayoff();
      } else {
        await handleRegularPayment();
      }
    } catch (error) {
      console.error("Payment Error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to record payment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegularPayment = async () => {
    try {
      // Ensure payment amount is a valid number greater than 0
      const amount = parseFloat(customAmount);

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      const { data } = await recordLoanPayment(loanId, {
        paymentAmount: amount,
        paymentDate: paymentDate,
      });

      setPaymentProgress(data.paymentProgress);
      setPaymentDetails(data.paymentDetails);

      Alert.alert("Success", "Payment recorded successfully!", [
        {
          text: "View Details",
          onPress: () => {}, // Stay on current screen to show details
        },
        {
          text: "Return to Loans",
          onPress: () =>
            navigation.navigate("LoanScreen", { paymentSuccess: true }),
        },
      ]);
    } catch (error) {
      throw error;
    }
  };

  const handleEarlyPayoff = async () => {
    try {
      const { data } = await payoffLoan(loanId);

      // Display payoff info
      Alert.alert(
        "Loan Paid Off!",
        `Your loan has been fully paid off. Total paid: $${formatCurrency(
          data.payoffDetails.totalPaid
        )}`,
        [
          {
            text: "Return to Loans",
            onPress: () =>
              navigation.navigate("LoanScreen", { paymentSuccess: true }),
          },
        ]
      );
    } catch (error) {
      throw error;
    }
  };

  const resetToScheduledPayment = () => {
    setCustomAmount(paymentAmount.toString());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0E3E3E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEarlyPayoff
            ? `Pay Off Loan: ${loanTitle}`
            : `Pay Loan: ${loanTitle}`}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Loan Title</Text>
        <Text style={styles.value}>{loanTitle}</Text>

        <Text style={styles.label}>Lender</Text>
        <Text style={styles.value}>{loanDetails.lenderName}</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Scheduled Payment</Text>
            <Text style={styles.value}>${formatCurrency(paymentAmount)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Interest Rate</Text>
            <Text style={styles.value}>{loanDetails.interestRate}%</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Remaining Balance</Text>
            <Text style={styles.value}>
              ${formatCurrency(remainingBalance)}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Progress</Text>
            <Text style={styles.value}>
              {formatCurrency(
                (loanDetails.amountPaid / loanDetails.totalAmount) * 100
              )}
              %
            </Text>
          </View>
        </View>

        {isEarlyPayoff ? (
          <View style={styles.earlyPayoffContainer}>
            <Text style={styles.warningText}>
              This will pay off your entire loan balance plus any final
              interest.
            </Text>
          </View>
        ) : (
          <View style={styles.paymentInputContainer}>
            <Text style={styles.label}>Payment Amount</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.amountInput}
                value={customAmount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="Enter payment amount"
              />
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetToScheduledPayment}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
            {parseFloat(customAmount) !== paymentAmount && (
              <Text style={styles.customAmountNote}>
                {parseFloat(customAmount) > paymentAmount
                  ? "Making a larger payment will reduce your loan term."
                  : "Making a smaller payment may extend your loan term."}
              </Text>
            )}
          </View>
        )}
      </View>

      {paymentDetails && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionHeader}>Payment Details</Text>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency(paymentDetails.amount)}
            </Text>
          </View>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Interest:</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency(paymentDetails.interest)}
            </Text>
          </View>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Principal:</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency(paymentDetails.principalPaid)}
            </Text>
          </View>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {format(new Date(paymentDetails.date), "MMM d, yyyy")}
            </Text>
          </View>
        </View>
      )}

      {paymentProgress && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionHeader}>Updated Loan Status</Text>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Original Amount:</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency(paymentProgress.originalAmount)}
            </Text>
          </View>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Total with Interest:</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency(paymentProgress.totalWithInterest)}
            </Text>
          </View>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency(paymentProgress.amountPaid)}
            </Text>
          </View>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Amount Remaining:</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency(paymentProgress.amountRemaining)}
            </Text>
          </View>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Remaining Balance:</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency(paymentProgress.remainingBalance)}
            </Text>
          </View>
          <View style={styles.paymentResultRow}>
            <Text style={styles.detailLabel}>Payments Remaining:</Text>
            <Text style={styles.detailValue}>
              {paymentProgress.paymentsRemaining}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.payButton,
          loading && styles.disabledButton,
          !isValidAmount() && styles.disabledButton,
        ]}
        onPress={handlePayLoan}
        disabled={loading || !isValidAmount()}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.payButtonText}>
            {isEarlyPayoff ? "Confirm Loan Payoff" : "Confirm Payment"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FFF3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginLeft: 10,
    flex: 1,
  },
  detailsContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  resultsContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0E3E3E",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
  },
  paymentInputContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 10,
  },
  earlyPayoffContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 10,
    backgroundColor: "#FFF8E1",
    padding: 10,
    borderRadius: 8,
  },
  warningText: {
    color: "#FF6D00",
    fontWeight: "500",
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  resetButton: {
    marginLeft: 10,
    backgroundColor: "#EEEEEE",
    padding: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#0E3E3E",
    fontWeight: "500",
  },
  customAmountNote: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 5,
  },
  paymentResultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 15,
    color: "#0E3E3E",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 15,
    color: "#666",
  },
  payButton: {
    backgroundColor: "#00D09E",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F1FFF3",
  },
});

export default PayLoanScreen;
