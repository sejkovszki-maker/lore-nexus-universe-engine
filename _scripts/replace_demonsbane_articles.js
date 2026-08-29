const fs = require('fs');

let data = fs.readFileSync('data.js', 'utf8');
let newArticles = fs.readFileSync('new_demonsbane_articles.js', 'utf8');

const startStr = "/* DEMONSBANE ARTICLES */";
const endStr = "/* DEMONSBANE LORE ARTICLES */";

let startIdx = data.indexOf(startStr);
let endIdx = data.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    let before = data.substring(0, startIdx);
    let after = data.substring(endIdx);
    
    // Add new articles + a comma to keep JSON syntax valid if needed
    // newArticles already has "/* DEMONSBANE ARTICLES */" at the top.
    
    // Check if newArticles has a trailing comma on its last object, because before the lore articles we need it.
    // If it doesn't, we add a comma. (Wait, the script generated trailing commas for each chapter `  },`)
    
    let result = before + newArticles + "\n" + after;
    fs.writeFileSync('data.js', result, 'utf8');
    console.log("Replacement successful.");
} else {
    console.log("Could not find delimiters.");
}
