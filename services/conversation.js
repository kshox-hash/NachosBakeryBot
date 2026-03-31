"use strict";

const constants = require("./constants");
const GraphApi = require("./graph-api");
const Message = require("./message");
const Status = require("./status");
const QuoteFlow = require("./quote_flow");

// Mensaje de bienvenida con 3 botones
function sendWelcomeMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber,
  messageBody
) {
  return GraphApi.messageWithInteractiveReply(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    messageBody,
    [
      {
        id: constants.REPLY_CHATBOX_ID,
        title: constants.REPLY_CHATBOX_CTA,
      },
      {
        id: constants.REPLY_FUNCTIONS_ID,
        title: constants.REPLY_FUNCTIONS_CTA,
      },
      {
        id: constants.REPLY_CONTACT_ID,
        title: constants.REPLY_CONTACT_CTA,
      },
    ]
  );
}

function sendFunctionsTemplateMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber
) {
  return GraphApi.sendCarouselTemplate(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber
  );
}

function sendChatboxMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber
) {
  return GraphApi.messageWithInteractiveReply(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    constants.APP_CHATBOX_MESSAGE,
    [
      {
        id: constants.REPLY_FUNCTIONS_ID,
        title: constants.REPLY_FUNCTIONS_CTA,
      },
      {
        id: constants.REPLY_CONTACT_ID,
        title: constants.REPLY_CONTACT_CTA,
      },
    ]
  );
}

function sendContactMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber
) {
  return GraphApi.messageWithInteractiveReply(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    constants.APP_CONTACT_MESSAGE,
    [
      {
        id: constants.REPLY_CHATBOX_ID,
        title: constants.REPLY_CHATBOX_CTA,
      },
      {
        id: constants.REPLY_FUNCTIONS_ID,
        title: constants.REPLY_FUNCTIONS_CTA,
      },
    ]
  );
}

function sendQuoteCatalogMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber
) {
  return GraphApi.sendTextMessage(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    QuoteFlow.getQuoteCatalogText()
  );
}

function sendQuoteSummaryMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber,
  userText
) {
  return GraphApi.sendTextMessage(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    QuoteFlow.buildQuoteSummary(userText)
  );
}

function sendBusinessRecommendationMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber,
  userText
) {
  const suggestion = QuoteFlow.suggestModulesByBusiness(userText);

  if (!suggestion) {
    return GraphApi.sendTextMessage(
      messageId,
      senderPhoneNumberId,
      recipientPhoneNumber,
      "Cuéntame tu rubro y te recomiendo un pack. Ejemplo: panadería, barbería, clínica o tienda."
    );
  }

  return GraphApi.sendTextMessage(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    suggestion
  );
}

module.exports = class Conversation {
  constructor(phoneNumberId) {
    this.phoneNumberId = phoneNumberId;
  }

  static async handleMessage(senderPhoneNumberId, rawMessage) {
    const message = new Message(rawMessage);

    console.log("message.type =>", message.type);
    console.log("message.text =>", message.text);
    console.log("message.id =>", message.id);
    console.log("message.senderPhoneNumber =>", message.senderPhoneNumber);

    switch (message.type) {
      case "quote_start": {
        return sendQuoteCatalogMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );
      }

      case constants.REPLY_FUNCTIONS_ID: {
        return sendFunctionsTemplateMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );
      }

      case constants.REPLY_CHATBOX_ID: {
        return sendChatboxMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );
      }

      case constants.REPLY_CONTACT_ID: {
        return sendContactMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );
      }

      default: {
        if (QuoteFlow.isQuoteSelection(message.text)) {
          return sendQuoteSummaryMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber,
            message.text
          );
        }

        if (QuoteFlow.isBusinessRecommendationIntent(message.text)) {
          return sendBusinessRecommendationMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber,
            message.text
          );
        }

        if (QuoteFlow.isQuoteIntent(message.text)) {
          return sendQuoteCatalogMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber
          );
        }

        return sendWelcomeMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber,
          constants.APP_DEFAULT_MESSAGE
        );
      }
    }
  }

  static async handleStatus(senderPhoneNumberId, rawStatus) {
    const status = new Status(rawStatus);

    if (!(status.status === "delivered" || status.status === "read")) {
      return;
    }

    return;
  }
};