
const constants = require("../constants")
const MessageService = require("../service/message_service")
const Message = require("../message")
const Status = require("../status")


//helper
function getIncomingText(message) {
  return String(message?.text || "").trim();
}

module.exports = class  ConversationHandler {
  constructor(phoneNumberId) {
    this.phoneNumberId = phoneNumberId;
  }

  static async handleMessage(senderPhoneNumberId, rawMessage) {
    console.log("RAW MESSAGE =>");
    console.log(JSON.stringify(rawMessage, null, 2));

    const message = new Message(rawMessage);
    const incomingText = getIncomingText(message);
    const normalizedText = incomingText.toLowerCase();

    console.log("message.type =>", message.type);
    console.log("message.text =>", message.text);
    console.log("message.payload =>", message.payload);
    console.log("message.id =>", message.id);
    console.log("message.senderPhoneNumber =>", message.senderPhoneNumber);

    switch (message.type) {
      case constants.REPLY_FUNCTIONS_ID: {
        return MessageService.sendFunctionsTemplateMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );
      }

      case constants.REPLY_CHATBOX_ID: {
        return MessageService.sendChatboxMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );
      }

      case constants.REPLY_CONTACT_ID: {
        return MessageService.sendContactMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );
      }

      default: {
        if (normalizedText === "cotizar" || normalizedText === "quote_start") {
          return MessageService.sendQuoteRuntimeLinkMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber
          );
        }

        if (
          normalizedText === "chat soporte" ||
          normalizedText === "support_start"
        ) {
          return sendSupportMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber
          );
        }

        if (
          normalizedText === "toma de horas" ||
          normalizedText === "appointments_start"
        ) {
          return MessageService.sendAppointmentsMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber
          );
        }


        return MessageService.sendWelcomeMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber,
          constants.APP_DEFAULT_MESSAGE
        );
      }
    }
  }
//--
  static async handleStatus(senderPhoneNumberId, rawStatus) {
    const status = new Status(rawStatus);

    console.log("status recibido =>", status);

    if (!(status.status === "delivered" || status.status === "read")) {
      return;
    }

    return;
  }
};