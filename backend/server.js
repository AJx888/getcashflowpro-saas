const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock databases
let users = [];
let cashFlows = [];
let transactions = [];
let forecasts = [];
let alerts = [];
let insights = [];

// Helper function to generate mock data
function generateMockCashFlowData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    id: index + 1,
    month,
    inflow: Math.floor(Math.random() * 50000) + 30000,
    outflow: Math.floor(Math.random() * 40000) + 20000,
    balance: 0
  }));
}

// Helper function to generate mock transactions
function generateMockTransactions(userId) {
  const types = ['Invoice', 'Expense', 'Payment', 'Refund', 'Salary', 'Tax', 'Investment'];
  const categories = ['Revenue', 'Operating', 'Investment', 'Other'];
  const transactions = [];
  
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    
    transactions.push({
      id: i + 1,
      userId: userId,
      date: date.toISOString().split('T')[0],
      type: types[Math.floor(Math.random() * types.length)],
      description: `${types[Math.floor(Math.random() * types.length)]} #${Math.floor(Math.random() * 1000)}`,
      amount: Math.floor(Math.random() * 10000) - 5000, // Positive or negative
      category: categories[Math.floor(Math.random() * categories.length)],
      status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)]
    });
  }
  
  return transactions;
}

// Helper function to generate mock alerts
function generateMockAlerts(userId) {
  const alerts = [
    {
      id: 1,
      userId: userId,
      type: 'warning',
      title: 'Low Cash Balance',
      description: 'Your cash balance is below $10,000. Consider adjusting expenses.',
      severity: 'high',
      createdAt: new Date().toISOString(),
      resolved: false
    },
    {
      id: 2,
      userId: userId,
      type: 'info',
      title: 'Upcoming Invoice',
      description: 'You have an invoice due in 3 days.',
      severity: 'medium',
      createdAt: new Date().toISOString(),
      resolved: false
    }
  ];
  return alerts;
}

// Helper function to generate mock insights
function generateMockInsights(userId) {
  const insights = [
    {
      id: 1,
      userId: userId,
      type: 'warning',
      title: 'Cash Flow Risk',
      description: 'Your cash flow is declining in Q3. Consider adjusting expenses.',
      severity: 'high',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      userId: userId,
      type: 'success',
      title: 'Growth Opportunity',
      description: 'Your revenue has increased 12% compared to last quarter.',
      severity: 'medium',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      userId: userId,
      type: 'info',
      title: 'Payment Reminder',
      description: 'You have 3 invoices due in the next 7 days.',
      severity: 'low',
      createdAt: new Date().toISOString()
    }
  ];
  return insights;
}

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'CashFlowPro API is running',
    version: '1.0.0',
    status: 'healthy',
    features: [
      'Cash Flow Forecasting',
      'Real-time Dashboards',
      'Financial Insights',
      'Alert System',
      'Transaction History',
      'Integration Ready',
      'Mobile Access',
      'Team Collaboration'
    ]
  });
});

// User Registration
app.post('/api/register', (req, res) => {
  const { name, email, company, password } = req.body;
  
  if (!name || !email || !company || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, email, company, password' 
    });
  }
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    company,
    password: 'hashed_password', // In real app, hash this!
    createdAt: new Date(),
    plan: 'starter',
    stripeCustomerId: null // For payment integration
  };
  
  users.push(newUser);
  
  // Generate initial data for this user
  const initialData = {
    userId: newUser.id,
    cashFlowData: generateMockCashFlowData(),
    lastUpdated: new Date()
  };
  
  cashFlows.push(initialData);
  
  // Generate mock transactions
  const mockTransactions = generateMockTransactions(newUser.id);
  transactions = [...transactions, ...mockTransactions];
  
  // Generate mock alerts
  const mockAlerts = generateMockAlerts(newUser.id);
  alerts = [...alerts, ...mockAlerts];
  
  // Generate mock insights
  const mockInsights = generateMockInsights(newUser.id);
  insights = [...insights, ...mockInsights];
  
  res.json({
    message: 'Account created successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      company: newUser.company,
      plan: newUser.plan
    }
  });
});

// User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // In real app, verify password
  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      plan: user.plan
    },
    token: 'fake-jwt-token-' + user.id // In real app, generate real JWT
  });
});

// Get User Dashboard Data
app.get('/api/dashboard/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Get user's cash flow data
  const userData = cashFlows.find(d => d.userId === userId);
  
  if (!userData) {
    return res.status(404).json({ error: 'No data found for user' });
  }
  
  // Calculate summary stats
  const totalInflow = userData.cashFlowData.reduce((sum, item) => sum + item.inflow, 0);
  const totalOutflow = userData.cashFlowData.reduce((sum, item) => sum + item.outflow, 0);
  const netCashFlow = totalInflow - totalOutflow;
  const cashRatio = totalOutflow > 0 ? (totalInflow / totalOutflow).toFixed(2) : 0;
  
  // Get latest 3 months for quick view
  const recentData = userData.cashFlowData.slice(-3);
  
  // Get user's transactions
  const userTransactions = transactions.filter(t => t.userId === userId);
  
  // Get user's alerts
  const userAlerts = alerts.filter(a => a.userId === userId && !a.resolved);
  
  // Get user's insights
  const userInsights = insights.filter(i => i.userId === userId);
  
  res.json({
    user: {
      id: user.id,
      name: user.name,
      company: user.company,
      plan: user.plan
    },
    summary: {
      currentCash: netCashFlow,
      monthlyAverage: Math.round(netCashFlow / userData.cashFlowData.length),
      cashRatio: cashRatio,
      forecast: totalInflow * 1.15, // 15% growth forecast
      upcomingExpenses: totalOutflow * 0.85, // 85% of expenses coming up
      alertsCount: userAlerts.length,
      insightsCount: userInsights.length
    },
    recentData: recentData,
    cashFlowData: userData.cashFlowData,
    transactions: userTransactions.slice(0, 10), // Latest 10 transactions
    alerts: userAlerts,
    insights: userInsights,
    lastUpdated: userData.lastUpdated
  });
});

