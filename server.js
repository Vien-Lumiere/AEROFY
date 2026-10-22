import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & performance headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static assets with long cache
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: '1y',
  immutable: true
}));

// Serve static files from root directory
app.use(express.static(__dirname, {
  maxAge: '1h',
  index: false
}));

// API Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AEROFY ESP32C3 Telemetry Command Center',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// SPA Fallback for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  =======================================================
  🚀 AEROFY · ESP32C3 Telemetry Command Center Online
  -------------------------------------------------------
  ► Local URL:   http://localhost:${PORT}
  ► Healthcheck: http://localhost:${PORT}/api/health
  =======================================================
  `);
});

