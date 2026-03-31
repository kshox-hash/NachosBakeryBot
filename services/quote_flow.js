"use strict";

/**
 * Flujo simple de cotización por módulos para WhatsApp.
 *
 * Idea:
 * 1) El usuario presiona "Cotizar"
 * 2) El bot envía el mensaje inicial con los módulos disponibles
 * 3) El usuario responde con números separados por coma, por ejemplo: 1,3,5
 * 4) Este archivo interpreta la selección y arma una cotización textual
 *
 * No depende de base de datos.
 * Puedes conectarlo después a tu Conversation / GraphApi.
 */

const QUOTE_MODULES = Object.freeze([
  {
    code: "chatbot_base",
    index: 1,
    name: "Chatbot base",
    price: 49000,
    description: "Respuestas automáticas por WhatsApp con menú inicial y atención básica.",
  },
  {
    code: "cotizaciones_pdf",
    index: 2,
    name: "Cotizaciones PDF",
    price: 69000,
    description: "Generación y envío automático de cotizaciones en PDF por WhatsApp.",
  },
  {
    code: "reservas_horas",
    index: 3,
    name: "Reservas y agenda",
    price: 59000,
    description: "Toma automática de reservas, horas o solicitudes de atención.",
  },
  {
    code: "faq_negocio",
    index: 4,
    name: "Preguntas frecuentes",
    price: 29000,
    description: "Respuestas automáticas para horarios, ubicación, servicios y precios base.",
  },
  {
    code: "captura_leads",
    index: 5,
    name: "Captura de clientes",
    price: 39000,
    description: "Guarda nombre, teléfono y necesidad del cliente para seguimiento.",
  },
  {
    code: "seguimiento",
    index: 6,
    name: "Seguimiento automático",
    price: 35000,
    description: "Mensajes automáticos para retomar conversaciones o recordar cotizaciones.",
  },
  {
    code: "personalizado",
    index: 7,
    name: "Módulo personalizado",
    price: 99000,
    description: "Desarrollo de un flujo especial según el negocio del cliente.",
  },
]);

const QUOTE_TEXTS = Object.freeze({
  welcome:
    "¡Perfecto! Aquí puedes cotizar módulos reales de Automatiza Fácil. Responde con los números de los módulos que te interesan separados por coma. Ejemplo: 1,2,5",
  footer:
    "Si quieres, también puedes escribir tu rubro (por ejemplo: panadería, barbería, clínica, delivery) y te recomendamos una combinación.",
  invalid:
    "No pude reconocer tu selección. Responde con números separados por coma, por ejemplo: 1,3 o 2,4,5",
  empty:
    "No seleccionaste módulos válidos todavía. Intenta con algo como: 1,2",
  closing:
    "Si te interesa, el siguiente paso es decirme tu rubro y te preparo una propuesta más precisa.",
});

function formatCLP(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getQuoteCatalogText() {
  const lines = QUOTE_MODULES.map((module) => {
    return `${module.index}. ${module.name} — ${formatCLP(module.price)}\n${module.description}`;
  });

  return [QUOTE_TEXTS.welcome, "", ...lines, "", QUOTE_TEXTS.footer].join("\n");
}

function extractNumbers(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const matches = text.match(/\d+/g);
  if (!matches) {
    return [];
  }

  return matches
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
}

function getModulesByIndexes(indexes) {
  const uniqueIndexes = [...new Set(indexes)];

  return uniqueIndexes
    .map((index) => QUOTE_MODULES.find((module) => module.index === index))
    .filter(Boolean);
}

function parseQuoteSelection(text) {
  const indexes = extractNumbers(text);
  const modules = getModulesByIndexes(indexes);

  return {
    indexes,
    modules,
    isValid: modules.length > 0,
  };
}

function calculateQuoteTotals(modules) {
  const subtotal = modules.reduce((acc, module) => acc + module.price, 0);

  let discount = 0;

  if (modules.length >= 3) {
    discount = Math.round(subtotal * 0.1);
  }

  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
  };
}

