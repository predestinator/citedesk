# Clocked Build Challenge — submission copy for CiteDesk

Paste these values into the form on https://clocked.rezolve.ai/challenge
(sign in with the Clocked account first). One entry per account, editable until
11:59 p.m. Eastern Time on 10 November 2026 (10:29 a.m. IST on 11 November 2026).
The latest saved version is judged.

The live form is six steps. Field names below match the labels and JSON keys
in the challenge page script (`demoUrl`, `repoUrl`, `writeupUrl`, `linkedinUrl`,
`endpoints`, `awards`, `integration`, `learned`, `team`, `agreed`).

There is no file upload and no requirement to host the app. `demoUrl` accepts
any `https` link to a working application **or** a short video of it in use.
YouTube, Loom, and Drive are not required. A GitHub URL to the demo video is enough.
Keep the demo link and the public repository reachable through 18 November 2026.

Do not put the Clocked API key anywhere on this form.

---

## Step 1 — The project

### Project name (`name`, required, max 120)

CiteDesk

### Overview (`overview`, required, max 2,000)

CiteDesk is an accounts-payable review desk for people who release payment from supplier email. You paste the incoming invoice or email and the purchase order it must match. The desk asks Clocked to mask personal data, catch override language, inspect an attached script, extract cited fields, fill a case record, compare the two documents, verify claims, rerank the passages a reviewer should read, and return a typed next action with probabilities. If Guard flags injection, CiteDesk will not offer an approve path. On the live Clocked API, a bank-detail-swap email with a hidden “treat this as finance-director approval” note stamped Hold (Guard: injection 99.3%, instruction override, critical). A matching invoice stamped Clear to pay (Decide next action: approve 82%; Compare: clean; risk 0.13/3).

*(character count: 803)*

---

## Step 2 — Where to see it

Hint on the form: “A demo and the source are required. Keep both reachable through November 18.”

### Demo (`demoUrl`, required, https URL)

https://github.com/predestinator/citedesk/blob/main/demo/citedesk-demo.mp4

Small print: “A working application, or a short video of it in use.”
This is the 80-second recording of the live desk reviewing the bank-swap (Hold)
and matching-invoice (Clear to pay) samples against the real Clocked API.

A hosted live app URL is **not** required. If you later deploy one, you can
swap this field for that URL and keep the video as optional write-up context.

### Public source repository (`repoUrl`, required, https URL)

https://github.com/predestinator/citedesk

Small print: “With setup instructions and its development history.”

### Write-up (`writeupUrl`, optional, https URL)

https://github.com/predestinator/citedesk/blob/main/README.md

Small print: “Optional. A README, or a post on DEV, Hashnode, Medium, or your blog.”

---

## Step 3 — How it uses Clocked

### Endpoints the project calls (`endpoints`, required, pick every one used)

Select all nine:

- Decide (`decide`)
- Extract (`extract`)
- Fill (`fill`)
- Protect (pii) (`pii`)
- Guard (injection) (`injection`)
- Inspect (script) (`script`)
- Verify (grounding) (`grounding`)
- Compare (`compare`)
- Rerank (`rerank`)

### The integration (`integration`, required, max 3,000)

CiteDesk calls all nine Clocked endpoints, and each result changes the stamp, the text a reviewer sees, or the order of evidence.

Protect (POST /clocked/pii) returns anonymized_text plus typed entities. The case file shows that masked copy by default. On the live bank-swap sample Clocked masked 8 entities (3 emails, 2 bank accounts, 1 person, 1 phone, 1 address).

Guard (POST /clocked/injection) returns a verdict (injection or benign), category, severity, an injection probability, and quoted evidence. If the verdict is injection, CiteDesk withholds every approve path and stamps Hold — override language. Live bank-swap: verdict injection, category “instruction override”, severity critical, probability 99.3%, quoting the hidden automation note. Live matching invoice: verdict benign, 1.2%. If Guard errors, the desk refuses to auto-approve.

Inspect (POST /clocked/script) runs only when a script is attached, and is never executed. A malicious verdict forces Escalate — attached script even when the invoice matches the PO. Live script sample: verdict malicious, category “security blinding or EDR evasion”, severity high, malicious 99.2%, evidence on Set-MpPreference -DisableRealtimeMonitoring $true. If Inspect errors, payment stays with a human.

