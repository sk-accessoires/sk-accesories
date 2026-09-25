const test = require("node:test");
const assert = require("node:assert/strict");
const catalog = require("./catalog.js");
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
      { id: "collier-emeraude", quantity: 1, price: 1 },
    ],
  });

  assert.equal(order.items[0].name, "Cristal Aura");
  assert.equal(order.items[0].price, 20);
  assert.equal(order.items[0].quantity, 3);
  assert.equal(order.items[0].subtotal, 60);
  assert.equal(order.total, 95);
});

test("catalog reflects the corrected products, galleries, and prices", () => {
  const products = new Map(catalog.map((product) => [product.id, product]));
  const horloge = products.get("bracelet-horloge");
  const emeraude = products.get("collier-emeraude");
  const jardin = products.get("collier-jardin-colore");

  assert.equal(horloge.name, "Bracelet Horloge");
  assert.equal(horloge.price, 30);
  assert.equal(horloge.mainImage, "6.jpeg");
  assert.deepEqual(horloge.images, ["6.jpeg", "2.jpeg", "7.jpeg"]);
  assert.equal(emeraude.name, "Collier Émeraude");
  assert.equal(emeraude.price, 35);
  assert.equal(emeraude.material, "Acier inoxydable");
  assert.equal(jardin.name, "Collier Jardin Coloré");
  assert.equal(jardin.price, 25);
  assert.equal(jardin.mainImage, "9.jpeg");
  assert.equal(products.get("perles-grande").price, 6);
  assert.equal(products.get("perles-moyenne").price, 5);
  assert.equal(products.get("perles-petite").price, 4);
  assert.ok(catalog.every((product) => product.material === "Acier inoxydable"));
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
  assert.match(email.text, /Nom du client:\nSarra/);
  assert.match(email.text, /Bracelet Horloge/);
  assert.match(email.text, /Prix: 30 DT/);
  assert.match(email.text, /Quantité: 2/);
  assert.match(email.text, /Sous-total: 60 DT/);
  assert.match(email.text, /Téléphone:\n20 000 000/);
  assert.match(email.text, /Adresse:\nTunis/);
  assert.match(email.text, /Emballage cadeau/);
  assert.match(email.text, /Total:\n60 DT/);
});

test("buildEmail uses corrected product names and prices", () => {
  const order = prepareOrder({
    customer: { name: "Sarra", phone: "20 000 000", address: "Tunis" },
    items: [
      { id: "collier-emeraude", quantity: 1 },
      { id: "collier-jardin-colore", quantity: 2 },
      { id: "perles-grande", quantity: 3 },
    ],
  });
  const email = buildEmail(order);

  assert.match(email.text, /Collier Émeraude\nPrix: 35 DT/);
  assert.match(email.text, /Collier Jardin Coloré\nPrix: 25 DT\nQuantité: 2/);
  assert.match(email.text, /Perles pour bracelets - Grande taille\nPrix: 6 DT\nQuantité: 3/);
  assert.match(email.text, /Total:\n103 DT/);
});

test("Netlify Function sends the order to the configured SK recipient", async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.ORDER_FROM_EMAIL;
  const originalRecipient = process.env.ORDER_TO_EMAIL;
  let resendRequest;

  process.env.RESEND_API_KEY = "re_test_key";
  process.env.ORDER_FROM_EMAIL = "SK Accessoires <commandes@example.com>";
  process.env.ORDER_TO_EMAIL = "skaccessoiressk@gmail.com";
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
    assert.deepEqual(emailPayload.to, ["skaccessoiressk@gmail.com"]);
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
    if (originalRecipient === undefined) delete process.env.ORDER_TO_EMAIL;
    else process.env.ORDER_TO_EMAIL = originalRecipient;
  }
});
