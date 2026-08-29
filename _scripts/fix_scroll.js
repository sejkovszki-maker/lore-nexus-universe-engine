const fs = require('fs');
let d = fs.readFileSync('app.js', 'utf8');

if (d.includes('wikiArticleDisplay.scrollIntoView({ behavior: \'smooth\' });')) {
  d = d.replace('wikiArticleDisplay.scrollIntoView({ behavior: \'smooth\' });', 'window.scrollTo({ top: 0, behavior: \'smooth\' });');
  fs.writeFileSync('app.js', d, 'utf8');
  console.log('Scroll fixed in app.js');
} else {
  console.log('Scroll line not found in app.js');
}
