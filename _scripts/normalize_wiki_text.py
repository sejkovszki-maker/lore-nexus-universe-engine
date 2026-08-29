"""One-shot, deterministic cleanup for the legacy wiki article corpus."""

from pathlib import Path
import re

from ftfy import fix_text


SOURCE = Path(__file__).parents[1] / "src" / "data" / "wikiArticles.ts"


def normalize(text: str) -> str:
    text = fix_text(text)
    text = text.replace("í\x81", "Á").replace("Ĺ\x90", "Ő")

    # Legacy JavaScript chapter buttons become structured, safe wiki links.
    text = re.sub(
        r'<button\s+onclick="openWikiArticle\(\'([^\']+)\'\)"[^>]*>(.*?)</button>',
        lambda match: f'<p>[[{match.group(1)}|{strip_tags(match.group(2))}|references]]</p>',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    text = re.sub(
        r'<a\s+href="#"\s+onclick="openWikiArticle\(\'([^\']+)\'\);\s*return false;"[^>]*>(.*?)</a>',
        lambda match: f'[[{match.group(1)}|{strip_tags(match.group(2))}|references]]',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    text = re.sub(
        r'<a\s+href=\\?"#\\?"\s+onclick=\\?"openWikiArticle\(\'([^\']+)\'\);\s*return false;\\?"[^>]*>(.*?)</a>',
        lambda match: strip_tags(match.group(2)),
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    text = re.sub(
        r'<div\s+onclick=\\"openWikiArticle\(\'([^\']+)\'\)\\".*?<span[^>]*>(.*?)</span>\\n\s*</div>',
        lambda match: f'<p>[[{match.group(1)}|{strip_tags(match.group(2))}|references]]</p>',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )

    # Safe Hungarian typography fixes that do not alter lore terminology.
    replacements = {
        'đź"– Olvasás megkezdése:': "Olvasás megkezdése:",
        'đź"® Öröksége & Hatása': "Öröksége és hatása",
        'đź"® A Nekromanták Mestere': "A nekromanták mestere",
        "Kapcsolódó Szócikkek (Lore Hálózat)": "Kapcsolódó szócikkek",
        "Honnan tudod, hogy a Fénynek nem</p>\n<p>?? ez volt-e": "Honnan tudod, hogy a Fénynek nem ez volt-e",
        "Menedék Teremtőanyja": "Menedék teremtőanyja",
        "Lilith-et": "Lilith-et",
        "Prime Evilök": "főgonoszok",
        "Lesser Evilök": "kisebb gonoszok",
        "Soulstone-ok": "lélekkövek",
        "Worldstone-t": "Világkövet",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    return text


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]+>", "", value).strip()


if __name__ == "__main__":
    original = SOURCE.read_text(encoding="utf-8-sig")
    cleaned = normalize(original)
    SOURCE.write_text(cleaned, encoding="utf-8", newline="\n")
    print({"file": str(SOURCE), "changed": original != cleaned, "characters": len(cleaned)})
