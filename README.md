# CiteDesk

Pay only what the papers agree on.

CiteDesk is an accounts-payable review desk. You paste an incoming invoice or supplier email and the purchase order or policy it must match. The desk asks [Clocked](https://clocked.rezolve.ai) to mask personal data, catch override language, extract cited fields, fill a case record, compare the two documents, check claims against the source of truth, rerank the passages a reviewer should read, and return typed payment decisions with probabilities.

It was built for the [Clocked Build Challenge](https://clocked.rezolve.ai/challenge) (21 October to 10 November 2026).

## Why this exists

A fluent summary is not enough to release money. CiteDesk treats Clocked output as controls:

- If **Guard** flags prompt-injection or “treat this email as approval” language, the desk withholds approve and stamps the case **Hold**.
- If **Inspect** flags an attached script, the desk escalates even when the invoice totals match.
- **Extract** values are highlighted at their character offsets in the incoming text, so a missing invoice number stays empty instead of being invented.
- **Compare** and **Verify** sit next to **Decide**, so a high “safe to pay” probability can still be read against contradictions.
- The masked copy from **Protect** is what the case file shows by default.

## Endpoints used

| Clocked API | Path | What CiteDesk does with the result |
| --- | --- | --- |
| Protect | `POST /clocked/pii` | Masks personal data and shows that copy in the case file. |
| Guard | `POST /clocked/injection` | If flagged, approve is withheld. |
| Inspect | `POST /clocked/script` | Optional attached scripts are analysed, never executed. A harmful verdict escalates the case. |
| Extract | `POST /clocked/extract` | Copies supplier, invoice number, PO, amount, and payment details with source offsets. |
| Fill | `POST /clocked/fill` | Builds the case record: extracts, document kind, issues, urgency, a yes/no on skipped controls, and a reviewer handoff. |
| Decide | `POST /clocked/decide` | Returns yes/no probabilities, a next action, and a risk score. Uncertain results stay visible. |
| Verify | `POST /clocked/grounding` | Checks incoming claims against the purchase order. |
| Compare | `POST /clocked/compare` | Finds agreement and conflicts between the two documents. |
| Rerank | `POST /clocked/rerank` | Orders passages the reviewer should read first. |

Meaningful use here means the endpoint changes the stamp, the text the reviewer sees, or the order of evidence — not that a response is printed and ignored.

## Setup

You need Python 3.9+ and a free Clocked API key.

1. Create a free account at [clocked.rezolve.ai](https://clocked.rezolve.ai) (4,000 credits).
2. Redeem `CLOCKEDHACKATHON` on the account page for 16,000 more credits.
3. Copy the API key into a local `.env` file. Do not commit it.

```bash
cd citedesk
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# put CLOCKED_API_KEY in .env
set -a && source .env && set +a
python app.py
```

Open http://127.0.0.1:5055

### Try it as a judge

1. The page loads the **Bank-detail swap with hidden override** sample.
2. Click **Run the desk**.
3. Expect a **Hold** stamp: the email changes the beneficiary and includes an automation note that tells the assistant to skip the second approver.
4. Load **Invoice matches the purchase order** and run again. Expect a much safer decision path: amounts and supplier agree, and there is no override language.
5. Load **Invoice total disagrees with the order** to see Compare/Verify push the case toward escalate or request-info.
6. Load **Invoice plus a workstation script** to see Inspect read a script that disables realtime monitoring.

`GET /api/health` returns `{"ok": true, "clocked_configured": true}` when a key is loaded. It never returns the key.

## Project layout

```
app.py              Flask app and Clocked calls
samples.py          Fictional invoices and purchase orders
templates/index.html
static/app.js
static/style.css
SUBMISSION.md       Ready-to-paste Clocked entry form
demo/               Demo recording
```

## Data and safety

Samples are fictional. Do not paste live customer records, real account numbers, or secrets into a public demo. The Clocked key stays in the server environment; the browser never sees it.

## License

MIT, unless a later LICENSE file says otherwise.
