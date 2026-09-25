const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const dist = path.join(root, "dist");
const config = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");

assert.match(config, /command\s*=\s*"npm run build"/);
assert.match(config, /publish\s*=\s*"dist"/);
assert.match(config, /functions\s*=\s*"netlify\/functions"/);

const apiRule = config.indexOf('from = "/api/order"');
const spaRule = config.indexOf('from = "/*"');
assert.ok(apiRule >= 0, "Missing /api/order rewrite");
assert.ok(spaRule > apiRule, "SPA fallback must come after the order API rewrite");

for (const file of ["index.html", "styles.css", "script.js", "catalog.js", "logo.jpeg", "9.jpeg", "perle/1.jpeg"]) {
  assert.ok(fs.existsSync(path.join(dist, file)), `Missing public build file: ${file}`);
}

for (const privateFile of ["server.js", "server.test.js", ".env.example", "netlify/functions/order.js"]) {
  assert.equal(fs.existsSync(path.join(dist, privateFile)), false, `Private file published: ${privateFile}`);
}

const publicText = ["index.html", "script.js", "catalog.js"]
  .map((file) => fs.readFileSync(path.join(dist, file), "utf8"))
  .join("\n");
assert.doesNotMatch(publicText, /RESEND_API_KEY|ORDER_FROM_EMAIL|re_[A-Za-z0-9]{8,}/);
assert.match(publicText, /\/api\/order/);

console.log("Netlify configuration verified: build, publish directory, function rewrite, SPA fallback, and public bundle.");
