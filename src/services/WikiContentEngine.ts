import type { WikiArticle, WikiArticles } from "../types";

export interface EntityCounts {
    characters: string[];
    locations: string[];
    events: string[];
    other: string[];
}

export interface ClassificationResult {
    primaryCategory: string;
    confidence: number;
    confidenceLevel: 'automatic' | 'suggested' | 'review_requested' | 'uncertain';
    secondaryCategories: string[];
    timelineEra: { id: string; name: string; gameTag: string };
    extractedEntities: EntityCounts;
}

export interface ChapterData {
    chapterId: string;
    chapterNumber: string;
    title: string;
    content: string;
}

export interface BookAnalysisResult {
    isBook: boolean;
    bookId: string;
    title: string;
    chapters: ChapterData[];
    classification: ClassificationResult;
    duplicates: DuplicateAnalysisResult;
    totalRelations: number;
}

export interface WikiPlacement {
    type: 'article' | 'book' | 'chapter';
    category: string;
    era: string;
    parent: string | null;
    relatedArticles: string[];
    insertStrategy: 'category' | 'book_collection' | 'standalone';
    confidence: number;
}

export interface DuplicateAnalysisResult {
    isDuplicate: boolean;
    matchedArticle: WikiArticle | null;
    similarity: number;
    recommendedAction: 'overwrite' | 'merge' | 'reject';
    rationale: string;
}

export class WikiContentEngine {
    private static entityDictionaries = {
        characters: ["tyrael", "imperius", "auriel", "itherael", "malthael", "inarius", "lilith", "rathma", "uldyssian", "deckard cain", "cain", "lorath", "donan", "neyrelle", "leah", "adria", "lazarus", "leoric", "aidan", "lachdanan", "bul-kathos", "vasily", "elias", "prava", "linarian", "jered cain", "diablo", "mephisto", "baal", "andariel", "duriel", "belial", "azmodan", "astaroth", "tathamet", "skarn"],
        locations: ["tristram", "khanduras", "kehjistan", "caldeum", "kurast", "westmarch", "arreat", "hawezar", "scosglen", "dry steppes", "fractured peaks", "nahantu", "sanctuary", "high heavens", "burning hells", "pandemonium"],
        events: ["sin war", "bűn háborúja", "dark exile", "sötét száműzetés", "első kozmikus háború", "örök konfliktus", "eternal conflict", "teremtés", "világkő elrablása"]
    };

    private static legacyByteMap: Record<string, number> = {
        'í': 0xC3, 'Ä': 0xC4, 'Ĺ': 0xC5, 'Ć': 0xC6, 'Č': 0xC8, 'É': 0xC9,
        'Í': 0xCD, 'Ó': 0xD3, 'Ö': 0xD6, 'Ú': 0xDA, 'Ü': 0xDC, 'Ý': 0xDD,
        'ˇ': 0xA1, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '–': 0x96,
        '—': 0x97, 'đ': 0xF0, 'ď': 0xEF, 'ź': 0x9F, '¸': 0xB8, 'ś': 0x9C,
        'Ť': 0x85, 'Ź': 0x8F
    };

