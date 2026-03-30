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

// Botón Funciones -> manda la plantilla aprobada con header image
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
      templateName: "generar_documentos_pdf",
      locale: "es",
      imageLink:
        "https://pub-9df4bc34eee249debc0d04d6df729879.r2.dev/generate.png",
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

module.exports = class Conversation {
  constructor(phoneNumberId) {
    this.phoneNumberId = phoneNumberId;
  }

  static async handleMessage(senderPhoneNumberId, rawMessage) {
    const message = new Message(rawMessage);

    console.log("message.type =>", message.type);
    console.log("message.id =>", message.id);
    console.log("message.senderPhoneNumber =>", message.senderPhoneNumber);

    switch (message.type) {
      case constants.REPLY_FUNCTIONS_ID: {
        console.log("Entró a REPLY_FUNCTIONS_ID");

        const response = await sendFunctionsTemplateMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );

        console.log("response funciones =>", response);
        break;
      }

      case constants.REPLY_CHATBOX_ID: {
        console.log("Entró a REPLY_CHATBOX_ID");

        const response = await sendChatboxMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );

        console.log("response chatbox =>", response);
        break;
      }

      case constants.REPLY_CONTACT_ID: {
        console.log("Entró a REPLY_CONTACT_ID");

        const response = await sendContactMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber
        );

        console.log("response contacto =>", response);
        break;
      }

      default: {
        console.log("Entró a default");

        const response = await sendWelcomeMessage(
          message.id,
          senderPhoneNumberId,
          message.senderPhoneNumber,
          constants.APP_DEFAULT_MESSAGE
        );

        console.log("response bienvenida =>", response);
        break;
      }
    }
  }

  static async handleStatus(senderPhoneNumberId, rawStatus) {
    const status = new Status(rawStatus);

    console.log("status recibido =>", status);

    if (!(status.status === "delivered" || status.status === "read")) {
      return;
    }

    return;
  }
};