const http = require('http');
const url = require('url');

// Simple in-memory database
let users = [];

// Simple HTTP server with proper CORS
const server = http.createServer((req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*'); // For development
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API Routes
  if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      message: 'CashFlowPro API is running',
      version: '1.0.0',
      status: 'healthy'
    }));
    
  } else if (req.method === 'POST' && pathname === '/api/register') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        const { name, email, company, password } = userData;
        
        // Simple validation
        if (!name || !email || !company || !password) {
          res.writeHead(400);
          res.end(JSON.stringify({ 
            error: 'Missing required fields: name, email, company, password' 
          }));
          return;
        }
        
        // Create user
        const newUser = {
          id: users.length + 1,
          name,
          email,
          company,
          createdAt: new Date()
        };
        
        users.push(newUser);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          message: 'Account created successfully',
          user: newUser
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
  } else if (req.method === 'POST' && pathname === '/api/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const loginData = JSON.parse(body);
        const { email, password } = loginData;
        
        // Simple login (in real app, you'd verify password)
        const user = users.find(u => u.email === email);
        
        if (!user) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({
          message: 'Login successful',
          user: user,
          token: 'fake-jwt-token-' + user.id
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 CashFlowPro API is running on port ${PORT}`);
});

console.log('CashFlowPro Backend is ready!');
