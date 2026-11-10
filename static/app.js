const $ = (id) => document.getElementById(id);

function setStatus(text) {
  $("status").textContent = text;
}

function showError(text) {
  const box = $("error-box");
  if (!text) {
    box.classList.add("hidden");
    box.textContent = "";
    return;
  }
  box.classList.remove("hidden");
  box.textContent = text;
}

async function loadSampleList() {
  const res = await fetch("/api/samples");
  const samples = await res.json();
  const row = $("sample-row");
  row.innerHTML = "";
  samples.forEach((sample) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = sample.title;
    button.title = sample.blurb;
    button.addEventListener("click", () => loadSample(sample.id));
    row.appendChild(button);
  });
}

async function loadSample(id) {
  const res = await fetch(`/api/samples/${id}`);
  const sample = await res.json();
  $("incoming").value = sample.incoming;
  $("source").value = sample.source;
  $("script").value = sample.script || "";
  setStatus(`Loaded: ${sample.title}`);
}

function pct(value) {
  if (typeof value !== "number") return null;
  return `${Math.round(value * 1000) / 10}%`;
}

function pickFields(extract) {
  const fields = (extract && extract.fields) || extract || {};
  return Object.entries(fields).map(([name, raw]) => {
    if (raw && typeof raw === "object") {
      return {
        name,
        value: raw.value ?? raw.text ?? null,
        start: raw.start,
        end: raw.end,
        confidence: raw.confidence,
      };
    }
    return { name, value: raw, start: null, end: null, confidence: null };
  });
}

