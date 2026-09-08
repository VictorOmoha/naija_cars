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
    body('receiverId').isString().bail().notEmpty().isLength({ max: 128 }).withMessage('Receiver ID is required'),
    body('messageText').isString().bail().trim().isLength({ min: 1, max: 5000 }).withMessage('Messages must contain between 1 and 5,000 characters'),
    body('listingId').optional().isString().bail().notEmpty().isLength({ max: 128 })
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
        io.to(receiverId).to(req.user.id).to(message.conversationId).emit('new-message', {
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
router.put('/:conversationId/read', authenticate, [
  body('messageIds').optional().isArray({ min: 1, max: 100 }),
  body('messageIds.*').isString().bail().notEmpty().isLength({ max: 128 }),
], async (req, res, next) => {
  try {
    if (!validationResult(req).isEmpty()) return res.status(400).json({ success: false, error: { message: 'Invalid message IDs' } });
    const result = await messageService.markMessagesAsRead(req.params.conversationId, req.user.id, req.body?.messageIds);
    const io = req.app.get('io');
    if (io && result.count) {
      io.to(result.participants).to(req.params.conversationId).emit('messages-read', {
        conversationId: req.params.conversationId, readerId: req.user.id,
      });
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
