require("dotenv").config();
const axios = require("axios");

async function createCarouselTemplate() {
  const WABA_ID = "972355185253738";
  const ACCESS_TOKEN = "EAANZAZBf2B3EgBQ5wZBHCKMZBirpM2IKqm9ToobnV4MXhBzx7qd45PY1QRIITXQ0E3fUYZA98pZAAzLZCdanijOIqCLZB3haEEVEpOEEuW2c8vHVDOfDZCOmNoezNLjNB2vshDzi6JUfxEktzdhY6O2pw2lbUKeqVN2IVjbmBorDakPhh3fplIJjZBH1z9fws4EAZDZD";

  // Este NO es el media id de /media.
  // Debe ser el asset handle generado con Resumable Upload API.
  const HEADER_HANDLE = "1961077764781619";

  const payload = {
    name: "automatiza_carousel",
    language: "es",
    category: "MARKETING",
    components: [
      {
        type: "BODY",
        text: "Conoce algunas funciones de Automatiza Fácil"
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
                  header_handle: [HEADER_HANDLE]
                }
              },
              {
                type: "BODY",
                text: "Automatiza respuestas y atención al cliente 24/7"
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Ver más",
                    url: "https://automatizafacil.cl/chatbot"
                  }
                ]
              }
            ]
          },
          {
            components: [
              {
                type: "HEADER",
                format: "IMAGE",
                example: {
                  header_handle: [HEADER_HANDLE]
                }
              },
              {
                type: "BODY",
                text: "Envía cotizaciones automáticas en PDF por WhatsApp"
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Cotizaciones",
                    url: "https://automatizafacil.cl/cotizaciones"
                  }
                ]
              }
            ]
          },
          {
            components: [
              {
                type: "HEADER",
                format: "IMAGE",
                example: {
                  header_handle: [HEADER_HANDLE]
                }
              },
              {
                type: "BODY",
                text: "Gestiona reservas y toma de horas automáticamente"
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Reservas",
                    url: "https://automatizafacil.cl/reservas"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const res = await axios.post(
    `https://graph.facebook.com/v23.0/${WABA_ID}/message_templates`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  console.log("Template creada:", JSON.stringify(res.data, null, 2));
}

createCarouselTemplate().catch((err) => {
  console.error(
    "Error creando plantilla:",
    JSON.stringify(err.response?.data || err.message, null, 2)
  );
});