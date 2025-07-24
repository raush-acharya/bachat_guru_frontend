import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { 
  getCategories, 
  addExpense, 
  processBill 
} from "../api/api";
import AnalyticsComponent from "../components/AnalyticsComponent"; // Import the analytics component

const OCRScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [image, setImage] = useState(null);
  const [ocrResults, setOcrResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [refreshAnalytics, setRefreshAnalytics] = useState(0); // Key to force analytics refresh

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getCategories({ type: "expense" });
        setCategories(response.data.categories || []);
      } catch (err) {
        setError("Failed to load categories. Please try again.");
        console.error("Fetch Categories Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDateChange = (selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const pickImage = async () => {
    try {
      setShowAnalytics(false);
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Please allow access to your photo library.");
        setShowAnalytics(true);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        await processImage(imageUri);
      } else {
        // User canceled or no image selected
        setShowAnalytics(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setShowAnalytics(true);
    }
  };

  const processImage = async (imageUri) => {
    if (!imageUri) {
      setError("No image selected");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Create FormData for the API call
      const formData = new FormData();
      
      // Get file extension from URI
      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      formData.append("file", {
        uri: imageUri,
        name: `bill.${fileExtension}`,
        type: mimeType,
      });

      console.log("Processing image:", imageUri);
      const response = await processBill(formData);
      
      if (response && response.data && response.data.length > 0) {
        setOcrResults(response.data);
        const firstItem = response.data[0];
        
        // Parse and set the date
        if (firstItem.date) {
          const parsedDate = new Date(firstItem.date);
          setDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
        }
        
        // Set other fields
        if (firstItem.net_amount) {
          setAmount(firstItem.net_amount.toString());
        }
        if (firstItem.item) {
          setTitle(firstItem.item);
        }
        if (firstItem.remarks) {
          setNotes(firstItem.remarks);
        }
        
        // Find matching category
        if (firstItem.category && categories.length > 0) {
          const matchingCategory = categories.find(
            (cat) => cat.name.toLowerCase() === firstItem.category.toLowerCase()
          );
          if (matchingCategory) {
            setCategory(matchingCategory._id);
          }
        }
      } else {
        setError("No data extracted from the image. Please try with a clearer image.");
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setError("Failed to process bill image. Please try again with a clearer image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsExpense = async () => {
    if (!amount || !category || !paymentMethod) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = {
        categoryId: category,
        amount: parseFloat(amount),
        paymentMethod,
        date: format(date, "yyyy-MM-dd"),
        notes,
      };
      
      const response = await addExpense(data);
      Alert.alert("Success", "Expense saved successfully!");

      // Reset form and refresh analytics
      resetScreen();
      setRefreshAnalytics(prev => prev + 1); // Force analytics refresh
      
    } catch (error) {
      const errorMsg = error.response?.data?.errors
        ? error.response.data.errors.map((e) => e.msg).join(", ")
        : error.message;
      setError(`Failed to save expense: ${errorMsg}`);
      console.error("Save Expense Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetScreen = () => {
    setImage(null);
    setOcrResults([]);
    setAmount("");
    setTitle("");
    setNotes("");
    setCategory("");
    setPaymentMethod("cash");
    setError("");
    setShowAnalytics(true);
  };

  const renderContent = () => {
    if (loading && !showAnalytics) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09E" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      );
    }

    if (error && !showAnalytics) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setError("")}>
            <Text style={styles.retryButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {showAnalytics && (
          <AnalyticsComponent 
            key={refreshAnalytics} // Force refresh when key changes
            onOcrPress={pickImage} 
          />
        )}
        
        {!showAnalytics && (
          <>
            <TouchableOpacity style={styles.backButton} onPress={resetScreen}>
              <Text style={styles.backButtonText}>← Back to Analytics</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Upload a Bill Image</Text>
            {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={loading}>
              <Text style={styles.uploadButtonText}>
                {loading ? "Processing..." : "Upload Bill Image"}
              </Text>
            </TouchableOpacity>

            {ocrResults.length > 0 && (
              <View>
                <Text style={styles.label}>OCR Results</Text>
                <ScrollView style={styles.resultsContainer}>
                  {ocrResults.map((item, index) => (
                    <View key={index} style={styles.ocrItem}>
                      <Text style={styles.ocrItemText}>Item: {item.item}</Text>
                      <Text style={styles.ocrItemText}>Amount: Rs.{item.net_amount}</Text>
                      <Text style={styles.ocrItemText}>Category: {item.category}</Text>
                      <Text style={styles.ocrItemText}>Date: {item.date}</Text>
                      <Text style={styles.ocrItemText}>Remarks: {item.remarks}</Text>
                    </View>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    style={styles.input}
                    value={format(date, "MMMM dd yyyy")}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  date={date}
                  onConfirm={handleDateChange}
                  onCancel={() => setShowDatePicker(false)}
                />

                <Text style={styles.label}>Category *</Text>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.input}
                >
                  <Picker.Item label="Select the category" value="" />
                  {categories.map((cat) => (
                    <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                  ))}
                </Picker>

                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="Rs.0.00"
                />

                <Text style={styles.label}>Expense Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Dinner"
                />

                <Text style={styles.label}>Payment Method *</Text>
                <Picker
                  selectedValue={paymentMethod}
                  onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                  style={styles.input}
                >
                  <Picker.Item label="Cash" value="cash" />
                  <Picker.Item label="Card" value="card" />
                  <Picker.Item label="Bank" value="bank" />
                  <Picker.Item label="Mobile" value="mobile" />
                </Picker>

                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder="Additional notes..."
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetScreen}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      loading && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSaveAsExpense}
                    disabled={loading}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? "Saving..." : "Save as Expense"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={() => {
            resetScreen();
            setRefreshAnalytics(prev => prev + 1);
          }} 
        />
      }
    >
      <Text style={styles.title}>Bill Reader & Analytics</Text>
      {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FFF3",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#0E3E3E",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#0E3E3E",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  backButton: {
    backgroundColor: "#9E9E9E",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: "#00D09E",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    flex: 1,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#00D09E",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    flex: 1,
  },
  submitButtonDisabled: {
    backgroundColor: "#a0e0d0",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreview: {
    width: 250,
    height: 200,
    resizeMode: "contain",
    marginVertical: 15,
    alignSelf: "center",
    borderRadius: 10,
  },
  resultsContainer: {
    maxHeight: 200,
    marginBottom: 15,
  },
  ocrItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  ocrItemText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
    alignItems: "center",
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default OCRScreen;