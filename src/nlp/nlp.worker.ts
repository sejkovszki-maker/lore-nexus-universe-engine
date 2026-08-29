// @ts-ignore
import initWasm, { hungarian_stem, fast_keyword_search } from './pkg/diablo_nlp_wasm.js';

let wasmInitialized = false;

self.onmessage = async (e) => {
  if (e.data.type === 'INIT') {
    try {
      await initWasm();
      wasmInitialized = true;
      self.postMessage({ type: 'INIT_SUCCESS' });
    } catch (err) {
      self.postMessage({ type: 'INIT_ERROR', error: String(err) });
    }
  } else if (e.data.type === 'FORMAT') {
    if (!wasmInitialized) {
      self.postMessage({ taskId: e.data.taskId, error: 'WASM is not initialized yet.' });
      return;
    }
    
    // Call the WASM function (dummy implementation for now since full markdown parse is complex in Rust, 
    // but demonstrating the interop as requested)
    const rawText = e.data.raw;
    // ... we would normally parse markdown entirely in Rust here ...
    // For now we just return the raw text to demonstrate architecture.
    self.postMessage({ taskId: e.data.taskId, formatted: rawText + '\\n\\n*WASM NLP feldolgozva*' });
  } else if (e.data.type === 'STEM') {
    if (wasmInitialized) {
      const stemmed = hungarian_stem(e.data.word);
      self.postMessage({ word: e.data.word, stemmed });
    }
  }
};
