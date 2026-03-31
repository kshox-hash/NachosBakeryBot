/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const crypto = require('crypto');

const { urlencoded, json } = require('body-parser');
require('dotenv').config();
const express = require('express');

const config = require('./services/config');
const Conversation = require('./services/conversation');
const Message = require('./services/message');
const app = express();

// Parse application/x-www-form-urlencoded
app.use(
  urlencoded({
    extended: true
  })
);

// Parse application/json. Verify that callback came from Facebook
app.use(json({ verify: verifyRequestSignature }));

// Handle webhook verification handshake
app.get("/webhook", function (req, res) {
  if (
    req.query["hub.mode"] != "subscribe" ||
    req.query["hub.verify_token"] != config.verifyToken
  ) {
    res.sendStatus(403);
    return;
  }

  res.send(req.query["hub.challenge"]);
});

// Handle incoming messages
app.post('/webhook', (req, res) => {
  console.log(req.body);

  if (req.body.object === "whatsapp_business_account") {
    req.body.entry.forEach(entry => {
      entry.changes.forEach(change => {
        const value = change.value;
        if (value) {
          const senderPhoneNumberId = value.metadata.phone_number_id;

          if (value.statuses) {
            value.statuses.forEach(status => {
              // Handle message status updates
              Conversation.handleStatus(senderPhoneNumberId, status);
            });
          }

          if (value.messages) {
            value.messages.forEach(rawMessage => {
              // Respond to message
              Conversation.handleMessage(senderPhoneNumberId, rawMessage);
            });
          }
        }
      });
    });
  }

  res.status(200).send('EVENT_RECEIVED');
});

// Default route for health check
app.get('/', (req, res) => {
  res.json({
    message: 'Chumingo\'s Bakery Server is running',
    endpoints: [
      'POST /webhook - WhatsApp webhook endpoint'
    ]
  });
});

// Check if all environment variables are set
config.checkEnvVariables();

// Verify that the callback came from Facebook.
function verifyRequestSignature(req, res, buf) {
  let signature = req.headers["x-hub-signature-256"];

  if (!signature) {
    console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
  } else {
    let elements = signature.split("=");
    let signatureHash = elements[1];
    let expectedHash = crypto
      .createHmac("sha256", config.appSecret)
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

function createRuntimeRecord(config, expiresInMinutes = 15) {
  const token = generateToken();
  const now = Date.now();

  const record = {
    token,
    config,
    createdAt: now,
    expiresAt: now + expiresInMinutes * 60 * 1000,
    status: "active",
    submissions: [],
  };

  runtimeLinks.set(token, record);
  return record;
}

function buildCotizadorConfig(leadId) {
  return {
    brand: "Automatiza Fácil",
    title: "Cotización Inteligente",
    subtitle: "Selecciona productos y envía tu solicitud.",
    successMessage: "Solicitud enviada correctamente.",
    components: [
      {
        type: "products",
        items: [
          {
            id: "p1",
            name: "Bot de Cotización",
            price: 120000,
            description: "Automatiza cotizaciones por chat y genera propuestas.",
          },
          {
            id: "p2",
            name: "Generación de PDF",
            price: 60000,
            description: "Crea cotizaciones en PDF listas para enviar.",
          },
          {
            id: "p3",
            name: "Integración WhatsApp",
            price: 80000,
            description: "Conecta el flujo de cotización con WhatsApp.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: Juan Pérez",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: juan@correo.com",
          },
          {
            name: "phone",
            label: "Teléfono",
            inputType: "tel",
            required: false,
            placeholder: "Ej: +56 9 1234 5678",
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: `Lead: ${leadId}`,
          },
        ],
      },
      {
        type: "button",
        label: "Enviar Cotización",
        action: { type: "submit" },
      },
    ],
  };
}

function buildReservasConfig(leadId) {
  return {
    brand: "Automatiza Fácil",
    title: "Toma de Horas",
    subtitle: "Prueba una experiencia de reservas por WhatsApp.",
    successMessage: "Solicitud enviada correctamente.",
    components: [
      {
        type: "products",
        items: [
          {
            id: "r1",
            name: "Agenda Básica",
            price: 90000,
            description: "Sistema de reservas para tomar horas.",
          },
          {
            id: "r2",
            name: "Recordatorios",
            price: 40000,
            description: "Reduce inasistencias con recordatorios automáticos.",
          },
          {
            id: "r3",
            name: "Reservas por WhatsApp",
            price: 70000,
            description: "Tus clientes reservan directamente desde el chat.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: María González",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: maria@correo.com",
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: `Lead: ${leadId}`,
          },
        ],
      },
      {
        type: "button",
        label: "Solicitar Demo",
        action: { type: "submit" },
      },
    ],
  };
}

function buildChatbotConfig(leadId) {
  return {
    brand: "Automatiza Fácil",
    title: "Chatbot Inteligente",
    subtitle: "Descubre cómo automatizar respuestas y atención.",
    successMessage: "Solicitud enviada correctamente.",
    components: [
      {
        type: "products",
        items: [
          {
            id: "c1",
            name: "Chatbot Base",
            price: 100000,
            description: "Responde consultas frecuentes automáticamente.",
          },
          {
            id: "c2",
            name: "Captura de Leads",
            price: 50000,
            description: "Recoge datos de clientes dentro del chat.",
          },
          {
            id: "c3",
            name: "Soporte Automatizado",
            price: 85000,
            description: "Ordena consultas y mejora la atención.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: Pedro Soto",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: pedro@correo.com",
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: `Lead: ${leadId}`,
          },
        ],
      },
      {
        type: "button",
        label: "Solicitar Información",
        action: { type: "submit" },
      },
    ],
  };
}

app.get("/open/cotizador/:leadId", (req, res) => {
  const { leadId } = req.params;
  const record = createRuntimeRecord(buildCotizadorConfig(leadId), 15);
  return res.redirect(`/v/${record.token}`);
});

app.get("/open/reservas/:leadId", (req, res) => {
  const { leadId } = req.params;
  const record = createRuntimeRecord(buildReservasConfig(leadId), 15);
  return res.redirect(`/v/${record.token}`);
});

app.get("/open/chatbot/:leadId", (req, res) => {
  const { leadId } = req.params;
  const record = createRuntimeRecord(buildChatbotConfig(leadId), 15);
  return res.redirect(`/v/${record.token}`);
});

var listener = app.listen(config.port, () => {
  console.log(`The app is listening on port ${listener.address().port}`);
});
