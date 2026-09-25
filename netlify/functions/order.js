const { prepareOrder, sendOrderEmail } = require("../../server.js");

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function response(statusCode, payload) {
  return {
    statusCode,
    headers: responseHeaders,
    body: JSON.stringify(payload),
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return response(405, { ok: false, error: "Méthode non autorisée." });
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const order = prepareOrder(payload);
    await sendOrderEmail(order);
    return response(200, { ok: true });
  } catch (error) {
    const clientError = /incomplètes|panier|article|volumineuse|JSON/.test(error.message);
    console.error("Order function error:", error.message);
    return response(clientError ? 400 : 500, {
      ok: false,
      error: clientError ? error.message : "Impossible d'envoyer la commande.",
    });
  }
};
