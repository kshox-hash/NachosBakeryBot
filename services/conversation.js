/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const constants = require("./constants");
const GraphApi = require("./graph-api");
const Message = require("./message");
const Status = require("./status");
const Cache = require("./redis");

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

// Botón Funciones -> manda la plantilla aprobada generar_document
function sendFunctionsTemplateMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber
) {
  return GraphApi.messageWithUtilityTemplate(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    {
      templateName: "generar_document",
      locale: "es_ES",
      imageLink:
        "https://pub-9df4bc34eee249debc0d04d6df729879.r2.dev/avatar.png",
    }
  );
}

// Botón Chatbox
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

// Botón Contacto
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

async function markMessageForFollowUp(messageId) {
  await Cache.insert(messageId);
}

module.exports = class Conversation {
  constructor(phoneNumberId) {
    this.phoneNumberId = phoneNumberId;
  }

  static async handleMessage(senderPhoneNumberId, rawMessage) {
    const message = new Message(rawMessage);

    switch (message.type) {
      case constants.REPLY_FUNCTIONS_ID: {
        const response = await sendFunctionsTemplateMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );

        if (response?.messages?.[0]?.id) {
          await markMessageForFollowUp(response.messages[0].id);
        }
        break;
      }

      case constants.REPLY_CHATBOX_ID: {
        const response = await sendChatboxMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );

        if (response?.messages?.[0]?.id) {
          await markMessageForFollowUp(response.messages[0].id);
        }
        break;
      }

      case constants.REPLY_CONTACT_ID: {
        const response = await sendContactMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );

        if (response?.messages?.[0]?.id) {
          await markMessageForFollowUp(response.messages[0].id);
        }
        break;
      }

      default: {
        const response = await sendWelcomeMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber,
          constants.APP_DEFAULT_MESSAGE
        );

        if (response?.messages?.[0]?.id) {
          await markMessageForFollowUp(response.messages[0].id);
        }
        break;
      }
    }
  }

  static async handleStatus(senderPhoneNumberId, rawStatus) {
    const status = new Status(rawStatus);

    if (!(status.status === "delivered" || status.status === "read")) {
      return;
    }

    if (await Cache.remove(status.messageId)) {
      await sendWelcomeMessage(
        undefined,
        senderPhoneNumberId,
        status.recipientPhoneNumber,
        constants.APP_TRY_ANOTHER_MESSAGE
      );
    }
  }
};