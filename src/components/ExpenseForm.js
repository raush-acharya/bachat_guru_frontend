// src/components/ExpenseForm.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button, Switch, IconButton } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addExpense } from "../api/api";
import { useNavigation } from "@react-navigation/native";

const ExpenseForm = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    categoryId: "",
    paymentMethod: "card",
    amount: "",
    notes: "",
    date: new Date(),
    isRecurring: false,
    frequency: "monthly",
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleSubmit = async () => {
    try {
      const expenseData = {
        categoryId: formData.categoryId,
        paymentMethod: formData.paymentMethod,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
        date: formData.date.toISOString().split("T")[0],
        isRecurring: formData.isRecurring,
        ...(formData.isRecurring && {
          frequency: formData.frequency,
          endDate: formData.endDate.toISOString().split("T")[0],
        }),
      };
      console.log("Sending Expense:", expenseData);
      await addExpense(expenseData);
      alert("Expense Added!");
      navigation.goBack();
    } catch (error) {
      console.error(
        "Add Expense Error:",
        error.response?.data || error.message
      );
      alert("Failed: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconButton icon="arrow-left" color="#0E3E3E" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expenses</Text>
        <IconButton icon="bell" color="#0E3E3E" size={24} onPress={() => {}} />
      </View>

      {/* Form */}
      <Text style={styles.label}>Date</Text>
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
        textColor="#0E3E3E"
        buttonColor="#DFF7E2"
      >
        {formData.date.toLocaleDateString()}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setFormData({ ...formData, date });
          }}
        />
      )}

      <Text style={styles.label}>Category</Text>
      <View style={styles.input}>
        <Picker
          selectedValue={formData.categoryId}
          onValueChange={(value) =>
            setFormData({ ...formData, categoryId: value })
          }
          style={{ backgroundColor: "#DFF7E2" }}
        >
          <Picker.Item label="Select category" value="" />
          <Picker.Item label="Food" value="67f50b357a50395b4cc2123a" />
          {/* Add more from GET /api/category */}
        </Picker>
      </View>

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.input}>
        <Picker
          selectedValue={formData.paymentMethod}
          onValueChange={(value) =>
            setFormData({ ...formData, paymentMethod: value })
          }
          style={{ backgroundColor: "#DFF7E2" }}
        >
          <Picker.Item label="Card" value="card" />
          <Picker.Item label="Cash" value="cash" />
          <Picker.Item label="Bank" value="bank" />
          <Picker.Item label="Mobile" value="mobile" />
        </Picker>
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        mode="outlined"
        value={formData.amount}
        onChangeText={(text) => setFormData({ ...formData, amount: text })}
        keyboardType="numeric"
        placeholder="$0"
        style={styles.input}
        outlineColor="#00D09E"
        activeOutlineColor="#00D09E"
        backgroundColor="#DFF7E2"
        textColor="#0E3E3E"
      />

      <Text style={styles.label}>Enter Message</Text>
      <TextInput
        mode="outlined"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        placeholder="E.g., Monthly Netflix subscription"
        style={styles.input}
        outlineColor="#00D09E"
        activeOutlineColor="#00D09E"
        backgroundColor="#DFF7E2"
        textColor="#0E3E3E"
      />

      <Text style={styles.label}>Recurring</Text>
      <Switch
        value={formData.isRecurring}
        onValueChange={(value) =>
          setFormData({ ...formData, isRecurring: value })
        }
        color="#00D09E"
      />

      {formData.isRecurring && (
        <>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.input}>
            <Picker
              selectedValue={formData.frequency}
              onValueChange={(value) =>
                setFormData({ ...formData, frequency: value })
              }
              style={{ backgroundColor: "#DFF7E2" }}
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="Yearly" value="yearly" />
            </Picker>
          </View>

          <Text style={styles.label}>End Date</Text>
          <Button
            mode="outlined"
            onPress={() => setShowEndDatePicker(true)}
            style={styles.input}
            textColor="#0E3E3E"
            buttonColor="#DFF7E2"
          >
            {formData.endDate.toLocaleDateString()}
          </Button>
          {showEndDatePicker && (
            <DateTimePicker
              value={formData.endDate}
              mode="date"
              onChange={(event, date) => {
                setShowEndDatePicker(false);
                if (date) setFormData({ ...formData, endDate: date });
              }}
            />
          )}
        </>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.saveButton}
        buttonColor="#00D09E"
        textColor="#F1FFF3"
      >
        Save
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F1FFF3" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#0E3E3E" },
  label: { fontSize: 16, marginBottom: 8, color: "#0E3E3E" },
  input: { marginBottom: 16 },
  saveButton: { marginTop: 20 },
});

export default ExpenseForm;
