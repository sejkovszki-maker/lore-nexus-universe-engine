const fs = require('fs');
const vm = require('vm');

const dataContent = fs.readFileSync('data.js', 'utf8');
const extraContent = fs.readFileSync('extra.js', 'utf8');

const sandbox = {
  window: global,
  navigator: {},
  localStorage: {getItem:()=>null, setItem:()=>{}},
  document: {
    getElementById: function(id) {
      return { textContent: '' };
    },
    createElement: function() { return { style: {} }; },
    body: { appendChild: function(){} }
  },
  console: console,
  renderWikiArticlesGrid: function(){},
  renderLoreHighlights: function(){},
  updateReadingBtnText: function(){}
};

vm.createContext(sandbox);
vm.runInContext(dataContent + '\n' + extraContent, sandbox);

console.log('wikiArticles length after extra.js:', Object.keys(sandbox.wikiArticles).length);
