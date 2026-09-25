const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const catalog = require("./catalog.js");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || "0.0.0.0";
const ORDER_TO_EMAIL = "sara.khenine@gmail.com";
const MAX_BODY_SIZE = 64 * 1024;
const catalogById = new Map(catalog.map((product) => [product.id, product]));

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function json(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
    return entities[character];
  });
}

function prepareOrder(payload) {
  const customer = payload && typeof payload.customer === "object" ? payload.customer : {};
  const name = cleanText(customer.name, 120);
  const phone = cleanText(customer.phone, 40);
  const address = cleanText(customer.address, 300);
  const message = cleanText(customer.message, 1000);

  if (!name || !phone || !address) {
    throw new Error("Informations client incomplètes.");
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > 30) {
    throw new Error("Le panier est vide ou invalide.");
  }

  const quantitiesById = new Map();
  for (const item of payload.items) {
    const id = cleanText(item && item.id, 80);
    const quantity = Number(item && item.quantity);
    if (!catalogById.has(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("Un article du panier est invalide.");
    }
    quantitiesById.set(id, Math.min((quantitiesById.get(id) || 0) + quantity, 20));
  }

  const items = Array.from(quantitiesById, ([id, quantity]) => {
    const product = catalogById.get(id);
    return {
      id,
      name: product.name,
      price: product.price,
      quantity,
      subtotal: product.price * quantity,
    };
  });
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return { customer: { name, phone, address, message }, items, total };
}

function buildEmail(order) {
  const articleText = order.items
    .map(
      (item) =>
        `${item.name}\nPrix: ${item.price} DT\nQuantité: ${item.quantity}\nSous-total: ${item.subtotal} DT`,
    )
    .join("\n\n");
  const text = `Nouvelle commande SK Accessoires\n\nNom du client:\n${order.customer.name}\n\nTéléphone:\n${order.customer.phone}\n\nAdresse:\n${order.customer.address}\n\nMessage facultatif:\n${order.customer.message || "Aucun message"}\n\nArticles commandés:\n\n${articleText}\n\nTotal:\n${order.total} DT`;

  const articleHtml = order.items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #ead9bd">${escapeHtml(item.name)}</td>
        <td style="padding:10px;border-bottom:1px solid #ead9bd;text-align:center">${item.price} DT</td>
        <td style="padding:10px;border-bottom:1px solid #ead9bd;text-align:center">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #ead9bd;text-align:right">${item.subtotal} DT</td>
      </tr>`,
    )
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;color:#2e2219;max-width:720px;margin:auto">
    <h1 style="font-family:Georgia,serif;color:#7b461c">Nouvelle commande SK Accessoires</h1>
    <p><strong>Nom du client :</strong> ${escapeHtml(order.customer.name)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(order.customer.phone)}</p>
    <p><strong>Adresse :</strong> ${escapeHtml(order.customer.address)}</p>
    <p><strong>Message facultatif :</strong> ${escapeHtml(order.customer.message || "Aucun message")}</p>
    <h2 style="font-family:Georgia,serif;color:#7b461c">Articles commandés</h2>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr><th style="text-align:left">Article</th><th>Prix</th><th>Quantité</th><th style="text-align:right">Sous-total</th></tr></thead>
      <tbody>${articleHtml}</tbody>
    </table>
    <p style="font-size:20px;text-align:right"><strong>Total : ${order.total} DT</strong></p>
  </div>`;

  return { text, html };
}

async function sendOrderEmail(order) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("La configuration email du serveur est incomplète.");
  }
  const email = buildEmail(order);
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [ORDER_TO_EMAIL],
      subject: "Nouvelle commande SK Accessoires",
      text: email.text,
      html: email.html,
    }),
  });
  if (!result.ok) {
    throw new Error(`Resend a refusé l'envoi (${result.status}).`);
  }
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) throw new Error("Requête trop volumineuse.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handleOrder(request, response) {
  try {
    const payload = await readJsonBody(request);
    const order = prepareOrder(payload);
    await sendOrderEmail(order);
    json(response, 200, { ok: true });
  } catch (error) {
    const clientError = /incomplètes|panier|article|volumineuse|JSON/.test(error.message);
    console.error("Order error:", error.message);
    json(response, clientError ? 400 : 500, {
      ok: false,
      error: clientError ? error.message : "Impossible d'envoyer la commande.",
    });
  }
}

function serveStatic(request, response) {
  const requestPath = new URL(request.url, "http://localhost").pathname;
  const relativePath = requestPath === "/" ? "index.html" : decodeURIComponent(requestPath.slice(1));
  const filePath = path.resolve(ROOT, relativePath);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) || relativePath.startsWith(".")) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/order") {
    await handleOrder(request, response);
    return;
  }
  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response);
    return;
  }
  json(response, 405, { ok: false, error: "Méthode non autorisée." });
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`SK Accessoires disponible sur http://127.0.0.1:${PORT}`);
  });
}

module.exports = { buildEmail, prepareOrder, sendOrderEmail, server };
