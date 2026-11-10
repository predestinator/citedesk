# Clocked Build Challenge — submission copy for CiteDesk

Entries go through the form on https://clocked.rezolve.ai/challenge
One entry per Clocked account, editable until 11:59 p.m. Eastern Time on 10 November 2026
(that is 10:29 a.m. IST on 11 November 2026). The latest saved version is judged.

A Clocked account is required to submit. Create one, redeem `CLOCKEDHACKATHON`, then paste the fields below.

Do not create a public GitHub repository or post on LinkedIn until Sahil says so. Repos go under Predestinator.

---

## 1. Project name

CiteDesk

## 2. Overview

CiteDesk is an accounts-payable review desk. It reads an incoming invoice or supplier email against a purchase order, then uses Clocked to mask personal data, catch override language, extract cited fields, compare the two documents, verify claims, rerank the evidence a reviewer should read, and return a typed next action with probabilities. If Guard flags injection, the desk will not offer an approve path.

## 3. Audience / problem

Accounts-payable and ops reviewers who are asked to release payment from messy supplier email. Fluent summaries hide the two failures that matter: a total that does not match the purchase order, and language that tries to skip a second approver or change a beneficiary. CiteDesk makes those Clocked findings the thing the desk acts on.

## 4. Working demo

- Local app: `python app.py` then http://127.0.0.1:5055 (needs `CLOCKED_API_KEY`)
- Demo video: `demo/citedesk-demo.mp4` (also `demo/citedesk-demo.gif` if present)
- No hosted URL yet. Hosting is optional; a short demo video is enough. A new Render (or other) sign-in is needed only if we want a public live URL.

## 5. Public source repository

Local only for now: `/workspace/ships/citedesk` (git initialized, not pushed).

After Sahil approves, publish under his Predestinator GitHub account and paste that URL here. Keep `.env` out of the repo. The README has setup instructions and “do this, see that” review steps.

## 6. How you used Clocked

CiteDesk calls nine Clocked endpoints. Each one changes what the desk shows or whether payment can be cleared:

- **Protect (`/clocked/pii`)** — masks personal data; the case file shows the masked copy.
- **Guard (`/clocked/injection`)** — screens the incoming text as untrusted content. A flag withholds approve and stamps the case Hold.
- **Inspect (`/clocked/script`)** — analyses an optional attached script without running it. A harmful verdict escalates the case.
- **Extract (`/clocked/extract`)** — copies supplier, invoice number, PO, amount, and payment details with character offsets, then highlights them in the source.
- **Fill (`/clocked/fill`)** — writes the case record (extract, choice, multiselect, score, yes/no, generated handoff).
- **Decide (`/clocked/decide`)** — yes/no probabilities for “safe to pay” and “needs a human”, a next-action choice, and a risk score. Thresholds stay visible.
- **Verify (`/clocked/grounding`)** — checks incoming claims against the purchase order.
- **Compare (`/clocked/compare`)** — reports agreement and conflicts between the two documents.
- **Rerank (`/clocked/rerank`)** — orders passages the reviewer should read first.

The recommended stamp is not a caption on top of ignored JSON. Guard can block approve; Inspect can force an escalate; Decide supplies the default next action when those guards are quiet.

## 7. Team

- Name: Sahil Bhalerao
- Email: sahil.netwin@gmail.com
- GitHub: Predestinator
- Team size: 1

(Adjust the email if he wants the Clocked account on a different address.)

## 8. Award categories to select

Select all four judged awards:

- Best Overall App
- Best Use of Decide, Extract, or Fill
- Best Use of Protect, Guard, or Inspect
- Best Use of Verify, Compare, or Rerank

People’s Choice is optional and needs one public LinkedIn post that @mentions the official Clocked page, includes `#ClockedChallenge`, and links to the demo or write-up. No social post is required to enter the judged awards. Skip People’s Choice unless Sahil wants to post.

## Form notes

The live form is “six short steps” on the challenge page. If a label differs slightly, map as follows:

- Project name → CiteDesk
- Overview / short description → section 2
- Audience / problem → section 3
- Demo link or short demo video → section 4
- Public repository → section 5
- How you used Clocked → section 6
- Team name, email, GitHub handle → section 7
- Awards → section 8