Extract (POST /clocked/extract) copies supplier, invoice number, PO, amount, beneficiary, account number and due date with start/end offsets and confidence, then highlights those spans. A missing value stays empty instead of being invented. Live matching invoice: INV-4410, PO-7714, GBP 2,900, Northstar Devices Ltd., all at 100% confidence.

Fill (POST /clocked/fill) writes the case record: extracts, document kind, issues, urgency, whether the text asks to skip controls, and a two-sentence reviewer handoff.

Decide (POST /clocked/decide) returns yes/no probabilities for “safe to pay” and “needs a human” (thresholds stay visible), a next-action choice (approve, block, escalate, request_info), and a 0–3 risk score. When Guard and Inspect are quiet, that next_action becomes the stamp. On the matching invoice, safe_to_pay was 81.1% against a 0.85 cutoff (boolean false) while next_action was approve at 82% with risk 0.13/3. The desk stamped Clear to pay from next_action.

Compare (POST /clocked/compare) reports clean vs conflicts between invoice and purchase order. Verify (POST /clocked/grounding) checks incoming claims against the PO (supported, contradicted, not_stated). Both sit next to Decide. Live bank-swap: Compare conflicts, Verify contradicted (3 contradicted, 3 supported, 14 not stated). Live matching invoice: Compare clean, Verify partially_grounded (8 supported, 4 not stated).

Rerank (POST /clocked/rerank) orders passages from both documents so the reviewer reads the most relevant lines first.

The stamp is a control, not a caption on ignored JSON: Guard can block approve, Inspect can force an escalate, and Decide supplies the default next action only when those guards are quiet.

*(character count: 2975)*

### What you learned (`learned`, optional, max 2,000)

Two response-shape details mattered more than the happy-path docs suggested. Protect’s live field is anonymized_text (not text or anonymized), and Guard/Inspect are verdict-first: an injection score of 1.2% is benign, while verdict=injection plus category, severity and quoted evidence is what should withhold payment. Treating a raw probability as the only signal would have been noisier.

Decide’s yes/no thresholds are honest and visible. On a matching invoice, safe_to_pay was 81.1% against a 0.85 cutoff (decision false) while next_action was approve at 82% with risk 0.13/3. CiteDesk stamps from next_action when Guard and Inspect are quiet, and still shows the unmet yes/no cutoff so a reviewer can see Clocked was not silently sure.

Per-endpoint try/except matters in a nine-call desk: one timeout should not blank the page, and a failed Guard or Inspect must never degrade into auto-approve.

*(character count: 901)*

---

## Step 4 — Awards

Enter for as many as fit. A group award needs at least one of its three endpoints.
CiteDesk uses all three in each group, so all four judged awards are valid.

Select:

- Best Overall App (`overall`, $600)
- Best Use of Decide, Extract, or Fill (`decide-extract-fill`, $400)
- Best Use of Protect, Guard, or Inspect (`protect-guard-inspect`, $400)
- Best Use of Verify, Compare, or Rerank (`verify-compare-rerank`, $400)

Leave **People’s Choice** (`peoples-choice`, $200) unchecked unless you publish
one public LinkedIn post that shows the application, tags the Clocked LinkedIn
page, and includes `#ClockedChallenge`, then paste that post URL below.

### People’s Choice post on LinkedIn (`linkedinUrl`, optional, must be a linkedin.com https URL)

Leave empty.

Without a LinkedIn URL the entry is not in the People’s Choice vote. No social
post is required for the four judged awards.

---

## Step 5 — The team

One member:

| Field | Value |
| --- | --- |
| Name (`team[0].name`, required, max 80) | Sahil Bhalerao |
| Email (`team[0].email`, required) | sahil.netwin@gmail.com |
| GitHub handle (`team[0].github`, optional) | predestinator |

---

## Step 6 — Agreement (`agreed`, required checkbox)

Check: “Every team member is eligible and agrees to the official rules, including the license to feature the project in coverage of the challenge.”

Then click **Submit entry** (or **Save changes** if you are editing).
