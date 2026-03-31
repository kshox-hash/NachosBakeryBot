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
const QuoteFlow = require("./quote-flow");

const RUNTIME_UI_BASE_URL =
  process.env.RUNTIME_UI_BASE_URL || "http://localhost:3000";

// MENSAJE DE BIENVENIDA
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

// FUNCIONES -> CARRUSEL
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

// CHATBOX
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

// CONTACTO
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

// NUEVO: LINK AL COTIZADOR
function sendQuoteRuntimeLinkMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber
) {
  const safeRecipient = String(recipientPhoneNumber || "").replace(/\D/g, "");
  const url = `${RUNTIME_UI_BASE_URL}/open/cotizador/${safeRecipient}`;

  return GraphApi.sendTextMessage(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    `Perfecto. Abre este enlace para hacer tu cotización:\n${url}`
  );
}

// QUOTE FLOW
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

// OTROS FLUJOS
function sendSupportMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber
) {
  return GraphApi.sendTextMessage(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    "Chat soporte: este módulo permite responder clientes, ordenar consultas y mejorar la atención por WhatsApp. Si quieres, te muestro precio, funciones o una propuesta para tu negocio."
  );
}

function sendAppointmentsMessage(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber
) {
  return GraphApi.sendTextMessage(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    "Toma de horas: este módulo permite reservar citas, agendar servicios y ordenar disponibilidad por WhatsApp. Si quieres, te muestro una propuesta o un precio estimado."
  );
}

function getIncomingText(message) {
  return String(message?.text || "").trim();
}

module.exports = class Conversation {
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
        if (normalizedText === "cotizar" || normalizedText === "quote_start") {
          return sendQuoteRuntimeLinkMessage(
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
          return sendAppointmentsMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber
          );
        }

        if (QuoteFlow.isQuoteSelection(normalizedText)) {
          return sendQuoteSummaryMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber,
            normalizedText
          );
        }

        if (QuoteFlow.isBusinessRecommendationIntent(normalizedText)) {
          return sendBusinessRecommendationMessage(
            message.id,
            senderPhoneNumberId,
            message.senderPhoneNumber,
            normalizedText
          );
        }

        if (QuoteFlow.isQuoteIntent(normalizedText)) {
          return sendQuoteRuntimeLinkMessage(
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

    console.log("status recibido =>", status);

    if (!(status.status === "delivered" || status.status === "read")) {
      return;
    }

    return;
  }
};