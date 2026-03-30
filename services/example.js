require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const ACCESS_TOKEN = "EAANZAZBf2B3EgBQ5wZBHCKMZBirpM2IKqm9ToobnV4MXhBzx7qd45PY1QRIITXQ0E3fUYZA98pZAAzLZCdanijOIqCLZB3haEEVEpOEEuW2c8vHVDOfDZCOmNoezNLjNB2vshDzi6JUfxEktzdhY6O2pw2lbUKeqVN2IVjbmBorDakPhh3fplIJjZBH1z9fws4EAZDZD";
const APP_ID = 943355165006920;   // no WABA_ID
const WABA_ID = 972355185253738;

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

  const res = await axios.post(
    url,
    null,
    {
      headers: {
        Authorization: `OAuth ${ACCESS_TOKEN}`,
      },
    }
  );

  return res.data.id; // upload:<id>
}

async function uploadFileAndGetHandle(uploadId, filePath) {
  const fileBuffer = fs.readFileSync(filePath);

  const res = await axios.post(
    `https://graph.facebook.com/v23.0/${uploadId}`,
    fileBuffer,
    {
      headers: {
        Authorization: `OAuth ${ACCESS_TOKEN}`,
        offset: "0",
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: Infinity,
    }
  );

  if (!res.data?.h) {
    throw new Error(`No llegó media handle. Respuesta: ${JSON.stringify(res.data)}`);
  }

  return res.data.h;
}

async function createCarouselTemplate(headerHandle) {
  const payload = {
    name: "automatiza_carousel",
    language: "es",
    category: "MARKETING",
    components: [
      {
        type: "BODY",
        text: "Conoce algunas funciones de Automatiza Fácil",
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
                text: "Automatiza respuestas y atención al cliente 24/7",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Ver más",
                    url: "https://automatizafacil.cl/chatbot",
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
                text: "Envía cotizaciones automáticas en PDF por WhatsApp",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Cotizaciones",
                    url: "https://automatizafacil.cl/cotizaciones",
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
                text: "Gestiona reservas y toma de horas automáticamente",
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: "Reservas",
                    url: "https://automatizafacil.cl/reservas",
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