// Get Cash Flow Forecast
app.post('/api/forecast', (req, res) => {
  const { userId, monthsAhead = 6 } = req.body;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Generate realistic forecast data
  const forecastData = [];
  const baseInflow = 45000; // Base monthly income
  const baseOutflow = 35000; // Base monthly expenses
  
  for (let i = 0; i < monthsAhead; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() + i);
    
    // Simulate realistic fluctuations
    const inflowVariation = 1 + (Math.random() - 0.5) * 0.2; // ±10%
    const outflowVariation = 1 + (Math.random() - 0.5) * 0.15; // ±15%
    
    forecastData.push({
      month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      predictedInflow: Math.round(baseInflow * inflowVariation),
      predictedOutflow: Math.round(baseOutflow * outflowVariation),
      predictedBalance: Math.round((baseInflow * inflowVariation) - (baseOutflow * outflowVariation)),
      confidence: 0.95 - (i * 0.02) // Confidence decreases with time
    });
  }
  
  res.json({
    forecast: forecastData,
    generatedAt: new Date(),
    confidence: 0.95 // 95% confidence level
  });
});

// Get Transaction History
app.get('/api/transactions/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Get user's transactions
  const userTransactions = transactions.filter(t => t.userId === userId);
  
  res.json({
    transactions: userTransactions,
    total: userTransactions.length,
    lastUpdated: new Date()
  });
});

// Get Financial Insights
app.get('/api/insights/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Get user's insights
  const userInsights = insights.filter(i => i.userId === userId);
  
  res.json({
    insights: userInsights,
    total: userInsights.length,
    generatedAt: new Date()
  });
});

// Get Alerts
app.get('/api/alerts/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Get user's alerts
  const userAlerts = alerts.filter(a => a.userId === userId && !a.resolved);
  
  res.json({
    alerts: userAlerts,
    total: userAlerts.length,
    generatedAt: new Date()
  });
});

// Resolve Alert
app.put('/api/alerts/:alertId/resolve', (req, res) => {
  const alertId = parseInt(req.params.alertId);
  const alert = alerts.find(a => a.id === alertId);
  
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  
  alert.resolved = true;
  alert.resolvedAt = new Date().toISOString();
  
  res.json({
    message: 'Alert resolved successfully',
    alert: alert
  });
});

// Get Financial Health Score
app.get('/api/health/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Calculate financial health score (0-100)
  const healthScore = Math.min(100, Math.max(0, 
    70 + // Base score
    Math.random() * 30 // Random variation
  ));
  
  res.json({
    healthScore: Math.round(healthScore),
    status: healthScore >= 80 ? 'excellent' : 
            healthScore >= 60 ? 'good' : 
            healthScore >= 40 ? 'fair' : 'poor',
    explanation: healthScore >= 80 ? 'Excellent financial health' :
                healthScore >= 60 ? 'Good financial health' :
                healthScore >= 40 ? 'Fair financial health' : 'Poor financial health',
    lastUpdated: new Date()
  });
});

// Export Reports
app.post('/api/reports/export', (req, res) => {
  const { userId, reportType, format } = req.body;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // In a real app, this would generate a PDF/Excel file
  // For demo purposes, we'll return a mock export URL
  const exportUrl = `/api/reports/${userId}/${reportType}.${format}`;
  
  res.json({
    message: 'Report generation started',
    exportUrl: exportUrl,
    status: 'processing',
    estimatedCompletion: '5 seconds'
  });
});

// Get Team Members (for team collaboration)
app.get('/api/team/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Mock team members
  const teamMembers = [
    {
      id: 1,
      name: user.name,
      email: user.email,
      role: 'Owner',
      avatar: 'https://via.placeholder.com/40',
      lastActive: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'Finance Manager',
      avatar: 'https://via.placeholder.com/40',
      lastActive: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@company.com',
      role: 'Accountant',
      avatar: 'https://via.placeholder.com/40',
      lastActive: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  
  res.json({
    teamMembers: teamMembers,
    totalMembers: teamMembers.length,
    lastUpdated: new Date()
  });
});

// Add Payment Integration Points (Stripe placeholders)
app.post('/api/payment/setup', (req, res) => {
  const { userId, paymentMethod } = req.body;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // In real app, this would create a Stripe customer
  // For demo, we'll just simulate it
  user.stripeCustomerId = 'cus_' + Math.random().toString(36).substr(2, 9);
  
  res.json({
    message: 'Payment setup complete',
    stripeCustomerId: user.stripeCustomerId,
    status: 'success'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 CashFlowPro API is running on port ${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}`);
  console.log(`✅ Ready to accept requests!`);
});

console.log('CashFlowPro Backend is ready!');
