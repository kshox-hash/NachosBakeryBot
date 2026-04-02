require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const ACCESS_TOKEN = "EAANZAZBf2B3EgBQ5wZBHCKMZBirpM2IKqm9ToobnV4MXhBzx7qd45PY1QRIITXQ0E3fUYZA98pZAAzLZCdanijOIqCLZB3haEEVEpOEEuW2c8vHVDOfDZCOmNoezNLjNB2vshDzi6JUfxEktzdhY6O2pw2lbUKeqVN2IVjbmBorDakPhh3fplIJjZBH1z9fws4EAZDZD";
const APP_ID = 943355165006920;
const WABA_ID = 972355185253738;
const PUBLIC_BASE_URL = "https://runtimegenerateui.onrender.com"

async function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

async function createUploadSession(filePath) {
  const fileName = path.basename(filePath);
  const fileLength = await getFileSize(filePath);

  const url =
    `https://graph.facebook.com/v23.0/${APP_ID}/uploads` +
    `?file_name=${encodeURIComponent(fileName)}` +
    `&file_length=${fileLength}` +
    `&file_type=image/png`;

  const res = await axios.post(url, null, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  return res.data.id;
}

async function uploadFileAndGetHandle(uploadId, filePath) {
  const fileBuffer = fs.readFileSync(filePath);

  const res = await axios.post(
    `https://graph.facebook.com/v23.0/${uploadId}`,
    fileBuffer,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        offset: "0",
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: Infinity,
    }
  );

  if (!res.data?.h) {
    throw new Error(
      `No llegó media handle. Respuesta: ${JSON.stringify(res.data)}`
    );
  }

  return res.data.h;
}

async function createCarouselTemplate(headerHandle) {
  if (!ACCESS_TOKEN) throw new Error("Falta ACCESS_TOKEN en .env");
  if (!APP_ID) throw new Error("Falta APP_ID en .env");
  if (!WABA_ID) throw new Error("Falta WABA_ID en .env");
  if (!PUBLIC_BASE_URL) throw new Error("Falta PUBLIC_BASE_URL en .env");

  const payload = {
    name: "automatiza_carousel_v3",
    language: "es",
    category: "MARKETING",
    components: [
      {
        type: "BODY",
        text: "Elige el módulo que quieres probar en Automatiza Fácil",
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
                text: "Genera cotizaciones y PDFs automáticamente desde el chat. Ahora prueba una cotización interactiva.",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Cotizar",
                    url: `${PUBLIC_BASE_URL}/open/cotizador/{{1}}`,
                    example: ["lead-demo-001"],
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
                text: "Automatiza la toma de horas y reservas por WhatsApp para que tus clientes agenden fácil y rápido.",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Tomar hora",
                    url: `${PUBLIC_BASE_URL}/open/reservas/{{1}}`,
                    example: ["lead-demo-002"],
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
                text: "Activa un chatbot para responder consultas, ordenar conversaciones y atender clientes automáticamente.",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Ver chatbot",
                    url: `${PUBLIC_BASE_URL}/open/chatbot/{{1}}`,
                    example: ["lead-demo-003"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await axios.post(
    `https://graph.facebook.com/v23.0/${WABA_ID}/message_templates`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

(async () => {
  try {
    const filePath = path.join(__dirname, "generatefix.png");

    const uploadId = await createUploadSession(filePath);
    console.log("uploadId:", uploadId);

    const headerHandle = await uploadFileAndGetHandle(uploadId, filePath);
    console.log("headerHandle:", headerHandle);

    const template = await createCarouselTemplate(headerHandle);
    console.log("template creada:", JSON.stringify(template, null, 2));
  } catch (err) {
    console.error(
      "Error:",
      JSON.stringify(err.response?.data || err.message || err, null, 2)
    );
  }
})();