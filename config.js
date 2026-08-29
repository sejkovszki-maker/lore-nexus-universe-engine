// Közös konfigurációs fájl a kliens és a Web Worker számára (DRY elv)

const sectionRules = [
  { pattern: /^(történet[eé]?|történeti áttekintés):?/im, header: "### 📜 Története\n" },
  { pattern: /^(eredet[eé]?|kezdetei|sanctuary eredete):?/im, header: "### 🏛️ Eredete & Kezdetei\n" },
  { pattern: /^(képességek?|erők|mágia|erőforrások):?/im, header: "### ⚡ Erők és Képességek\n" },
  { pattern: /^(főbb események|fő konfliktus|háborúk):?/im, header: "### ⚔️ Főbb Események\n" },
  { pattern: /^(öröksége?|hatása|következmények):?/im, header: "### 🔮 Öröksége & Hatása\n" },
  { pattern: /^(források|kánon források|irodalom):?/im, header: "### 📚 Kánon Források\n" }
];

const keyLoreTerms = [
  "Tyrael", "Imperius", "Malthael", "Auriel", "Itherael", "Inarius", "Lilith",
  "Diablo", "Mephisto", "Baal", "Andariel", "Duriel", "Belial", "Azmodan", "Tathamet", "Anu",
  "Deckard Cain", "Tal Rasha", "Zoltun Kulle", "Uldyssian", "Rathma", "Bul-Kathos", "Vasily",
  "Horadrim", "Zakarum", "Angiris Council", "Vizjerei", "Triune", "Edyrem", "Nephalem",
  "Worldstone", "Világkő", "Black Soulstone", "Fekete Lélekkő", "Soulstone", "Lélekkő", "El'druin",
  "Sanctuary", "Tristram", "Kurast", "Kehjistan", "Arreat", "Scosglen", "High Heavens", "Burning Hells"
];
