const express = require("express");
const router = express.Router();

const {
   webhookVerificationController,
   webhookIncomingMessagesController,
   healthCheckController
      
 } = require("../controller/conversation_controller");

// Handle webhook verification handshake
router.get("/webhook", webhookVerificationController);

// Handle incoming messages
router.post('/webhook', webhookIncomingMessagesController);

// Default route for health check
router.get('/', healthCheckController);

module.exports = router;