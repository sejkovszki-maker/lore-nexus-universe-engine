import argparse, json, pdfplumber

parser = argparse.ArgumentParser()
parser.add_argument("path")
parser.add_argument("--max-pages", type=int, default=0)
args = parser.parse_args()

pages = []
with pdfplumber.open(args.path) as document:
    limit = len(document.pages) if args.max_pages <= 0 else min(len(document.pages), args.max_pages)
    for index in range(limit):
        page = document.pages[index]
        pages.append({"pageNumber": index + 1, "text": page.extract_text() or "", "method": "native"})
    print(json.dumps({"processorId": "pdfplumber", "processorVersion": pdfplumber.__version__, "pages": pages, "metadata": {"pageCount": len(document.pages), "processedPages": limit}}))