function highlight(text, fields) {
  if (!text) return "";
  const marks = fields
    .filter((field) => Number.isInteger(field.start) && Number.isInteger(field.end) && field.end > field.start)
    .sort((a, b) => a.start - b.start);
  let cursor = 0;
  let html = "";
  marks.forEach((field) => {
    if (field.start < cursor) return;
    html += escapeHtml(text.slice(cursor, field.start));
    html += `<mark title="${escapeHtml(field.name)}">${escapeHtml(text.slice(field.start, field.end))}</mark>`;
    cursor = field.end;
  });
  html += escapeHtml(text.slice(cursor));
  return html;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderMeter(label, value) {
  const shown = typeof value === "number" ? value : 0;
  return `<div class="meter"><span>${escapeHtml(label)}</span><span>${pct(value) ?? "—"}</span></div>
    <div class="bar"><i style="width:${Math.max(0, Math.min(100, shown * 100))}%"></i></div>`;
}

function decideAnswers(decide) {
  return (decide && decide.answers) || {};
}

function renderDecide(decide) {
  const answers = decideAnswers(decide);
  const safe = answers.safe_to_pay || {};
  const human = answers.needs_human || {};
  const next = answers.next_action || {};
  const risk = answers.risk || {};
  const safeProb = typeof safe.noul === "number" ? safe.noul : safe.probability;
  const humanProb = typeof human.noul === "number" ? human.noul : human.probability;
  const probs = next.probabilities || next.choices || {};
  const riskBits = Object.entries(probs)
    .map(([key, val]) => renderMeter(key, typeof val === "number" ? val : val?.probability))
    .join("");
  return `
    ${renderMeter("Safe to pay (yes probability)", safeProb)}
    ${renderMeter("Needs a human (yes probability)", humanProb)}
    ${riskBits || renderMeter("Risk score", typeof risk.score === "number" ? risk.score / 3 : risk.noul)}
    <p>Thresholded decisions stay visible so a low-confidence yes cannot quietly clear a payment.</p>
  `;
}

function renderClaims(grounding) {
  const claims = grounding.claims || grounding.results || grounding.items || [];
  if (!Array.isArray(claims) || !claims.length) {
    return `<pre class="doc">${escapeHtml(JSON.stringify(grounding, null, 2))}</pre>`;
  }
  return claims
    .map((claim) => {
      const verdict = String(claim.verdict || claim.label || claim.status || "not_stated").toLowerCase();
      const text = claim.claim || claim.text || claim.statement || JSON.stringify(claim);
      return `<div class="claim ${escapeHtml(verdict)}"><strong>${escapeHtml(verdict)}</strong> ${escapeHtml(text)}</div>`;
    })
    .join("");
}

function renderCompare(compare) {
  const pairs = compare.pairs || compare.results || compare.comparisons || [];
  if (!Array.isArray(pairs) || !pairs.length) {
    return `<pre class="doc">${escapeHtml(JSON.stringify(compare, null, 2))}</pre>`;
  }
  return pairs
    .map((pair) => {
      const relation = pair.relation || pair.label || pair.verdict || "related";
      const left = pair.a || pair.left || pair.source || pair.passage_a || "";
      const right = pair.b || pair.right || pair.target || pair.passage_b || "";
      return `<div class="pair"><strong>${escapeHtml(relation)}</strong>
        <div>${escapeHtml(typeof left === "string" ? left : JSON.stringify(left))}</div>
        <div>${escapeHtml(typeof right === "string" ? right : JSON.stringify(right))}</div></div>`;
    })
    .join("");
}

function renderRerank(rerank) {
  const rows = rerank.results || rerank.documents || [];
  if (!Array.isArray(rows) || !rows.length) {
    return `<pre class="doc">${escapeHtml(JSON.stringify(rerank, null, 2))}</pre>`;
  }
  return rows
    .map((row) => {
      const action = row.action || "use";
      const score = row.relevance_score ?? row.document_score;
      const title = row.id || row.title || `passage ${row.index ?? ""}`;
      const text = row.text || row.document || "";
      return `<div class="passage"><strong>${escapeHtml(action)}</strong> · ${escapeHtml(String(title))}
        ${score != null ? ` · ${escapeHtml(String(score))}` : ""}
        <div>${escapeHtml(typeof text === "string" ? text : "")}</div></div>`;
    })
    .join("");
}

function renderFill(fill) {
  const fields = fill.fields || fill.record || fill;
  return `<pre class="doc">${escapeHtml(JSON.stringify(fields, null, 2))}</pre>`;
}

function renderCase(data) {
  const rec = data.recommendation || {};
  const stamp = $("stamp");
  stamp.textContent = rec.label || rec.stamp || "Reviewed";
  stamp.className = `stamp ${rec.stamp || "idle"}`;
  $("stamp-reason").textContent = rec.reason || "";

  const fields = pickFields(data.extract);
  const incomingForHighlight = $("incoming").value;
  const panels = [
    {
      title: "Recommended action",
      api: rec.source || "citedesk",
      html: `<p>${escapeHtml(rec.reason || "")}</p><p>Endpoints used: ${(data.used_endpoints || []).join(", ")}</p>`,
    },
    {
      title: "Protect — masked copy shown to the desk",
      api: "POST /clocked/pii",
      html: `<pre class="doc">${highlight(data.safe_text || incomingForHighlight, fields)}</pre>`,
    },
    {
      title: "Guard — override language",
      api: "POST /clocked/injection",
      html: `<p>${data.injection_flagged ? "Flagged. Approve is withheld." : "No override language flagged."}</p>
        <pre class="doc">${escapeHtml(JSON.stringify(data.injection || {}, null, 2))}</pre>`,
    },
    {
      title: "Extract — values cited back to the source",
      api: "POST /clocked/extract",
      html: `<div class="fields">${fields
        .map(
          (field) => `<div class="field"><b>${escapeHtml(field.name)}</b>
          <em>${escapeHtml(field.value ?? "not stated")}</em>
          ${field.confidence != null ? `<div>${escapeHtml(String(field.confidence))}</div>` : ""}</div>`
        )
        .join("")}</div>
        <pre class="doc">${highlight(incomingForHighlight, fields)}</pre>`,
    },
    {
      title: "Fill — case record",
      api: "POST /clocked/fill",
      html: renderFill(data.fill || {}),
    },
    {
      title: "Decide — probabilities, not a quiet yes",
      api: "POST /clocked/decide",
      html: renderDecide(data.decide || {}),
    },
    {
      title: "Verify — claims against the purchase order",
      api: "POST /clocked/grounding",
      html: renderClaims(data.grounding || {}),
    },
    {
      title: "Compare — incoming vs source of truth",
      api: "POST /clocked/compare",
      html: renderCompare(data.compare || {}),
    },
    {
      title: "Rerank — what the reviewer should read first",
      api: "POST /clocked/rerank",
      html: renderRerank(data.rerank || {}),
    },
  ];

  if (data.script) {
    panels.splice(3, 0, {
      title: "Inspect — attached script",
      api: "POST /clocked/script",
      html: `<pre class="doc">${escapeHtml(JSON.stringify(data.script, null, 2))}</pre>`,
    });
  }

  $("panels").innerHTML = panels
    .map(
      (panel) => `<article class="card"><h2>${escapeHtml(panel.title)}<span>${escapeHtml(panel.api)}</span></h2>
        ${panel.html}</article>`
    )
    .join("");
}

async function runReview() {
  showError("");
  const incoming = $("incoming").value.trim();
  const source = $("source").value.trim();
  if (!incoming || !source) {
    showError("Paste both an incoming document and a source of truth.");
    return;
  }
  const button = $("review-btn");
  button.disabled = true;
  setStatus("Asking Clocked…");
  try {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incoming,
        source,
        script: $("script").value,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showError(data.error || "Review failed.");
      setStatus("Stopped");
      return;
    }
    renderCase(data);
    setStatus("Desk updated from live Clocked responses.");
  } catch (err) {
    showError(String(err));
    setStatus("Stopped");
  } finally {
    button.disabled = false;
  }
}

$("review-btn").addEventListener("click", runReview);
loadSampleList().then(() => loadSample("bank_swap")).catch((err) => showError(String(err)));
