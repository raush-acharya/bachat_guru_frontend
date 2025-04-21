import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { format } from "date-fns";

const AddTransactionScreen = () => {
  const [activeTab, setActiveTab] = useState("Expense");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loanType, setLoanType] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");
  const [interestRate, setInterestRate] = useState("");
  const [duration, setDuration] = useState("");
  const [budgetName, setBudgetName] = useState("");
  const [totalBalance, setTotalBalance] = useState("7783.00");
  const [totalExpense, setTotalExpense] = useState("-18187.40");
  const [expensePercentage, setExpensePercentage] = useState(30);

  const tabs = ["Income", "Expense", "Budget", "Loan"];

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleSubmit = async () => {
    const token = "your-auth-token"; // Replace with actual token retrieval logic
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (activeTab === "Income" || activeTab === "Expense") {
        const endpoint = activeTab === "Income" ? "/api/income" : "/api/expense";
        const data = {
          categoryId: category, // Replace with actual category ID mapping
          amount: parseFloat(amount),
          paymentMethod: "default", // Adjust as needed
          date: date.toISOString(),
          notes,
          isRecurring,
          frequency: isRecurring ? frequency : null,
          endDate: isRecurring ? endDate.toISOString() : null,
        };
        const response = await axios.post(`http://your-api-url${endpoint}`, data, config);
        alert(response.data.message);
      } else if (activeTab === "Budget") {
        const data = {
          categoryId: category, // Replace with actual category ID mapping
          budgetName,
          amount: parseFloat(amount),
          startDate: date.toISOString(),
          endDate: endDate.toISOString(),
          notes,
        };
        const response = await axios.post("http://your-api-url/api/budget", data, config);
        alert(response.data.message);
      } else if (activeTab === "Loan") {
        const data = {
          title,
          lenderName: "Default Lender", // Adjust as needed
          amount: parseFloat(amount),
          startDate: date.toISOString(),
          endDate: endDate.toISOString(),
          interestRate: parseFloat(interestRate),
          paymentFrequency,
          compoundingFrequency: paymentFrequency, // Adjust as needed
          numberOfPayments: parseInt(duration),
          status: "active",
          notes,
        };
        const response = await axios.post("http://your-api-url/api/loan", data, config);
        alert(response.data.message);
      }
    } catch (error) {
      console.error(`${activeTab} Submission Error:`, error);
      alert(error.response?.data?.message || "Failed to add transaction");
    }
  };

  const renderTabContent = () => {
    if (activeTab === "Income" || activeTab === "Expense") {
      return (
        <View>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={styles.input}
              value={format(date, "MMMM dd yyyy")}
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Select the category" value="" />
            <Picker.Item label="Salary" value="salary" />
            <Picker.Item label="Freelance" value="freelance" />
            <Picker.Item label="Dinner" value="dinner" />
            <Picker.Item label="Travel" value="travel" />
          </Picker>

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="$0.00"
          />

          <Text style={styles.label}>
            {activeTab === "Income" ? "Income Title" : "Expense Title"}
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={activeTab === "Income" ? "Salary" : "Dinner"}
          />

          <Text style={styles.label}>Enter Message</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Recurring</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: "#767577", true: "#00D09E" }}
            />
          </View>

          {isRecurring && (
            <>
              <Text style={styles.label}>Frequency</Text>
              <Picker
                selectedValue={frequency}
                onValueChange={(itemValue) => setFrequency(itemValue)}
                style={styles.input}
              >
                <Picker.Item label="Daily" value="daily" />
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Monthly" value="monthly" />
                <Picker.Item label="Yearly" value="yearly" />
              </Picker>

              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                <TextInput
                  style={styles.input}
                  value={format(endDate, "MMMM dd yyyy")}
                  editable={false}
                />
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                />
              )}
            </>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (activeTab === "Budget") {
      return (
        <View>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.label}>Total Balance</Text>
              <Text style={styles.budgetValue}>${totalBalance}</Text>
            </View>
            <View>
              <Text style={styles.label}>Total Expense</Text>
              <Text style={[styles.budgetValue, { color: "red" }]}>${totalExpense}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${expensePercentage}%` }]} />
            <Text style={styles.progressText}>
              {expensePercentage}% of Your Expenses, Looks Good.
            </Text>
          </View>

          <Text style={styles.label}>Budget Items</Text>
          <View style={styles.budgetItems}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetItemIcon}>✈️</Text>
              <Text style={styles.budgetItemText}>Travel</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetItemIcon}>🏠</Text>
              <Text style={styles.budgetItemText}>New House</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetItemIcon}>🚗</Text>
              <Text style={styles.budgetItemText}>Car</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetItemIcon}>💍</Text>
              <Text style={styles.budgetItemText}>Wedding</Text>
            </View>
          </View>

          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Select the category" value="" />
            <Picker.Item label="Travel" value="travel" />
            <Picker.Item label="Housing" value="housing" />
            <Picker.Item label="Car" value="car" />
            <Picker.Item label="Wedding" value="wedding" />
          </Picker>

          <Text style={styles.label}>Budget Name</Text>
          <TextInput
            style={styles.input}
            value={budgetName}
            onChangeText={setBudgetName}
            placeholder="e.g. Monthly Budget"
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="$0.00"
          />

          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={styles.input}
              value={format(date, "MMMM dd yyyy")}
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
            <TextInput
              style={styles.input}
              value={format(endDate, "MMMM dd yyyy")}
              editable={false}
            />
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
            />
          )}

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add More</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (activeTab === "Loan") {
      return (
        <View>
          <Text style={styles.label}>Loan Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="$0.00"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.durationContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Picker
                  selectedValue="months"
                  style={[styles.input, { width: 120 }]}
                >
                  <Picker.Item label="Months" value="months" />
                  <Picker.Item label="Years" value="years" />
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={styles.input}
              value={format(date, "MMMM dd yyyy")}
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Loan Type</Text>
          <Picker
            selectedValue={loanType}
            onValueChange={(itemValue) => setLoanType(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Select loan type" value="" />
            <Picker.Item label="Personal Loan" value="personal" />
            <Picker.Item label="Car Loan" value="car" />
            <Picker.Item label="Home Loan" value="home" />
          </Picker>

          <Text style={styles.label}>Payment Frequency</Text>
          <View style={styles.frequencyButtons}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                paymentFrequency === "monthly" && styles.frequencyButtonActive,
              ]}
              onPress={() => setPaymentFrequency("monthly")}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  paymentFrequency === "monthly" && styles.frequencyButtonTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                paymentFrequency === "quarterly" && styles.frequencyButtonActive,
              ]}
              onPress={() => setPaymentFrequency("quarterly")}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  paymentFrequency === "quarterly" && styles.frequencyButtonTextActive,
                ]}
              >
                Quarterly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                paymentFrequency === "half_yearly" && styles.frequencyButtonActive,
              ]}
              onPress={() => setPaymentFrequency("half_yearly")}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  paymentFrequency === "half_yearly" && styles.frequencyButtonTextActive,
                ]}
              >
                Half Yearly
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Loan</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderTabContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F7F3",
    padding: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#00D09E",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#0E3E3E",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#00D09E",
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0E3E3E",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#00D09E",
    borderRadius: 5,
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: "#0E3E3E",
  },
  budgetItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  budgetItem: {
    width: "48%",
    backgroundColor: "#E0F1FF",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  budgetItemIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  budgetItemText: {
    fontSize: 16,
    color: "#0E3E3E",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  frequencyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  frequencyButton: {
    borderWidth: 1,
    borderColor: "#00D09E",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  frequencyButtonActive: {
    backgroundColor: "#00D09E",
  },
  frequencyButtonText: {
    fontSize: 14,
    color: "#0E3E3E",
  },
  frequencyButtonTextActive: {
    color: "#fff",
  },
});

export default AddTransactionScreen;