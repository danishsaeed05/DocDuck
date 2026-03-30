import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Create HTTP server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Create WebSocket server on a specific path to avoid conflicts
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '/', `http://${request.headers.host}`);
    
    if (pathname === '/ws-api') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket API');
    
    // Heartbeat to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket API');
      clearInterval(pingInterval);
    });
  });

  // API endpoint to save logs to a JSON file
  app.post('/api/save-log', (req, res) => {
    const logData = req.body;
    const logsFile = path.join(process.cwd(), 'public', 'patient_logs.json');
    console.log(`Saving log to: ${logsFile}`);
    
    let existingLogs = [];
    if (fs.existsSync(logsFile)) {
      try {
        const fileContent = fs.readFileSync(logsFile, 'utf8');
        existingLogs = JSON.parse(fileContent);
      } catch (e) {
        console.error('Error reading logs file:', e);
      }
    }

    existingLogs.push(logData);

    try {
      fs.writeFileSync(logsFile, JSON.stringify(existingLogs, null, 2));
      
      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'NEW_LOG', data: logData }));
        }
      });

      res.json({ status: 'ok', message: 'Log saved successfully' });
    } catch (e) {
      console.error('Error writing logs file:', e);
      res.status(500).json({ status: 'error', message: 'Failed to save log' });
    }
  });

  // API endpoint to get raw logs
  app.get('/api/get-logs', (req, res) => {
    const logsFile = path.join(process.cwd(), 'public', 'patient_logs.json');
    if (fs.existsSync(logsFile)) {
      try {
        const fileContent = fs.readFileSync(logsFile, 'utf8');
        res.json(JSON.parse(fileContent));
      } catch (e) {
        console.error('Error reading logs file:', e);
        res.status(500).json({ status: 'error', message: 'Failed to read logs' });
      }
    } else {
      res.json([]);
    }
  });

  // API endpoint to update raw logs
  app.post('/api/update-logs', (req, res) => {
    const logs = req.body;
    const logsFile = path.join(process.cwd(), 'public', 'patient_logs.json');
    
    try {
      fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
      
      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'LOGS_UPDATED', data: logs }));
        }
      });

      res.json({ status: 'ok', message: 'Logs updated successfully' });
    } catch (e) {
      console.error('Error updating logs file:', e);
      res.status(500).json({ status: 'error', message: 'Failed to update logs' });
    }
  });

  // API endpoint to send a message
  app.post('/api/send-message', (req, res) => {
    const message = req.body;
    const messagesFile = path.join(process.cwd(), 'public', 'messages.json');
    
    let existingMessages = [];
    if (fs.existsSync(messagesFile)) {
      try {
        const fileContent = fs.readFileSync(messagesFile, 'utf8');
        existingMessages = JSON.parse(fileContent);
      } catch (e) {
        console.error('Error reading messages file:', e);
      }
    }

    existingMessages.push(message);

    try {
      fs.writeFileSync(messagesFile, JSON.stringify(existingMessages, null, 2));
      
      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'NEW_MESSAGE', data: message }));
        }
      });

      res.json({ status: 'ok', message: 'Message sent successfully' });
    } catch (e) {
      console.error('Error writing messages file:', e);
      res.status(500).json({ status: 'error', message: 'Failed to send message' });
    }
  });

  // API endpoint to mark messages as read
  app.post('/api/mark-messages-read', (req, res) => {
    const messagesFile = path.join(process.cwd(), 'public', 'messages.json');
    
    if (fs.existsSync(messagesFile)) {
      try {
        const fileContent = fs.readFileSync(messagesFile, 'utf8');
        let messages = JSON.parse(fileContent);
        messages = messages.map((m: any) => ({ ...m, isRead: true }));
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
        
        // Broadcast to all connected clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'MESSAGES_READ' }));
          }
        });

        res.json({ status: 'ok', message: 'Messages marked as read' });
      } catch (e) {
        console.error('Error updating messages file:', e);
        res.status(500).json({ status: 'error', message: 'Failed to mark messages as read' });
      }
    } else {
      res.json({ status: 'ok', message: 'No messages to mark as read' });
    }
  });

  // API endpoint to get messages
  app.get('/api/get-messages', (req, res) => {
    const messagesFile = path.join(process.cwd(), 'public', 'messages.json');
    if (fs.existsSync(messagesFile)) {
      try {
        const fileContent = fs.readFileSync(messagesFile, 'utf8');
        res.json(JSON.parse(fileContent));
      } catch (e) {
        console.error('Error reading messages file:', e);
        res.status(500).json({ status: 'error', message: 'Failed to read messages' });
      }
    } else {
      res.json([]);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();
