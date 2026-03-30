"use strict";

const axios = require("axios");
require("dotenv").config({ path: "../.env" });

async function createCarouselTemplate() {
  const url = `https://graph.facebook.com/v23.0/${process.env.WABA_ID}/message_templates`;

  // IMPORTANTE:
  // CAROUSEL_HEADER_HANDLE debe ser un asset handle de Meta,
  // no una URL pública. Ejemplo: "4::aBcDeFg..."
  const headerHandle = process.env.CAROUSEL_HEADER_HANDLE;

  if (!process.env.ACCESS_TOKEN) {
    throw new Error("Falta ACCESS_TOKEN en ../.env");
  }

  if (!process.env.WABA_ID) {
    throw new Error("Falta WABA_ID en ../.env");
  }

  if (!headerHandle) {
    throw new Error(
      "Falta CAROUSEL_HEADER_HANDLE en ../.env. Debe ser un asset handle de Meta, no una URL."
    );
  }

  const payload = {
    name: "automatiza_carousel_test",
    language: "es_ES",
    category: "MARKETING",
    components: [
      {
        type: "BODY",
        text: "Vista previa de funciones de Automatiza Fácil",
      },
      {
        type: "CAROUSEL",
        cards: [
          {
            components: [
              {
                type: "HEADER",
                format: "IMAGE",
                example: {
                  header_handle: [headerHandle],
                },
              },
              {
                type: "BODY",
                text: "Chatbot para responder automáticamente a tus clientes",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "QUICK_REPLY",
                    text: "Ver chatbot",
                  },
                ],
              },
            ],
          },
          {
            components: [
              {
                type: "HEADER",
                format: "IMAGE",
                example: {
                  header_handle: [headerHandle],
                },
              },
              {
                type: "BODY",
                text: "Cotizaciones automáticas en PDF por WhatsApp",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "QUICK_REPLY",
                    text: "Ver cotización",
                  },
                ],
              },
            ],
          },
          {
            components: [
              {
                type: "HEADER",
                format: "IMAGE",
                example: {
                  header_handle: [headerHandle],
                },
              },
              {
                type: "BODY",
                text: "Toma de horas y reservas automáticas",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "QUICK_REPLY",
                    text: "Ver reservas",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Template creado:", response.data);
  } catch (error) {
    console.error(
      "Error creando template:",
      error.response?.data || error.message
    );
  }
}

createCarouselTemplate();