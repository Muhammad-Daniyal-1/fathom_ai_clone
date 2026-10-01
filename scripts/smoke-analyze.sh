#!/usr/bin/env bash
# Smoke-test Groq meeting analysis without printing secrets.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local (copy from .env.example)"
  exit 1
fi

# shellcheck disable=SC1091
set -a
# shellcheck source=/dev/null
source .env.local
set +a

MODEL="${GROQ_MODEL:-openai/gpt-oss-120b}"
HDR=$(mktemp)
BODY=$(mktemp)
OUT=$(mktemp)
trap 'rm -f "$HDR" "$BODY" "$OUT"' EXIT

printf 'Authorization: Bearer %s\nContent-Type: application/json\n' "$GROQ_API_KEY" >"$HDR"

python3 - "$MODEL" "$BODY" <<'PY'
import json, sys
model = sys.argv[1]
out = sys.argv[2]
utterances = [
  {"id":"u1","speaker":"Daniyal","timestamp":"00:00","text":"Thanks everyone. Let's talk about launch."},
  {"id":"u2","speaker":"Sara","timestamp":"00:12","text":"The payment API credentials still haven't arrived."},
  {"id":"u3","speaker":"Daniyal","timestamp":"00:20","text":"I'll finish the analytics dashboard by Friday."},
  {"id":"u4","speaker":"Daniyal","timestamp":"00:28","text":"We are moving the beta launch from October 15 to October 22."},
]
system = "You are a meeting intelligence engine. Return only JSON with summary and outcomes. Cite only supplied utterance IDs."
user = "Analyze:\n" + json.dumps(utterances)
json.dump({
  "model": model,
  "temperature": 0.2,
  "response_format": {"type": "json_object"},
  "messages": [
    {"role": "system", "content": system},
    {"role": "user", "content": user},
  ],
}, open(out, "w"))
print("request ready")
PY

echo "Calling Groq..."
HTTP=$(curl -sS "https://api.groq.com/openai/v1/chat/completions" \
  -H @"$HDR" \
  --data-binary @"$BODY" \
  -o "$OUT" -w "%{http_code}")

echo "HTTP $HTTP"
python3 - "$OUT" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
content=(d.get("choices") or [{}])[0].get("message",{}).get("content","")
obj=json.loads(content)
print("purpose:", (obj.get("summary") or {}).get("purpose","")[:120])
for o in obj.get("outcomes") or []:
  print("-", o.get("type"), o.get("title"), o.get("evidenceIds"))
print("SMOKE_OK")
PY
