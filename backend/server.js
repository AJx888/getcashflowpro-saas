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

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'CashFlowPro API is running',
    version: '1.0.0',
    status: 'healthy',
    features: ['Cash Flow Forecasting', 'Real-time Dashboards', 'Financial Insights', 'Integration Ready']
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
    plan: 'starter'
  };
  
  users.push(newUser);
  
  // Generate initial data for this user
  const initialData = {
    userId: newUser.id,
    cashFlowData: generateMockCashFlowData(),
    lastUpdated: new Date()
  };
  
  cashFlows.push(initialData);
  
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
  
  // Get latest 3 months for quick view
  const recentData = userData.cashFlowData.slice(-3);
  
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
      cashRatio: totalOutflow > 0 ? (totalInflow / totalOutflow).toFixed(2) : 0,
      forecast: totalInflow * 1.15, // 15% growth forecast
      upcomingExpenses: totalOutflow * 0.85 // 85% of expenses coming up
    },
    recentData: recentData,
    cashFlowData: userData.cashFlowData,
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
      predictedBalance: Math.round((baseInflow * inflowVariation) - (baseOutflow * outflowVariation))
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
  
  // Generate mock transaction data
  const transactions = [];
  const types = ['Invoice', 'Expense', 'Payment', 'Refund'];
  
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    
    transactions.push({
      id: i + 1,
      date: date.toISOString().split('T')[0],
      type: types[Math.floor(Math.random() * types.length)],
      description: `${types[Math.floor(Math.random() * types.length)]} #${Math.floor(Math.random() * 1000)}`,
      amount: Math.floor(Math.random() * 10000) - 5000, // Positive or negative
      category: ['Revenue', 'Operating', 'Investment', 'Other'][Math.floor(Math.random() * 4)]
    });
  }
  
  res.json({
    transactions,
    total: transactions.length
  });
});

// Get Financial Insights
app.get('/api/insights/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Generate insights based on mock data
  const insights = [
    {
      type: 'warning',
      title: 'Cash Flow Risk',
      description: 'Your cash flow is declining in Q3. Consider adjusting expenses.',
      severity: 'high'
    },
    {
      type: 'success',
      title: 'Growth Opportunity',
      description: 'Your revenue has increased 12% compared to last quarter.',
      severity: 'medium'
    },
    {
      type: 'info',
      title: 'Payment Reminder',
      description: 'You have 3 invoices due in the next 7 days.',
      severity: 'low'
    }
  ];
  
  res.json({
    insights,
    generatedAt: new Date()
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
