require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const prisma = require('./lib/prisma');
const cloudinary = require('./config/cloudinary');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // One-time migration: auto-verify all existing unverified users
    // (OTP verification was removed — all users should be verified)
    const patched = await prisma.user.updateMany({
      where: { isVerified: false },
      data: { isVerified: true }
    });
    if (patched.count > 0) {
      console.log(`✅ Auto-verified ${patched.count} existing user(s)`);
    }

    // Validate Cloudinary credentials
    if (cloudinary.isConfigured()) {
      console.log('✅ Cloudinary configured — media uploads enabled');
    } else {
      console.warn('⚠️  Cloudinary NOT configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in environment. Profile and listing photo uploads will fall back to local disk (not persistent on Render).');
    }

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO with same CORS origins as HTTP
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
      'https://www.naijacars.online',
      'https://naijacars.online'
    ].filter(Boolean);

    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
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

      // Conversation IDs are built as the two participant UUIDs sorted and
      // joined with `_`. Split and match exactly — substring matching would
      // let user "ab" join a room `abcd_efgh` they don't belong to.
      const isConversationParticipant = (conversationId) => {
        if (typeof conversationId !== 'string') return false;
        const parts = conversationId.split('_');
        return parts.length === 2 && parts.includes(socket.userId);
      };

      socket.on('join-conversation', (conversationId) => {
        if (isConversationParticipant(conversationId)) {
          socket.join(conversationId);
        }
      });

      socket.on('leave-conversation', (conversationId) => {
        if (isConversationParticipant(conversationId)) {
          socket.leave(conversationId);
        }
      });

      // Typing indicator
      socket.on('typing', ({ conversationId, isTyping }) => {
        if (!isConversationParticipant(conversationId)) return;
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
