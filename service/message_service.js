const GraphApi = require("../graph/graph_api");

const RUNTIME_UI_BASE_URL =
  process.env.RUNTIME_UI_BASE_URL || "http://localhost:3000";

module.exports = class MessageService {
    constructor(){}

    
// MENSAJE DE BIENVENIDA
 static sendWelcomeMessage(
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
static sendFunctionsTemplateMessage(
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
static sendChatboxMessage(
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
static sendContactMessage(
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
static sendQuoteRuntimeLinkMessage(
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


// OTROS FLUJOS
static sendSupportMessage(
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

static sendAppointmentsMessage(
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

}