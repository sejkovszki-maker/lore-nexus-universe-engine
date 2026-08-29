const fs = require('fs');
const vm = require('vm');

const d = fs.readFileSync('data.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(d, sandbox);

if (sandbox.wikiArticles) {
  const ids = Object.keys(sandbox.wikiArticles);
  console.log('Total articles:', ids.length);
  console.log(ids.join(', '));
}
