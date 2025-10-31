/**
 * Server Entry Point
 * Starts the Express server
 */

const app = require('./app');
const config = require('./config/config');

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.NODE_ENV}`);
  console.log(`🤖 AI Provider: ${config.AI_PROVIDER}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});