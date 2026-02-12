const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const messageService = require('../services/messageService');

const router = express.Router();

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const conversations = await messageService.getUserConversations(req.user.id);

    res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/messages/templates/quick-replies
 * @desc    Get quick reply templates
 * @access  Public
 */
router.get('/templates/quick-replies', (req, res) => {
  const templates = messageService.getQuickReplyTemplates();

  res.json({
    success: true,
    data: { templates }
  });
});

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get messages for a conversation
 * @access  Private
 */
router.get('/:conversationId', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const result = await messageService.getConversationMessages(
      req.params.conversationId,
      req.user.id,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/',
  authenticate,
  [
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('messageText').trim().notEmpty().withMessage('Message cannot be empty'),
    body('listingId').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }

      const { receiverId, messageText, listingId } = req.body;

      // Check for fraud
      const fraudCheck = messageService.checkForFraud(messageText);

      const message = await messageService.sendMessage({
        senderId: req.user.id,
        receiverId,
        listingId,
        messageText
      });

      // Emit socket event for real-time delivery
      const io = req.app.get('io');
      if (io) {
        io.to(receiverId).emit('new-message', {
          message,
          fraudWarning: fraudCheck.isSuspicious ? fraudCheck.warning : null
        });
      }

      res.status(201).json({
        success: true,
        data: {
          message,
          fraudWarning: fraudCheck.isSuspicious ? fraudCheck.warning : null
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/messages/:conversationId/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.put('/:conversationId/read', authenticate, async (req, res, next) => {
  try {
    await messageService.markMessagesAsRead(req.params.conversationId, req.user.id);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
