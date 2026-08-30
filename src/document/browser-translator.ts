interface LanguageDetection { detectedLanguage: string; confidence: number }
interface DetectorInstance { detect(text: string): Promise<LanguageDetection[]>; destroy?(): void }
interface TranslatorInstance { translate(text: string): Promise<string>; destroy?(): void }
interface AiFactory<T> {
  availability?(options?: Record<string, unknown>): Promise<string>;
  capabilities?(options?: Record<string, unknown>): Promise<{ available: string }>;
  create(options?: Record<string, unknown>): Promise<T>;
}

type TranslationWindow = Window & {
  LanguageDetector?: AiFactory<DetectorInstance>;
  Translator?: AiFactory<TranslatorInstance>;
};

export interface TranslationResult { text: string; sourceLanguage: string; translated: boolean }

function translationChunks(text: string, maximum = 3000): string[] {
  const chunks: string[] = [];
  let current = '';
  for (const paragraph of text.split(/\n{2,}/u)) {
    if (paragraph.length > maximum) {
      if (current) chunks.push(current);
      for (let start = 0; start < paragraph.length; start += maximum) chunks.push(paragraph.slice(start, start + maximum));
      current = '';
    } else if (!current || current.length + paragraph.length + 2 <= maximum) {
      current += `${current ? '\n\n' : ''}${paragraph}`;
    } else {
      chunks.push(current);
      current = paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function availability<T>(factory: AiFactory<T>, options?: Record<string, unknown>): Promise<string> {
  if (factory.availability) return factory.availability(options);
  if (factory.capabilities) return (await factory.capabilities(options)).available;
  return 'available';
}

export async function translateBookToHungarian(text: string, onProgress?: (completed: number, total: number) => void): Promise<TranslationResult> {
  const ai = window as TranslationWindow;
  if (!ai.LanguageDetector || !ai.Translator) throw new Error('Ez a böngésző még nem támogatja a helyi AI-fordítást. Friss Chrome böngészőben próbáld meg.');
  if ((await availability(ai.LanguageDetector)) === 'unavailable') throw new Error('A helyi nyelvfelismerő nem érhető el ezen az eszközön.');

  const detector = await ai.LanguageDetector.create();
  const sample = text.slice(0, 4000);
  const detected = (await detector.detect(sample)).sort((a, b) => b.confidence - a.confidence)[0];
  detector.destroy?.();
  const sourceLanguage = detected?.detectedLanguage?.toLowerCase() || 'und';
  if (sourceLanguage === 'hu' || sourceLanguage.startsWith('hu-')) return { text, sourceLanguage, translated: false };
  if (sourceLanguage === 'und') throw new Error('A dokumentum nyelve nem volt megbízhatóan felismerhető.');

  const options = { sourceLanguage, targetLanguage: 'hu' };
  if ((await availability(ai.Translator, options)) === 'unavailable') throw new Error(`A(z) ${sourceLanguage} → magyar helyi fordítás nem támogatott ezen az eszközön.`);
  const translator = await ai.Translator.create(options);
  const chunks = translationChunks(text);
  const translated: string[] = [];
  for (let index = 0; index < chunks.length; index += 1) {
    translated.push(await translator.translate(chunks[index]));
    onProgress?.(index + 1, chunks.length);
  }
  translator.destroy?.();
  return { text: translated.join('\n\n'), sourceLanguage, translated: true };
}
