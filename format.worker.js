/**
 * format.worker.js – Web Worker a szövegformázás főszálról való kiszervezéséhez.
 * 
 * A főszálon: worker.postMessage({ raw: szöveg })
 * Válasz:      { formatted: formázott_szöveg } | { error: hibaüzenet }
 */

'use strict';

// â”€â”€â”€ Helper functions (önálló – nem importálhat app.js-t) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Importáljuk a közös konfigurációt (szabályok és kulcsszavak)
importScripts('config.js');



function autoFormatWikiArticle(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  let text = rawText.trim().replace(/\r\n/g, '\n');

  // Point 16: Tipográfiai / OCR hibák javítása
  text = text.replace(/fejezeí/gi, 'fejezet');

  // 1. Fejezet-fejlécek felismerése és konvertálása
  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    const l = line.trim();
    if (!l) return '';
    for (const rule of sectionRules) {
      if (rule.pattern.test(l) && !l.startsWith('#')) {
        return '\n' + rule.header + l.replace(rule.pattern, '').trim();
      }
    }
    if (/^[„"Â»](.+)["\"Â«]$/.test(l) || /^"(.+)"$/.test(l)) {
      return `> đź“ś *"${l.replace(/^[„"Â»]|[""Â«]$/g, '').trim()}"*`;
    }
    if (/^[â€˘Â·\-\*]\s*(.+)/.test(l) && !l.startsWith('- ')) {
      return `- ${l.replace(/^[â€˘Â·\-\*]\s*/, '')}`;
    }
    return l;
  });

  text = formattedLines.join('\n');

  // 2. Lore kulcsszavak kiemelése (chunk-okban feldolgozva a túlterhelés elkerülése érdekében)
  const CHUNK = 10;
  for (let i = 0; i < keyLoreTerms.length; i += CHUNK) {
    const batch = keyLoreTerms.slice(i, i + CHUNK);
    batch.forEach(term => {
      const escaped = escapeRegExp(term);
      const regex = new RegExp(`(?<![\\*><\\w])(${escaped})(?![\\*<\\w])`, 'gi');
      text = text.replace(regex, (match, p1) => `**${p1}**`);
      text = text.replace(/\*{4}/g, '**').replace(/\*{4}(.*?)\*{4}/g, '**$1**');
    });
  }

  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
}

// â”€â”€â”€ Worker üzenet-kezelő â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

self.onmessage = function(e) {
  try {
    const { raw, taskId } = e.data;
    if (typeof raw !== 'string') {
      self.postMessage({ error: 'Érvénytelen bemenet: string szükséges.', taskId });
      return;
    }
    const formatted = autoFormatWikiArticle(raw);
    self.postMessage({ formatted, taskId });
  } catch (err) {
    self.postMessage({ error: err.message, taskId: e.data?.taskId });
  }
};

