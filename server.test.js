const test = require("node:test");
const assert = require("node:assert/strict");
const { buildEmail, prepareOrder } = require("./server.js");

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
