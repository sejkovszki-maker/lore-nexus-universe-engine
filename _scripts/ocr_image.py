import argparse, json, pathlib, sys
parser = argparse.ArgumentParser(); parser.add_argument("image"); parser.add_argument("--dependencies", required=True); args = parser.parse_args()
sys.path.insert(0, str(pathlib.Path(args.dependencies).resolve()))
from rapidocr_onnxruntime import RapidOCR
engine = RapidOCR(); result, elapsed = engine(args.image); lines = result or []
texts = [line[1] for line in lines]; confidences = [float(line[2]) for line in lines]
print(json.dumps({"processorId": "rapidocr-onnxruntime", "processorVersion": "1.4.4", "text": "\n".join(texts), "confidence": sum(confidences) / len(confidences) if confidences else 0.0, "lineCount": len(lines), "elapsedSeconds": elapsed}))
