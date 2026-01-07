require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
      }
    });

    // Socket.IO authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log(`✅ User connected: ${socket.userId}`);

      // Join user to their personal room
      socket.join(socket.userId);

      // Join conversation room
      socket.on('join-conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave-conversation', (conversationId) => {
        socket.leave(conversationId);
      });

      // Typing indicator
      socket.on('typing', ({ conversationId, isTyping }) => {
        socket.to(conversationId).emit('user-typing', {
          userId: socket.userId,
          isTyping
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.userId}`);
      });
    });

    // Make io accessible to routes
    app.set('io', io);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
      console.log(`💬 Socket.IO initialized`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          await prisma.$disconnect();
          console.log('✅ Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
