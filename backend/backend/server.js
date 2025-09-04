const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock database
let users = [];
let cashFlows = [];

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'CashFlowPro API is running',
    version: '1.0.0',
    status: 'healthy'
  });
});

// User Registration
app.post('/api/register', (req, res) => {
  const { name, email, company } = req.body;
  
  if (!name || !email || !company) {
    return res.status(400).json({ error: 'Missing required fields: name, email, company' });
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
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  res.json({
    message: 'Account created successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      company: newUser.company
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
  
  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company
    }
  });
});

// Get Cash Flow Data
app.get('/api/cashflow', (req, res) => {
  res.json({
     [
      { month: 'Jan', inflow: 45000, outflow: 32000 },
      { month: 'Feb', inflow: 48000, outflow: 35000 },
      { month: 'Mar', inflow: 52000, outflow: 38000 },
      { month: 'Apr', inflow: 49000, outflow: 41000 }
    ],
    summary: {
      currentCash: 45678,
      forecast: 68500,
      cashRatio: 2.4
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 CashFlowPro API is running on port ${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}`);
  console.log(`✅ Ready to accept requests!`);
});
