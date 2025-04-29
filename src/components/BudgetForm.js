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
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addDays } from "date-fns";
import { getCategories, addCategory, addBudget } from "../api/api";

const BudgetForm = () => {
  const [form, setForm] = useState({
    categoryId: "",
    budgetName: "",
    amount: "",
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    notes: "",
  });
  const [categories, setCategories] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
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
    const formattedStartDate = format(form.startDate, "yyyy-MM-dd");
    const formattedEndDate = format(form.endDate, "yyyy-MM-dd");

    if (form.endDate <= form.startDate) {
      alert("End date must be after start date");
      return;
    }

    const payload = {
      categoryId: form.categoryId,
      budgetName: form.budgetName,
      amount: form.amount,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      notes: form.notes,
    };

    try {
      await addBudget(payload);
      alert("Budget added successfully!");
      setForm({
        categoryId: "",
        budgetName: "",
        amount: "",
        startDate: new Date(),
        endDate: addDays(new Date(), 1),
        notes: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Error adding budget");
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

      <Text style={styles.label}>Budget Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter budget name"
        value={form.budgetName}
        onChangeText={(text) => setForm({ ...form, budgetName: text })}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={form.amount}
        onChangeText={(text) => setForm({ ...form, amount: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select start date"
          value={format(form.startDate, "yyyy-MM-dd")}
          editable={false}
        />
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={form.startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) setForm({ ...form, startDate: selectedDate });
          }}
        />
      )}

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

      <Text style={styles.label}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Add notes"
        value={form.notes}
        onChangeText={(text) => setForm({ ...form, notes: text })}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Budget</Text>
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

export default BudgetForm;
