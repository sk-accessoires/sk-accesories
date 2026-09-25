const test = require("node:test");
const assert = require("node:assert/strict");
const { buildEmail, prepareOrder } = require("./server.js");
const { handler: netlifyOrderHandler } = require("./netlify/functions/order.js");

test("prepareOrder uses official catalog prices and merges quantities", () => {
  const order = prepareOrder({
    customer: {
      name: "Sarra",
      phone: "20 000 000",
      address: "Tunis",
      message: "Livraison le matin",
    },
    items: [
      { id: "cristal-aura", quantity: 1, price: 1 },
      { id: "cristal-aura", quantity: 2, price: 1 },
      { id: "bracelet-emeraude", quantity: 1, price: 1 },
    ],
  });

  assert.equal(order.items[0].name, "Cristal Aura");
  assert.equal(order.items[0].price, 20);
  assert.equal(order.items[0].quantity, 3);
  assert.equal(order.items[0].subtotal, 60);
  assert.equal(order.total, 95);
});

test("prepareOrder rejects unknown products", () => {
  assert.throws(
    () =>
      prepareOrder({
        customer: { name: "Sarra", phone: "20 000 000", address: "Tunis" },
        items: [{ id: "produit-invente", quantity: 1 }],
      }),
    /article du panier est invalide/,
  );
});

test("buildEmail includes customer details and official order lines", () => {
  const order = prepareOrder({
    customer: {
      name: "Sarra",
      phone: "20 000 000",
      address: "Tunis",
      message: "Emballage cadeau",
    },
    items: [{ id: "bracelet-horloge", quantity: 2 }],
  });
  const email = buildEmail(order);

  assert.match(email.text, /Nouvelle commande SK Accessoires/);
  assert.match(email.text, /Bracelet Horloge/);
  assert.match(email.text, /Quantité: 2/);
  assert.match(email.text, /Sous-total: 60 DT/);
  assert.match(email.text, /Téléphone:\n20 000 000/);
  assert.match(email.text, /Adresse:\nTunis/);
  assert.match(email.text, /Emballage cadeau/);
  assert.match(email.text, /Total:\n60 DT/);
});

test("Netlify Function sends the order to the configured SK recipient", async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.ORDER_FROM_EMAIL;
  let resendRequest;

  process.env.RESEND_API_KEY = "re_test_key";
  process.env.ORDER_FROM_EMAIL = "SK Accessoires <commandes@example.com>";
  global.fetch = async (url, options) => {
    resendRequest = { url, options };
    return { ok: true, status: 200 };
  };

  try {
    const result = await netlifyOrderHandler({
      httpMethod: "POST",
      body: JSON.stringify({
        customer: {
          name: "Sarra",
          phone: "20 000 000",
          address: "Tunis",
          message: "Test Netlify",
        },
        items: [{ id: "bracelet-horloge", quantity: 2, price: 1 }],
      }),
    });

    const emailPayload = JSON.parse(resendRequest.options.body);
    assert.equal(result.statusCode, 200);
    assert.equal(resendRequest.url, "https://api.resend.com/emails");
    assert.deepEqual(emailPayload.to, ["sara.khenine@gmail.com"]);
    assert.equal(emailPayload.subject, "Nouvelle commande SK Accessoires");
    assert.match(emailPayload.text, /Bracelet Horloge/);
    assert.match(emailPayload.text, /Sous-total: 60 DT/);
    assert.doesNotMatch(emailPayload.text, /Prix: 1 DT/);
  } finally {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
    if (originalFrom === undefined) delete process.env.ORDER_FROM_EMAIL;
    else process.env.ORDER_FROM_EMAIL = originalFrom;
  }
});
