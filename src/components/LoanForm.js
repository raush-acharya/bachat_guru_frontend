import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addMonths } from 'date-fns';
import { addLoan } from '../api/api';

const LoanForm = () => {
  const [form, setForm] = useState({
    title: '',
    lenderName: '',
    amount: '',
    interestRate: '',
    startDate: new Date(),
    paymentFrequency: 'monthly',
    compoundingFrequency: 'monthly',
    numberOfPayments: '',
    status: 'active',
    notes: '',
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const handleSubmit = async () => {
    // Calculate endDate based on startDate and numberOfPayments
    const months = parseInt(form.numberOfPayments, 10) || 0;
    const endDate = addMonths(form.startDate, months);

    // Format dates
    const formattedStartDate = format(form.startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    // Validate
    if (months <= 0) {
      alert('Number of payments must be greater than 0');
      return;
    }

    const payload = {
      title: form.title,
      lenderName: form.lenderName,
      amount: form.amount,
      interestRate: form.interestRate,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      paymentFrequency: form.paymentFrequency,
      compoundingFrequency: form.compoundingFrequency,
      numberOfPayments: form.numberOfPayments,
      status: form.status,
      notes: form.notes,
    };

    try {
      await addLoan(payload);
      alert('Loan added successfully!');
      setForm({
        title: '',
        lenderName: '',
        amount: '',
        interestRate: '',
        startDate: new Date(),
        paymentFrequency: 'monthly',
        compoundingFrequency: 'monthly',
        numberOfPayments: '',
        status: 'active',
        notes: '',
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding loan');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Loan Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter loan title"
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
      />

      <Text style={styles.label}>Lender Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter lender name"
        value={form.lenderName}
        onChangeText={(text) => setForm({ ...form, lenderName: text })}
      />

      <Text style={styles.label}>Loan Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={form.amount}
        onChangeText={(text) => setForm({ ...form, amount: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Interest Rate (%)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={form.interestRate}
        onChangeText={(text) => setForm({ ...form, interestRate: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Duration</Text>
      <TextInput
        style={styles.input}
        placeholder="Months"
        value={form.numberOfPayments}
        onChangeText={(text) => setForm({ ...form, numberOfPayments: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select start date"
          value={format(form.startDate, 'yyyy-MM-dd')}
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

      <Text style={styles.label}>Payment Frequency</Text>
      <View style={styles.frequencyContainer}>
        {['monthly', 'quarterly', 'half-yearly'].map((freq) => (
          <TouchableOpacity
            key={freq}
            style={[
              styles.frequencyButton,
              form.paymentFrequency === freq && styles.activeFrequencyButton,
            ]}
            onPress={() => setForm({ ...form, paymentFrequency: freq })}
          >
            <Text
              style={[
                styles.frequencyText,
                form.paymentFrequency === freq && styles.activeFrequencyText,
              ]}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Compounding Frequency</Text>
      <Picker
        selectedValue={form.compoundingFrequency}
        style={styles.input}
        onValueChange={(value) => setForm({ ...form, compoundingFrequency: value })}
      >
        <Picker.Item label="Monthly" value="monthly" />
        <Picker.Item label="Quarterly" value="quarterly" />
        <Picker.Item label="Half-Yearly" value="half-yearly" />
      </Picker>

      <Text style={styles.label}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Add notes"
        value={form.notes}
        onChangeText={(text) => setForm({ ...form, notes: text })}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Loan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5FBFA',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#E6F7F3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  frequencyButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00D09E',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeFrequencyButton: {
    backgroundColor: '#00D09E',
  },
  frequencyText: {
    color: '#00D09E',
    fontSize: 14,
  },
  activeFrequencyText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#00D09E',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 50,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoanForm;