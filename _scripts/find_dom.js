const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let idx = html.indexOf('id="wiki-articles"');
console.log(html.substring(idx - 100, idx + 1000));
