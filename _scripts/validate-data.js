"use strict";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const fs = require("fs");
const vm = require("vm");

const DATA_FILE = "./data.js";

console.log("");
console.log("========================================");
console.log("       DIABLO DATA VALIDATOR");
console.log("========================================");
console.log("");

if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Nem található: ${DATA_FILE}`);
    process.exit(1);
}

const source = fs.readFileSync(DATA_FILE, "utf8") + "\nif (typeof wikiArticles !== 'undefined') window.wikiArticles = wikiArticles;";

let context = {
    console,
    window: {}
};

vm.createContext(context);

try {
    vm.runInContext(source, context, {
        filename: DATA_FILE
    });
} catch (error) {
    console.error("❌ A data.js nem tölthető be:");
    console.error(error.message);
    process.exit(1);
}

const articles =
    context.wikiArticles ||
    context.window.wikiArticles;

if (!articles || typeof articles !== "object") {
    console.error("❌ A wikiArticles nem található.");
    process.exit(1);
}

const ids = Object.keys(articles);

console.log(`📚 Rekordok: ${ids.length}`);

const errors = [];
const warnings = [];

// ----------------------------------------
// ID ellenőrzés
// ----------------------------------------

for (const [id, article] of Object.entries(articles)) {

    if (!id || typeof id !== "string") {
        errors.push("Érvénytelen ID.");
    }

    if (!article || typeof article !== "object") {
        errors.push(`${id}: rekord nem objektum.`);
        continue;
    }

    if (!article.id) {
        errors.push(`${id}: hiányzó article.id`);
    }

    if (article.id !== id) {
        errors.push(
            `${id}: article.id eltér a kulcstól (${article.id})`
        );
    }

    if (!article.title) {
        errors.push(`${id}: hiányzó title`);
    }

    if (!article.category) {
        warnings.push(`${id}: hiányzó category`);
    }

    if (!article.content) {
        warnings.push(`${id}: hiányzó content`);
    }

    if (
        article.relatedArticles !== undefined &&
        !Array.isArray(article.relatedArticles)
    ) {
        errors.push(
            `${id}: relatedArticles nem tömb`
        );
    }
}

// ----------------------------------------
// Kapcsolatok ellenőrzése
// ----------------------------------------

for (const [id, article] of Object.entries(articles)) {

    if (!Array.isArray(article.relatedArticles)) {
        continue;
    }

    for (const relatedId of article.relatedArticles) {

        if (!articles[relatedId]) {

            errors.push(
                `${id} → hiányzó kapcsolat: ${relatedId}`
            );

        }
    }
}

// ----------------------------------------
// Encoding ellenőrzés
// ----------------------------------------

const badEncodingPatterns = [
    "Â",
    "â€",
    "Ä",
    "Å",
    "Ĺ",
    "Ë"
];

for (const [id, article] of Object.entries(articles)) {

    const text = JSON.stringify(article);

    for (const pattern of badEncodingPatterns) {

        if (text.includes(pattern)) {

            warnings.push(
                `${id}: lehetséges encoding hiba (${pattern})`
            );

            break;
        }
    }
}

// ----------------------------------------
// Eredmény
// ----------------------------------------

console.log("");

if (warnings.length) {

    console.log(
        `⚠️ Figyelmeztetések: ${warnings.length}`
    );

    for (const warning of warnings.slice(0, 100)) {
        console.log(`   ${warning}`);
    }

    if (warnings.length > 100) {
        console.log(
            `   ... és még ${warnings.length - 100}`
        );
    }
}

console.log("");

if (errors.length) {

    console.error(
        `❌ Hibák: ${errors.length}`
    );

    for (const error of errors) {
        console.error(`   ${error}`);
    }

    console.error("");
    console.error("❌ VALIDÁCIÓ SIKERTELEN.");

    process.exit(1);
}

console.log("✅ ID-k rendben.");
console.log("✅ Adatszerkezet rendben.");
console.log("✅ Kapcsolatok ellenőrizve.");
console.log("");
console.log("🎉 VALIDÁCIÓ SIKERES.");
console.log("");