    public static sanitizeContent(text: string): string {
        if (!text) return text;
        
        // 1. Krisz-krasz (Mojibake) javítás
        let sanitized = text;
        const mojibakePattern = /[íĹÄĆČ]|â.|đź|ď¸/;
        if (mojibakePattern.test(sanitized)) {
            try {
                const bytes = Uint8Array.from([...sanitized], char => this.legacyByteMap[char] ?? char.codePointAt(0)!);
                const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
                sanitized = utf8Decoder.decode(bytes);
            } catch (e) {
                // If decoding fails, keep the original text
            }
        }

        // 2. Helyesírási és tipográfiai alapok (krisz-kraszok és duplikált szóközök)
        sanitized = sanitized
            .replace(/\s+/g, ' ') // dupla szóközök
            .replace(/ ,/g, ',') // szóköz vessző előtt
            .replace(/ \./g, '.') // szóköz pont előtt
            .replace(/([,\.\?\!])([^\s\"\'\)])/g, '$1 $2') // szóköz hiánya írásjel után
            .replace(/ \)/g, ')')
            .replace(/\( /g, '(')
            .trim();

        return sanitized;
    }

    private static categoryRules = [
        { category: "Főgonoszok", keywords: this.entityDictionaries.characters.slice(26), weight: 2.0 },
        { category: "Szereplők", keywords: this.entityDictionaries.characters.slice(0, 26), weight: 1.9 },
        { category: "Helyszínek", keywords: this.entityDictionaries.locations, weight: 1.8 },
        { category: "Frakciók", keywords: ["horadrim", "zakarum", "vizjerei", "nekromanta", "druida", "angiris council", "cathedral of light", "triune", "edyrem"], weight: 1.8 },
        { category: "Ereklyék", keywords: ["worldstone", "világkő", "soulstone", "lélekkő", "black soulstone", "el’druin"], weight: 2.0 },
        { category: "Kozmogónia", keywords: ["anu", "tathamet", "kristályív", "kozmogónia", "ősprincípium"], weight: 2.0 },
        { category: "Történeti Korszakok", keywords: this.entityDictionaries.events, weight: 1.7 },
        { category: "Könyvek – Olvasó", keywords: ["book of", "regény", "könyv", "trilógia", "fejezet", "chapter", "novella"], weight: 1.8 }
    ];

    private static generateId(title: string): string {
        let id = title.toLowerCase()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ö/g, 'o').replace(/ő/g, 'o')
            .replace(/ú/g, 'u').replace(/ü/g, 'u').replace(/ű/g, 'u')
            .replace(/chapter\s+(\d+)/, 'ch$1')
            .replace(/fejezet\s+(\d+)/, 'ch$1')
            .replace(/[^a-z0-9\-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return id || `article-${Date.now()}`;
    }

    private static resolveIdCollision(baseId: string, existingArticles: WikiArticles): string {
        let finalId = baseId;
        let counter = 2;
        while (existingArticles[finalId]) {
            finalId = `${baseId}-${counter}`;
            counter++;
        }
        return finalId;
    }

    private static extractEntities(text: string): EntityCounts {
        const lowerText = text.toLowerCase();
        const chars = this.entityDictionaries.characters.filter(kw => lowerText.includes(kw));
        const locs = this.entityDictionaries.locations.filter(kw => lowerText.includes(kw));
        const evts = this.entityDictionaries.events.filter(kw => lowerText.includes(kw));
        
        // Factions and relics mapped to "other"
        const otherKws = [...this.categoryRules[3].keywords, ...this.categoryRules[4].keywords];
        const others = otherKws.filter(kw => lowerText.includes(kw));

        return { characters: chars, locations: locs, events: evts, other: others };
    }

    public static classify(title: string, subtitle: string, content: string): ClassificationResult {
        const combinedText = `${title} ${subtitle} ${content}`.toLowerCase();
        
        let scores: Record<string, number> = {};
        this.categoryRules.forEach(rule => {
            let score = 0;
            rule.keywords.forEach(kw => {
                if (combinedText.includes(kw)) score += rule.weight;
            });
            scores[rule.category] = score;
        });

        const sorted = Object.keys(scores)
            .map(cat => ({ category: cat, score: scores[cat] }))
            .sort((a, b) => b.score - a.score);

        const bestMatch = sorted[0]?.score > 0 ? sorted[0] : { category: "Általános Lore", score: 1 };
        const totalScore = sorted.reduce((acc, curr) => acc + curr.score, 0);
        const confidence = totalScore > 0 ? Math.min(100, Math.round((bestMatch.score / totalScore) * 100 + 20)) : 50;

        let confidenceLevel: ClassificationResult['confidenceLevel'] = 'uncertain';
        if (confidence >= 90) confidenceLevel = 'automatic';
        else if (confidence >= 70) confidenceLevel = 'suggested';
        else if (confidence >= 50) confidenceLevel = 'review_requested';

        const extractedEntities = this.extractEntities(combinedText);

        let timelineEra = { id: "lore", name: "Általános Diablo Lore", gameTag: "Lore" };
        if (combinedText.includes("sin war")) timelineEra = { id: "sinwar", name: "3. A Sin War Korszak", gameTag: "Lore" };
        else if (combinedText.includes("diablo 4") || (combinedText.includes("lilith") && combinedText.includes("inarius"))) timelineEra = { id: "diablo4", name: "8. Diablo IV Korszak", gameTag: "Diablo-IV" };

        return {
            primaryCategory: bestMatch.category,
            confidence,
            confidenceLevel,
            secondaryCategories: sorted.slice(1, 4).filter(s => s.score > 0).map(s => s.category),
            timelineEra,
            extractedEntities
        };
    }

    public static analyzeBook(title: string, subtitle: string, content: string, existingArticles: WikiArticles): BookAnalysisResult {
        const cleanTitle = this.sanitizeContent(title);
        const cleanSubtitle = this.sanitizeContent(subtitle);
        const cleanContent = this.sanitizeContent(content);

        const classification = this.classify(cleanTitle, cleanSubtitle, cleanContent);
        const bookId = this.generateId(cleanTitle);
        
        // Chapter parsing regex: matches "X. fejezet" or "Chapter X" or "X. Fejezet"
        const chapterRegex = /(?:^|\n)(?:### |## |# )?(?:(?:\d+\.\s*fejezet)|(?:chapter\s+\d+)|(?:fejezet\s+\d+)|(?:[IVXLCDM]+\.\s*fejezet))/gi;
        const splits = cleanContent.split(chapterRegex);
        const matches = cleanContent.match(chapterRegex);

        let chapters: ChapterData[] = [];
        if (matches && matches.length > 0 && splits.length > 1) {
            // First split might be intro
            for (let i = 0; i < matches.length; i++) {
                const chapterTitleRaw = matches[i].replace(/[#\n]/g, '').trim();
                const chapterContent = splits[i + 1].trim();
                if (chapterContent.length > 50) {
                    const chapterNumMatch = chapterTitleRaw.match(/\d+/);
                    const chapterNum = chapterNumMatch ? chapterNumMatch[0] : `${i+1}`;
                    chapters.push({
                        chapterId: `${bookId}-ch${chapterNum}`,
                        chapterNumber: chapterNum,
                        title: `${cleanTitle} - ${chapterTitleRaw}`,
                        content: chapterContent
                    });
                }
            }
        }

        const isBook = chapters.length > 0;
        if (isBook) {
            classification.primaryCategory = "Könyvek – Olvasó";
        }

        const duplicates = this.analyzeDuplicates(cleanTitle, cleanContent, existingArticles);
        const totalRelations = classification.extractedEntities.characters.length + 
                               classification.extractedEntities.locations.length + 
                               classification.extractedEntities.events.length + 
                               classification.extractedEntities.other.length;

        return {
            isBook,
            bookId,
            title: cleanTitle,
            chapters,
            classification,
            duplicates,
            totalRelations
        };
    }

    public static analyzeDuplicates(title: string, content: string, existingArticles: WikiArticles, editingId: string | null = null): DuplicateAnalysisResult {
        const cleanTitle = title.trim().toLowerCase();
        let matchedArticle: WikiArticle | null = null;
        let maxSimilarity = 0;

        for (const [id, art] of Object.entries(existingArticles)) {
            if (editingId && id === editingId) continue;
            const existingTitle = art.title.trim().toLowerCase();
            let score = 0;
            if (existingTitle === cleanTitle) score += 50;
            if (existingTitle.includes(cleanTitle) || cleanTitle.includes(existingTitle)) score += 30;
            if (id === this.generateId(title)) score += 40;
            if (score > maxSimilarity) {
                maxSimilarity = score;
                matchedArticle = art;
            }
        }

        if (!matchedArticle || maxSimilarity < 40) {
            return { isDuplicate: false, matchedArticle: null, similarity: 0, recommendedAction: 'overwrite', rationale: '' };
        }

        const existingLen = (matchedArticle.content || '').length;
        const newLen = content.length;
        if (maxSimilarity >= 90 && Math.abs(existingLen - newLen) < 50) return { isDuplicate: true, matchedArticle, similarity: 100, recommendedAction: 'reject', rationale: 'Azonos tartalom' };
        if (newLen > existingLen + 100) return { isDuplicate: true, matchedArticle, similarity: Math.min(100, maxSimilarity), recommendedAction: 'overwrite', rationale: 'Bővebb tartalom' };
        return { isDuplicate: true, matchedArticle, similarity: Math.min(100, maxSimilarity), recommendedAction: 'merge', rationale: 'Kiegészítés' };
    }

    public static processAndPrepareBook(analysis: BookAnalysisResult, existingArticles: WikiArticles): WikiArticle[] {
        let results: WikiArticle[] = [];
        const related = [
            ...analysis.classification.extractedEntities.characters,
            ...analysis.classification.extractedEntities.locations,
            ...analysis.classification.extractedEntities.events,
            ...analysis.classification.extractedEntities.other
        ];

        // Main book article
        results.push({
            id: analysis.bookId,
            title: analysis.title,
            subtitle: `${analysis.chapters.length} fejezetes gyűjtemény`,
            category: analysis.classification.primaryCategory,
            content: `Ez a könyv ${analysis.chapters.length} fejezetet tartalmaz.`, // Intro text
            relatedArticles: related,
            type: 'book',
            lastEdited: Date.now()
        });

        // Chapters
        for (const ch of analysis.chapters) {
            results.push({
                id: ch.chapterId,
                title: ch.title,
                category: analysis.classification.primaryCategory,
                content: ch.content,
                relatedArticles: related,
                type: 'chapter',
                parentBook: analysis.bookId,
                lastEdited: Date.now()
            });
        }

        return results;
    }

    public static applyBidirectionalRelations(articleId: string, relatedIds: string[], existingArticles: WikiArticles) {
        for (const relId of relatedIds) {
            if (existingArticles[relId]) {
                const target = existingArticles[relId];
                if (!target.relatedArticles) target.relatedArticles = [];
                if (!target.relatedArticles.includes(articleId)) {
                    target.relatedArticles.push(articleId);
                }
            }
        }
    }
}
