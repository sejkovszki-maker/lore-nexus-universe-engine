const fs = require('fs');
const vm = require('vm');

const d = fs.readFileSync('data.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(d, sandbox);

if (sandbox.wikiArticles) {
  const cats = new Set();
  Object.values(sandbox.wikiArticles).forEach(art => {
    if (art.category) cats.add(art.category);
  });
  
  console.log("All categories found:");
  [...cats].sort().forEach(c => console.log('  -', c));
  
  const ch1 = sandbox.wikiArticles['kingdom-of-shadow-ch1'];
  if (ch1) console.log("\nKingdom of Shadow ch1 category:", ch1.category);
  
  const dch1 = sandbox.wikiArticles['demonsbane-ch1'];
  if (dch1) console.log("Demonsbane ch1 category:", dch1.category);
}
