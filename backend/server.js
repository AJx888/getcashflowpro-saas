const http = require('http');
const url = require('url');

// Simple in-memory database
let users = [];

// Simple HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
