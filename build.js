const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const output = path.join(root, "dist");
const files = [
  "index.html",
  "styles.css",
  "script.js",
  "catalog.js",
  "logo.jpeg",
  "1.jpeg",
  "2.jpeg",
  "3.jpeg",
  "4.jpeg",
  "5.jpeg",
  "6.jpeg",
  "7.jpeg",
  "8.jpg",
];

if (path.dirname(output) !== root || path.basename(output) !== "dist") {
  throw new Error("Invalid build output path.");
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

fs.cpSync(path.join(root, "perle"), path.join(output, "perle"), { recursive: true });
console.log(`Built ${files.length} files and the perle assets into dist.`);