function buildQuoteSummary(text) {
  const parsed = parseQuoteSelection(text);

  if (!parsed.isValid) {
    return QUOTE_TEXTS.invalid;
  }

  const totals = calculateQuoteTotals(parsed.modules);

  const selectedLines = parsed.modules.map((module) => {
    return `• ${module.name}: ${formatCLP(module.price)}`;
  });

  const discountLine =
    totals.discount > 0
      ? `Descuento por 3 o más módulos: -${formatCLP(totals.discount)}`
      : "Descuento por pack: no aplica";

  return [
    "Esta sería tu cotización estimada:",
    "",
    ...selectedLines,
    "",
    `Subtotal: ${formatCLP(totals.subtotal)}`,
    discountLine,
    `Total estimado: ${formatCLP(totals.total)}`,
    "",
    QUOTE_TEXTS.closing,
  ].join("\n");
}

function suggestModulesByBusiness(text) {
  const normalized = String(text || "").toLowerCase();

  if (!normalized.trim()) {
    return null;
  }

  const rules = [
    {
      keywords: ["panader", "pasteler", "cafeter", "comida", "delivery", "restaurant", "restaurante"],
      indexes: [1, 2, 5, 6],
      reason: "Para ventas, cotizaciones rápidas y seguimiento a clientes interesados.",
    },
    {
      keywords: ["barber", "peluquer", "salon", "salón", "spa", "estetica", "estética"],
      indexes: [1, 3, 4, 6],
      reason: "Para agendar horas, responder dudas comunes y confirmar clientes.",
    },
    {
      keywords: ["clinica", "clínica", "consulta", "dent", "medic", "kinesi", "psicolog"],
      indexes: [1, 3, 4, 5],
      reason: "Para organizar reservas, preguntas frecuentes y captura de datos previos.",
    },
    {
      keywords: ["tienda", "ropa", "ecommerce", "ferreter", "retail", "negocio"],
      indexes: [1, 2, 4, 5, 6],
      reason: "Para atención automática, cotización, seguimiento y cierre de clientes.",
    },
  ];

  const matchedRule = rules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (!matchedRule) {
    return null;
  }

  const modules = getModulesByIndexes(matchedRule.indexes);
  const totals = calculateQuoteTotals(modules);

  const lines = modules.map((module) => `• ${module.name}: ${formatCLP(module.price)}`);

  return [
    "Te recomiendo este pack para tu negocio:",
    "",
    ...lines,
    "",
    `Motivo: ${matchedRule.reason}`,
    `Total estimado del pack: ${formatCLP(totals.total)}`,
    "",
    "Si quieres esta opción, responde: QUIERO ESE PACK",
  ].join("\n");
}

function isQuoteIntent(text) {
  const normalized = String(text || "").toLowerCase();

  return [
    "cotizar",
    "cotizacion",
    "cotización",
    "precio",
    "precios",
    "modulos",
    "módulos",
    "planes",
  ].some((word) => normalized.includes(word));
}

function isQuoteSelection(text) {
  return extractNumbers(text).length > 0;
}

function isBusinessRecommendationIntent(text) {
  const normalized = String(text || "").toLowerCase();

  return [
    "panader",
    "pasteler",
    "cafeter",
    "delivery",
    "barber",
    "peluquer",
    "spa",
    "clinica",
    "clínica",
    "consulta",
    "tienda",
    "negocio",
  ].some((word) => normalized.includes(word));
}

module.exports = {
  QUOTE_MODULES,
  QUOTE_TEXTS,
  formatCLP,
  getQuoteCatalogText,
  parseQuoteSelection,
  calculateQuoteTotals,
  buildQuoteSummary,
  suggestModulesByBusiness,
  isQuoteIntent,
  isQuoteSelection,
  isBusinessRecommendationIntent,
};
