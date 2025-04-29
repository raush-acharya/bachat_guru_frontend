import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Modal from "react-native-modal";
import { Switch } from "react-native-switch";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addDays } from "date-fns";
import { getCategories, addCategory, addExpense } from "../api/api";

const ExpenseForm = () => {
  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    paymentMethod: "cash",
    date: new Date(),
    notes: "",
    isRecurring: false,
    frequency: "daily",
    endDate: addDays(new Date(), 1),
  });
  const [categories, setCategories] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", type: "expense" });
  const [isPickerFocused, setIsPickerFocused] = useState(false);

  // Function to fetch categories from the database
  const fetchCategories = async () => {
    try {
      const response = await getCategories({ type: "expense" });
      setCategories(response.data.categories || []);
    } catch (error) {
      alert("Error fetching categories");
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      const response = await addCategory(newCategory);
      setCategories([...categories, response.data.category]);
      setNewCategory({ name: "", type: "expense" });
      setModalVisible(false);
      alert("Category added successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Error adding category");
    }
  };

  const handleSubmit = async () => {
    const formattedDate = format(form.date, "yyyy-MM-dd");
    const formattedEndDate = form.isRecurring
      ? format(form.endDate, "yyyy-MM-dd")
      : undefined;

    if (form.isRecurring && form.endDate <= form.date) {
      alert("End date must be after start date");
      return;
    }

    const payload = {
      categoryId: form.categoryId,
      amount: form.amount,
      paymentMethod: form.paymentMethod,
      date: formattedDate,
      notes: form.notes,
      isRecurring: form.isRecurring,
    };
    if (form.isRecurring) {
      payload.frequency = form.frequency;
      payload.endDate = formattedEndDate;
    }

    try {
      await addExpense(payload);
      alert("Expense added successfully!");
      setForm({
        categoryId: "",
        amount: "",
        paymentMethod: "cash",
        date: new Date(),
        notes: "",
        isRecurring: false,
        frequency: "daily",
        endDate: addDays(new Date(), 1),
      });
    } catch (error) {
      alert(error.response?.data?.message || "Error adding expense");
    }
  };

  // Handle dropdown focus - fetch categories when dropdown is clicked
  const handlePickerFocus = () => {
    setIsPickerFocused(true);
    fetchCategories(); // Fetch categories each time the dropdown is clicked
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity onPress={handlePickerFocus}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.categoryId}
            style={styles.input}
            onFocus={handlePickerFocus}
            onValueChange={(value) => {
              setIsPickerFocused(false);
              if (value === "add") {
                setModalVisible(true);
              } else {
                setForm({ ...form, categoryId: value });
              }
            }}
          >
            <Picker.Item label="Select category" value="" />
            {categories.map((category) => (
              <Picker.Item
                key={category._id}
                label={category.name}
                value={category._id}
              />
            ))}
            <Picker.Item label="Add Category" value="add" />
          </Picker>
        </View>
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Category</Text>
          <Text style={styles.modalLabel}>Category Name</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="e.g., Groceries"
            placeholderTextColor="#999"
            value={newCategory.name}
            onChangeText={(text) =>
              setNewCategory({ ...newCategory, name: text })
            }
          />
          <Text style={styles.modalLabel}>Type</Text>
          <Picker
            selectedValue={newCategory.type}
            style={styles.modalInput}
            onValueChange={(value) =>
              setNewCategory({ ...newCategory, type: value })
            }
          >
            <Picker.Item label="Income" value="income" />
            <Picker.Item label="Expense" value="expense" />
          </Picker>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddCategory}
            >
              <Text style={styles.modalButtonText}>Add Category</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={form.amount}
        onChangeText={(text) => setForm({ ...form, amount: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Payment Method</Text>
      <Picker
        selectedValue={form.paymentMethod}
        style={styles.input}
        onValueChange={(value) => setForm({ ...form, paymentMethod: value })}
      >
        <Picker.Item label="Cash" value="cash" />
        <Picker.Item label="Card" value="card" />
        <Picker.Item label="Bank" value="bank" />
        <Picker.Item label="Mobile" value="mobile" />
      </Picker>

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select date"
          value={format(form.date, "yyyy-MM-dd")}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setForm({ ...form, date: selectedDate });
          }}
        />
      )}

      <View style={styles.toggleContainer}>
        <Text style={styles.label}>Recurring</Text>
        <Switch
          value={form.isRecurring}
          onValueChange={(value) => setForm({ ...form, isRecurring: value })}
          circleSize={30}
          barHeight={30}
          circleBorderWidth={0}
          backgroundActive={"#00D09E"}
          backgroundInactive={"#ccc"}
          circleActiveColor={"#fff"}
          circleInActiveColor={"#fff"}
        />
      </View>

      {form.isRecurring && (
        <>
          <Text style={styles.label}>Frequency</Text>
          <Picker
            selectedValue={form.frequency}
            style={styles.input}
            onValueChange={(value) => setForm({ ...form, frequency: value })}
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
              placeholder="Select end date"
              value={format(form.endDate, "yyyy-MM-dd")}
              editable={false}
            />
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={form.endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) setForm({ ...form, endDate: selectedDate });
              }}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Add notes"
        value={form.notes}
        onChangeText={(text) => setForm({ ...form, notes: text })}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5FBFA",
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#E6F7F3",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#E6F7F3",
    borderRadius: 10,
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalContent: {
    backgroundColor: "#F5FBFA",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00D09E",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  modalInput: {
    backgroundColor: "#E6F7F3",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
    width: "100%",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: "#00D09E",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#00D09E",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ExpenseForm;
