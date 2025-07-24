import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { getIncome, getExpenses, getCategories, getLoan } from "../api/api";

const AnalyticsComponent = ({ onOcrPress }) => {
  const screenWidth = Dimensions.get("window").width;
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Helper function to format date for display based on time range
  const formatDateForDisplay = (dateString, timeRange) => {
    const date = new Date(dateString);
    if (timeRange === "7days") {
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    } else if (timeRange === "month") {
      return `Week ${getWeekNumber(date)}`;
    } else if (timeRange === "year") {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
    return dateString;
  };

  // Generate date range based on time range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeRange === "7days") {
      startDate.setDate(endDate.getDate() - 6);
      const days = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        days.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return days;
    } else if (timeRange === "month") {
      startDate.setMonth(endDate.getMonth() - 1);
      return { startDate, endDate };
    } else if (timeRange === "year") {
      startDate.setFullYear(endDate.getFullYear() - 1);
      return { startDate, endDate };
    }
  };

  // Aggregate data by week
  const aggregateByWeek = (data, startDate, endDate) => {
    const weeklyData = {};
    data.forEach(item => {
      const date = new Date(item.date || item.createdAt);
      if (date >= startDate && date <= endDate) {
        const weekNumber = getWeekNumber(date);
        const weekKey = `Week ${weekNumber}`;
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + (item.amount || 0);
      }
    });

    // Create array of last 4 weeks
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const weekNum = getWeekNumber(weekDate);
      const weekKey = `Week ${weekNum}`;
      weeks.push({
        date: weekKey,
        amount: weeklyData[weekKey] || 0
      });
    }
    return weeks;
  };

  // Aggregate data by month
  const aggregateByMonth = (data, startDate, endDate) => {
    const monthlyData = {};
    data.forEach(item => {
      const date = new Date(item.date || item.createdAt);
      if (date >= startDate && date <= endDate) {
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (item.amount || 0);
      }
    });

    // Create array of last 12 months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthKey = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({
        date: monthKey,
        amount: monthlyData[monthKey] || 0
      });
    }
    return months;
  };

  // Generate random colors for pie chart
  const generateRandomColors = (count) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    return colors.slice(0, count);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateRange = getDateRange();
        let startDate, endDate;
        
        if (timeRange === "7days") {
          endDate = new Date();
          startDate = new Date();
          startDate.setDate(endDate.getDate() - 6);
        } else {
          startDate = dateRange.startDate;
          endDate = dateRange.endDate;
        }

        const [incomeResponse, expenseResponse, categoriesResponse, loanResponse] = await Promise.all([
          getIncome({ 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
          }),
          getExpenses({ 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
          }),
          getCategories(),
          getLoan().catch(() => ({ data: { loans: [] } }))
        ]);

        const incomes = incomeResponse.data?.incomes || incomeResponse.data || [];
        const expenses = expenseResponse.data?.expenses || expenseResponse.data || [];
        const categories = categoriesResponse.data?.categories || categoriesResponse.data || [];
        const loans = loanResponse.data?.loans || loanResponse.data || [];

        let processedIncomeData, processedExpenseData, processedLoanData;

        if (timeRange === "7days") {
          const days = dateRange;
          const incomeByDate = {};
          const expenseByDate = {};

          incomes.forEach(item => {
            const date = formatDate(item.date || item.createdAt);
            if (days.includes(date)) {
              incomeByDate[date] = (incomeByDate[date] || 0) + (item.amount || 0);
            }
          });

          expenses.forEach(item => {
            const date = formatDate(item.date || item.createdAt);
            if (days.includes(date)) {
              expenseByDate[date] = (expenseByDate[date] || 0) + (item.amount || 0);
            }
          });

          processedIncomeData = days.map(date => ({
            date,
            amount: incomeByDate[date] || 0,
          }));

          processedExpenseData = days.map(date => ({
            date,
            amount: expenseByDate[date] || 0,
          }));

          // For loans in daily view
          processedLoanData = days.map(date => {
            const loan = loans.find(loan => formatDate(loan.createdAt || loan.date) === date);
            return {
              date,
              balance: loan ? (loan.remainingAmount || loan.amount || 0) : 0
            };
          });

        } else if (timeRange === "month") {
          processedIncomeData = aggregateByWeek(incomes, startDate, endDate);
          processedExpenseData = aggregateByWeek(expenses, startDate, endDate);
          
          // For loans in weekly view
          processedLoanData = processedIncomeData.map((item, index) => ({
            date: item.date,
            balance: loans.length > 0 ? (loans[0].remainingAmount || loans[0].amount || 0) : 0
          }));

        } else if (timeRange === "year") {
          processedIncomeData = aggregateByMonth(incomes, startDate, endDate);
          processedExpenseData = aggregateByMonth(expenses, startDate, endDate);
          
          // For loans in monthly view
          processedLoanData = processedIncomeData.map((item, index) => ({
            date: item.date,
            balance: loans.length > 0 ? (loans[0].remainingAmount || loans[0].amount || 0) : 0
          }));
        }

        setIncomeData(processedIncomeData);
        setExpenseData(processedExpenseData);
        setLoanData(processedLoanData);

        // Process category data for pie chart (same logic)
        const categoryTotals = {};
        expenses.forEach(item => {
          let categoryName = 'Other';
          if (item.categoryId) {
            if (typeof item.categoryId === 'string') {
              const category = categories.find(cat => cat._id === item.categoryId);
              categoryName = category ? category.name : 'Other';
            } else if (item.categoryId.name) {
              categoryName = item.categoryId.name;
            } else if (item.categoryId._id) {
              const category = categories.find(cat => cat._id === item.categoryId._id);
              categoryName = category ? category.name : 'Other';
            }
          } else if (item.category) {
            categoryName = item.category;
          }
          categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + (item.amount || 0);
        });

        const categoryEntries = Object.entries(categoryTotals);
        const colors = generateRandomColors(categoryEntries.length);
        
        const processedBudgetData = categoryEntries.map(([name, amount], index) => ({
          name,
          population: amount,
          color: colors[index] || '#' + Math.floor(Math.random()*16777215).toString(16),
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        }));

        setBudgetData(processedBudgetData);

      } catch (err) {
        setError("Failed to load analytics data");
        console.error("Analytics Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D09E" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasIncomeData = incomeData.some(item => item.amount > 0);
  const hasExpenseData = expenseData.some(item => item.amount > 0);
  const hasBudgetData = budgetData.length > 0;
  const hasLoanData = loanData.some(item => item.balance > 0);

  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case "7days": return "Last 7 Days";
      case "month": return "Last Month (Weekly)";
      case "year": return "Last Year (Monthly)";
      default: return "";
    }
  };

  return (
    <View style={styles.container}>
      {/* Elegant Time Range Navigation */}
      <View style={styles.navigationContainer}>
        <Text style={styles.navigationTitle}>Analytics</Text>
        <View style={styles.tabContainer}>
          {[
            { key: "7days", label: "7D" },
            { key: "month", label: "1M" },
            { key: "year", label: "1Y" }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                timeRange === tab.key && styles.activeTab
              ]}
              onPress={() => setTimeRange(tab.key)}
            >
              <Text style={[
                styles.tabText,
                timeRange === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Income vs Expense Chart */}
      <Text style={styles.chartTitle}>Income vs Expense ({getTimeRangeLabel()})</Text>
      {(hasIncomeData || hasExpenseData) ? (
        <LineChart
          data={{
            labels: incomeData.map(item => 
              timeRange === "7days" ? 
                formatDateForDisplay(item.date, timeRange) : 
                item.date
            ),
            datasets: [
              ...(hasIncomeData ? [{
                data: incomeData.map(item => item.amount),
                color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
                strokeWidth: 3,
              }] : []),
              ...(hasExpenseData ? [{
                data: expenseData.map(item => item.amount),
                color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
                strokeWidth: 3,
              }] : []),
            ],
            legend: hasIncomeData && hasExpenseData ? ["Income", "Expenses"] : 
                   hasIncomeData ? ["Income"] : ["Expenses"]
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel="Rs."
          chartConfig={{
            backgroundColor: "#00D09E",
            backgroundGradientFrom: "#00D09E",
            backgroundGradientTo: "#00A087",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#F5FBFA",
            },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No income or expense data available</Text>
        </View>
      )}

      {/* Budget Allocation Pie Chart */}
      <Text style={styles.chartTitle}>Expense by Category</Text>
      {hasBudgetData ? (
        <PieChart
          data={budgetData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend
          style={styles.chart}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No expense categories to display</Text>
        </View>
      )}

      {/* Loan Balance Chart */}
      <Text style={styles.chartTitle}>Loan Balance</Text>
      {hasLoanData ? (
        <LineChart
          data={{
            labels: loanData.map(item => 
              timeRange === "7days" ? 
                formatDateForDisplay(item.date, timeRange) : 
                item.date
            ),
            datasets: [
              {
                data: loanData.map(item => item.balance),
                color: (opacity = 1) => `rgba(0, 208, 158, ${opacity})`,
                strokeWidth: 3,
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel="Rs."
          chartConfig={{
            backgroundColor: "#00D09E",
            backgroundGradientFrom: "#F5FBFA",
            backgroundGradientTo: "#00D09E",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(14, 62, 62, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(14, 62, 62, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#00D09E",
            },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No loan data available</Text>
        </View>
      )}

      <TouchableOpacity style={styles.ocrButton} onPress={onOcrPress}>
        <Text style={styles.ocrButtonText}>Scan Bill with OCR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  
  navigationContainer: {
    marginBottom: 25,
  },
  navigationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0E3E3E",
    textAlign: "center",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5FBFA",
    borderRadius: 25,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#00D09E",
    elevation: 3,
    shadowColor: "#00D09E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  chartTitle: {
    fontSize: 18,
    color: "#0E3E3E",
    marginVertical: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  ocrButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
    marginVertical: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ocrButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    backgroundColor: "#FFECEC",
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6347",
    alignItems: "center",
  },
  errorText: {
    color: "#FF6347",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#FF6347",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  noDataContainer: {
    backgroundColor: "#F5F5F5",
    padding: 30,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  noDataText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});

export default AnalyticsComponent;