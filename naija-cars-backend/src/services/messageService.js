const prisma = require('../lib/prisma');

class MessageService {
  /**
   * Get or create conversation between two users
   */
  async getOrCreateConversation(user1Id, user2Id) {
    // Generate consistent conversation ID
    const conversationId = [user1Id, user2Id].sort().join('_');
    return conversationId;
  }

  /**
   * Send a message
   */
  async sendMessage({ senderId, receiverId, listingId, messageText }) {
    if (senderId === receiverId) {
      const error = new Error('You cannot send a message to yourself');
      error.status = 400;
      throw error;
    }

    const receiver = await prisma.user.findFirst({
      where: {
        id: receiverId,
        isActive: true
      },
      select: { id: true }
    });

    if (!receiver) {
      const error = new Error('Message recipient was not found');
      error.status = 404;
      throw error;
    }

    if (listingId) {
      const listing = await prisma.carListing.findFirst({
        where: {
          id: listingId,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          sellerId: true
        }
      });

      if (!listing) {
        const error = new Error('Listing was not found');
        error.status = 404;
        throw error;
      }

      if (listing.sellerId !== receiverId) {
        const error = new Error('This listing does not belong to the selected seller');
        error.status = 400;
        throw error;
      }
    }

    const conversationId = await this.getOrCreateConversation(senderId, receiverId);

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        listingId,
        messageText
      },
      include: {
        sender: {
          include: {
            profile: true
          }
        },
        receiver: {
          include: {
            profile: true
          }
        },
        listing: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            price: true,
            media: {
              orderBy: { displayOrder: 'asc' },
              take: 1
            }
          }
        }
      }
    });

    return message;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId) {
    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          include: {
            profile: true
          }
        },
        receiver: {
          include: {
            profile: true
          }
        },
        listing: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            media: {
              orderBy: { displayOrder: 'asc' },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by conversation
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const conversationId = message.conversationId;

      if (!conversationsMap.has(conversationId)) {
        // Determine the other user
        const otherUser = message.senderId === userId ? message.receiver : message.sender;

        conversationsMap.set(conversationId, {
          conversationId,
          otherUser: {
            id: otherUser.id,
            email: otherUser.email,
            profile: otherUser.profile
          },
          listing: message.listing,
          lastMessage: message,
          unreadCount: 0
        });
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        const conversation = conversationsMap.get(conversationId);
        conversation.unreadCount++;
      }
    });

    return Array.from(conversationsMap.values());
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    // Extract user IDs from conversation ID
    const [user1Id, user2Id] = conversationId.split('_');

    // Verify user is part of conversation
    if (userId !== user1Id && userId !== user2Id) {
      throw new Error('Unauthorized access to conversation');
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            include: {
              profile: true
            }
          },
          listing: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              media: {
                orderBy: { displayOrder: 'asc' },
                take: 1
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({
        where: { conversationId }
      })
    ]);

    return {
      messages: messages.reverse(), // Oldest first
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId, userId) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return { message: 'Messages marked as read' };
  }

  /**
   * Get quick reply templates
   */
  getQuickReplyTemplates() {
    return [
      'Is this still available?',
      'What\'s your best price?',
      'Can I schedule a test drive?',
      'Is the price negotiable?',
      'Where is the car located?',
      'Can you provide more photos?',
      'What\'s the condition of the car?',
      'Has this been in any accidents?'
    ];
  }

  /**
   * Check message for fraud keywords
   */
  checkForFraud(messageText) {
    const fraudKeywords = [
      'western union',
      'moneygram',
      'bitcoin',
      'cryptocurrency',
      'wire transfer',
      'gift card',
      'paypal',
      'cash app',
      'venmo',
      'upfront payment',
      'deposit first',
      'send money',
      'advanced fee'
    ];

    const lowerText = messageText.toLowerCase();
    const foundKeywords = fraudKeywords.filter(keyword => lowerText.includes(keyword));

    if (foundKeywords.length > 0) {
      return {
        isSuspicious: true,
        keywords: foundKeywords,
        warning: '⚠️ Warning: This message contains terms commonly used in scams. Never send money or personal information to unverified users.'
      };
    }

    return { isSuspicious: false };
  }
}

module.exports = new MessageService();
