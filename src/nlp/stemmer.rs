use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hungarian_stem(word: &str) -> String {
    let mut w = word.to_lowercase();
    
    // Alapvető magyar többes szám és birtokos ragok eltávolítása (egyszerűsített NLP)
    let suffixes = ["nak", "nek", "ból", "ből", "ról", "ről", "tól", "től", "hoz", "hez", "höz", 
                    "val", "vel", "ban", "ben", "ba", "be", "ra", "re", "ig", "ért", "vá", "vé", 
                    "ul", "ül", "ot", "et", "öt", "at", "t", "ok", "ek", "ök", "ak", "k", "ja", "je"];
                    
    for suffix in suffixes.iter() {
        if w.ends_with(suffix) {
            let len = w.len() - suffix.len();
            w.truncate(len);
            break;
        }
    }
    
    // Magánhangzó rövidülés visszaállítása (pl. á -> a, ha a szóvégen történt)
    // Ez egy nagyon egyszerűsített logika a WASM teljesítmény demózására.
    if w.ends_with('á') {
        w.pop();
        w.push('a');
    } else if w.ends_with('é') {
        w.pop();
        w.push('e');
    }

    w
}

#[wasm_bindgen]
pub fn fast_keyword_search(text: &str, keywords: &js_sys::Array) -> js_sys::Array {
    let result = js_sys::Array::new();
    let text_lower = text.to_lowercase();
    
    for i in 0..keywords.length() {
        if let Some(kw) = keywords.get(i).as_string() {
            if text_lower.contains(&kw.to_lowercase()) {
                result.push(&JsValue::from_str(&kw));
            }
        }
    }
    
    result
}
