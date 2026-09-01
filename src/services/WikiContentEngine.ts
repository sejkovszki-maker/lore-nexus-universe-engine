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
    existingBook: WikiArticle | null;
    unchangedChapterCount: number;
    changedChapterCount: number;
    newChapterCount: number;
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

    public static sanitizeContent(text: string): string {
        if (!text) return text;
        return text
            .replace(/\r\n?/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/ *\n */g, '\n')
            .replace(/\n{4,}/g, '\n\n\n')
            .trim();
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

    private static normalizeWorkTitle(value: string): string {
        return this.sanitizeContent(value).toLocaleLowerCase('hu-HU')
            .replace(/\([^)]*\)/g, ' ')
            .replace(/\b(?:könyv|regény|olvasó|reader|teljes)\b/giu, ' ')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, ' ').trim();
    }

    private static normalizedBody(value: string): string {
        return this.sanitizeContent(value).toLocaleLowerCase('hu-HU').replace(/\s+/g, ' ').trim();
    }

    private static findExistingBook(title: string, articles: WikiArticles): WikiArticle | null {
        const wanted = this.normalizeWorkTitle(title);
        if (!wanted) return null;
        return Object.values(articles).find(article => article.type === 'book' && article.publicationStatus === 'local-draft'
            && this.normalizeWorkTitle(article.title) === wanted) ?? null;
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
        const existingBook = this.findExistingBook(cleanTitle, existingArticles);
        const bookId = existingBook?.id ?? this.resolveIdCollision(this.generateId(cleanTitle), existingArticles);
        
        // Chapter parsing regex: matches "X. fejezet" or "Chapter X" or "X. Fejezet"
        const chapterRegex = /(?:^|\n)(?:###?\s+|#\s+)?(?:(?:\d+\.?\s*fejezet\b[^\n]*)|(?:chapter\s+(?:\d+|[ivxlcdm]+)\b[^\n]*)|(?:fejezet\s+(?:\d+|[ivxlcdm]+)\b[^\n]*)|(?:[ivxlcdm]+\.?\s+fejezet\b[^\n]*)|(?:prol[oó]gus\b[^\n]*)|(?:epil[oó]gus\b[^\n]*))/giu;
        const splits = cleanContent.split(chapterRegex);
        const matches = cleanContent.match(chapterRegex);

        let chapters: ChapterData[] = [];
        if (matches && matches.length > 0 && splits.length > 1) {
            const frontMatter = splits[0].trim();
            if (frontMatter.length > 50) chapters.push({
                chapterId: `${bookId}-front-matter`,
                chapterNumber: '0',
                title: `${cleanTitle} – Bevezető`,
                content: frontMatter
            });
            for (let i = 0; i < matches.length; i++) {
                const chapterTitleRaw = matches[i].replace(/[#\n]/g, '').trim();
                const chapterContent = splits[i + 1].trim();
                if (chapterContent.length > 50) {
                    const chapterNumMatch = chapterTitleRaw.match(/\d+/);
                    const chapterNum = chapterNumMatch ? chapterNumMatch[0] : `${i + 1}`;
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
        const existingChapters = existingBook
            ? Object.values(existingArticles).filter(article => article.type === 'chapter' && article.parentBook === existingBook.id)
            : [];
        let unchangedChapterCount = 0;
        let changedChapterCount = 0;
        let newChapterCount = 0;
        for (const [index, chapter] of chapters.entries()) {
            const previous = existingChapters.find(item => item.id === chapter.chapterId)
                ?? existingChapters[index];
            if (!previous) newChapterCount += 1;
            else if (this.normalizedBody(previous.content) === this.normalizedBody(chapter.content)) unchangedChapterCount += 1;
            else changedChapterCount += 1;
        }
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
            totalRelations,
            existingBook,
            unchangedChapterCount,
            changedChapterCount,
            newChapterCount
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

    public static processAndPrepareBook(analysis: BookAnalysisResult, existingArticles: WikiArticles, universe: { id: string; label: string } = { id: 'diablo', label: 'Diablo' }): WikiArticle[] {
        let results: WikiArticle[] = [];
        const relatedTerms = [
            ...analysis.classification.extractedEntities.characters,
            ...analysis.classification.extractedEntities.locations,
            ...analysis.classification.extractedEntities.events,
            ...analysis.classification.extractedEntities.other
        ];
        const related = [...new Set(relatedTerms.map(term => {
            const normalized = term.toLowerCase();
            return Object.values(existingArticles).find(article => (article.universeId || 'diablo') === universe.id && (article.id === normalized || article.title.toLowerCase() === normalized || article.title.toLowerCase().includes(normalized)))?.id;
        }).filter((id): id is string => Boolean(id)))];

        const previousBook = analysis.existingBook;
        // Main book article: an existing local work keeps its stable identity and receives a new version.
        results.push({
            ...previousBook,
            id: analysis.bookId,
            title: analysis.title,
            subtitle: `${analysis.chapters.length} fejezetes gyűjtemény`,
            category: analysis.classification.primaryCategory,
            content: `Ez a könyv ${analysis.chapters.length} fejezetet tartalmaz.`, // Intro text
            relatedArticles: related,
            type: 'book',
            universeId: universe.id,
            universeLabel: universe.label,
            publicationStatus: 'local-draft',
            version: (previousBook?.version ?? 0) + 1,
            lastEdited: Date.now()
        });

        // Chapters
        const previousChapters = Object.values(existingArticles).filter(article => article.type === 'chapter' && article.parentBook === analysis.bookId);
        for (const [index, ch] of analysis.chapters.entries()) {
            const previous = previousChapters.find(article => article.id === ch.chapterId) ?? previousChapters[index];
            if (previous && this.normalizedBody(previous.content) === this.normalizedBody(ch.content)) continue;
            const chapterId = previous?.id ?? ch.chapterId;
            results.push({
                ...previous,
                id: chapterId,
                title: ch.title,
                category: analysis.classification.primaryCategory,
                content: ch.content,
                relatedArticles: related,
                type: 'chapter',
                parentBook: analysis.bookId,
                universeId: universe.id,
                universeLabel: universe.label,
                publicationStatus: 'local-draft',
                version: (previous?.version ?? 0) + 1,
                lastEdited: Date.now()
            });
        }

        return results;
    }

    public static processAndPrepareArticle(title: string, subtitle: string, content: string, existingArticles: WikiArticles, universe: { id: string; label: string } = { id: 'diablo', label: 'Diablo' }): WikiArticle {
        const cleanTitle = this.sanitizeContent(title);
        const id = this.resolveIdCollision(this.generateId(cleanTitle), existingArticles);
        const classification = this.classify(cleanTitle, subtitle, content);
        return {
            id,
            title: cleanTitle,
            subtitle: this.sanitizeContent(subtitle) || undefined,
            category: classification.primaryCategory,
            content: this.sanitizeContent(content),
            relatedArticles: [],
            type: 'article',
            universeId: universe.id,
            universeLabel: universe.label,
            publicationStatus: 'local-draft',
            version: 1,
            lastEdited: Date.now()
        };
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
