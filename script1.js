// script.js
// Assumes QUESTION_BANK is available (from questions.js)
(function () {
  // DOM
  const yearEl = document.getElementById("yr"); if(yearEl) yearEl.textContent = new Date().getFullYear();

  const startBtn = document.getElementById("startTestBtn");
  const classSelect = document.getElementById("classSelect");
  const subjSelect = document.getElementById("subjectSelect");
  const testArea = document.getElementById("testArea");
  const quizForm = document.getElementById("quizForm");
  const questionWrap = document.getElementById("questionWrap");
  const qNum = document.getElementById("qNum");
  const qTotal = document.getElementById("qTotal");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const reportArea = document.getElementById("reportArea");
  const reportSummary = document.getElementById("reportSummary");
  const topicAnalysis = document.getElementById("topicAnalysis");
  const detailedAnswers = document.getElementById("detailedAnswers");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");
  const restartBtn = document.getElementById("restartBtn");
  const studentNameInput = document.getElementById("studentName");

  // State
  let currentQuestions = [];
  let answers = {}; // qId -> selectedIndex
  let currentIndex = 0;
  const TEST_SIZE = 10;

  function pickQuestions(selectedClass, selectedSubject) {
    // Filter question bank
    const pool = QUESTION_BANK.filter(q => q.class === String(selectedClass) && q.subject === selectedSubject);
    // If pool smaller than TEST_SIZE, use all and allow duplicates? We'll just shuffle and slice up to pool length.
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    // If pool < TEST_SIZE, we'll reuse some random questions to reach 10
    if (shuffled.length >= TEST_SIZE) return shuffled.slice(0, TEST_SIZE);
    // else fill with repeats (unlikely when you expand bank)
    const out = shuffled.slice();
    while (out.length < TEST_SIZE) {
      out.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return out;
  }

  function renderQuestion(idx) {
    const q = currentQuestions[idx];
    qNum.textContent = idx + 1;
    qTotal.textContent = currentQuestions.length;
    questionWrap.innerHTML = "";

    const card = document.createElement("div");
    card.className = "question-card";

    const qText = document.createElement("div");
    qText.className = "question-text";
    qText.textContent = q.q;
    card.appendChild(qText);

    const options = document.createElement("div");
    options.className = "options";

    q.options.forEach((opt, oi) => {
      const optWrap = document.createElement("label");
      optWrap.className = "option";
      if (answers[q.id] === oi) optWrap.classList.add("selected");

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = q.id;
      radio.value = oi;
      radio.checked = (answers[q.id] === oi);
      radio.addEventListener("change", () => {
        answers[q.id] = parseInt(radio.value, 10);
        // mark selected visually
        Array.from(options.children).forEach((el, i) => {
          el.classList.toggle("selected", i === oi);
        });
      });

      optWrap.appendChild(radio);
      const txt = document.createElement("span");
      txt.textContent = opt;
      optWrap.appendChild(txt);

      options.appendChild(optWrap);
    });

    card.appendChild(options);
    questionWrap.appendChild(card);
    // smooth scroll into view
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function startTest() {
    const cls = classSelect.value;
    const sub = subjSelect.value;
    currentQuestions = pickQuestions(cls, sub);
    answers = {};
    currentIndex = 0;
    renderQuestion(currentIndex);
    testArea.classList.remove("hidden");
    reportArea.classList.add("hidden");
    // reset form scroll
    window.scrollTo({ top: testArea.offsetTop - 40, behavior: "smooth" });
  }

  function showPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion(currentIndex);
    }
  }
  function showNext() {
    if (currentIndex < currentQuestions.length - 1) {
      currentIndex++;
      renderQuestion(currentIndex);
    }
  }

  function evaluate() {
    let correct = 0;
    const topicTotals = {}; // topic -> {total, correct}
    const detailed = [];

    currentQuestions.forEach((q, i) => {
      const selected = typeof answers[q.id] === "number" ? answers[q.id] : null;
      const isCorrect = selected === q.answer;
      if (isCorrect) correct++;
      // topic counts
      if (!topicTotals[q.topic]) topicTotals[q.topic] = { total: 0, correct: 0 };
      topicTotals[q.topic].total++;
      if (isCorrect) topicTotals[q.topic].correct++;

      detailed.push({
        qIndex: i + 1, id: q.id, qtext: q.q, options: q.options,
        answer: q.answer, selected
      });
    });

    const scorePct = Math.round((correct / currentQuestions.length) * 100);
    return { correct, total: currentQuestions.length, scorePct, topicTotals, detailed };
  }

  function renderReport(result) {
    testArea.classList.add("hidden");
    reportArea.classList.remove("hidden");

    const studentName = studentNameInput.value || "Anonymous";
    const cls = classSelect.value;
    const subj = subjSelect.value;

    reportSummary.innerHTML = `
      <div><strong>Name:</strong> ${escapeHtml(studentName)}</div>
      <div><strong>Class:</strong> ${cls}</div>
      <div><strong>Subject:</strong> ${subj.charAt(0).toUpperCase() + subj.slice(1)}</div>
      <div style="margin-top:8px"><strong>Score:</strong> ${result.correct} / ${result.total} (${result.scorePct}%)</div>
    `;

    // topic analysis
    topicAnalysis.innerHTML = "";
    const weak = [];
    const good = [];
    Object.keys(result.topicTotals).forEach(topic => {
      const t = result.topicTotals[topic];
      const pct = Math.round((t.correct / t.total) * 100);
      const pill = document.createElement("div");
      pill.className = "topic-pill " + (pct < 50 ? "weak" : "good");
      pill.textContent = `${formatTopicName(topic)} — ${pct}% (${t.correct}/${t.total})`;
      topicAnalysis.appendChild(pill);
      if (pct < 50) weak.push(topic);
      else good.push(topic);
    });

    // recommendations
    const rec = document.createElement("div");
    rec.style.marginTop = "10px";
    if (weak.length === 0) {
      rec.innerHTML = `<strong>Recommendation:</strong> Good work! Keep practicing to maintain strengths.`;
    } else {
      rec.innerHTML = `<strong>Recommendation:</strong> Focus revision on: ${weak.map(t => formatTopicName(t)).join(", ")}. Try topic-wise practice and watch short revision videos for those topics.`;
    }
    topicAnalysis.appendChild(rec);

    // detailed answers
    detailedAnswers.innerHTML = "";
    result.detailed.forEach(d => {
      const block = document.createElement("div");
      block.className = "q-block";

      const title = document.createElement("div");
      title.className = "q-title";
      title.textContent = `${d.qIndex}. ${d.qtext}`;
      block.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "q-meta";
      const ansText = d.options[d.answer];
      const selText = (d.selected === null || d.selected === undefined) ? "No answer" : d.options[d.selected];
      meta.innerHTML = `<div>Correct answer: <strong>${escapeHtml(ansText)}</strong></div>
                        <div>Your answer: <strong>${escapeHtml(selText)}</strong></div>`;
      block.appendChild(meta);

      detailedAnswers.appendChild(block);
    });

    // hook PDF download
    downloadPdfBtn.onclick = function () { generatePdfReport(result); };
    restartBtn.onclick = resetToControls;
    // scroll to report
    window.scrollTo({ top: reportArea.offsetTop - 20, behavior: "smooth" });
  }

  function generatePdfReport(result) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = 60;
    const lineHeight = 16;
    const studentName = studentNameInput.value || "Anonymous";
    const cls = classSelect.value;
    const subj = subjSelect.value;

    doc.setFontSize(16);
    doc.text("Kalam STEM Kits — Test Report", margin, y);
    y += 28;
    doc.setFontSize(11);
    doc.text(`Name: ${studentName}`, margin, y); y += lineHeight;
    doc.text(`Class: ${cls}`, margin, y); y += lineHeight;
    doc.text(`Subject: ${subj}`, margin, y); y += lineHeight;
    doc.text(`Score: ${result.correct} / ${result.total} (${result.scorePct}%)`, margin, y); y += (lineHeight + 6);

    doc.setFontSize(12);
    doc.text("Topic Analysis:", margin, y); y += lineHeight;
    Object.keys(result.topicTotals).forEach(topic => {
      const t = result.topicTotals[topic];
      const pct = Math.round((t.correct / t.total) * 100);
      doc.text(`- ${formatTopicName(topic)} : ${pct}% (${t.correct}/${t.total})`, margin + 10, y);
      y += lineHeight;
      if (y > 720) { doc.addPage(); y = 60; }
    });

    y += 8;
    doc.setFontSize(12);
    doc.text("Recommendations:", margin, y); y += lineHeight;
    const weakList = Object.keys(result.topicTotals).filter(t => {
      const x = result.topicTotals[t]; return Math.round((x.correct / x.total) * 100) < 50;
    });
    const recText = weakList.length ? `Focus on: ${weakList.map(formatTopicName).join(", ")}` : "No specific weak topics detected. Keep practicing.";
    // wrap text if long
    const split = doc.splitTextToSize(recText, 520);
    doc.text(split, margin + 6, y); y += (split.length * lineHeight);

    // add detailed q/answers header
    y += 8;
    doc.setFontSize(12);
    doc.text("Detailed Answers:", margin, y); y += lineHeight;
    doc.setFontSize(10);

    result.detailed.forEach(d => {
      const qline = `${d.qIndex}. ${d.qtext}`;
      const qsplit = doc.splitTextToSize(qline, 520);
      doc.text(qsplit, margin, y);
      y += (qsplit.length * lineHeight);
      const ansLine = `Correct: ${d.options[d.answer]} | Your answer: ${ (d.selected===null||d.selected===undefined) ? "No answer" : d.options[d.selected] }`;
      const s2 = doc.splitTextToSize(ansLine, 520);
      doc.text(s2, margin + 8, y); y += (s2.length * lineHeight) + 6;
      if (y > 720) { doc.addPage(); y = 60; }
    });

    const fileName = `TestReport_${studentName.replace(/\s+/g, "_")}_${subj}_C${cls}.pdf`;
    doc.save(fileName);
  }

  function resetToControls() {
    reportArea.classList.add("hidden");
    testArea.classList.add("hidden");
    // keep controls visible
  }

  // util
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function formatTopicName(t){ return t.replace(/[-_]/g," ").replace(/\b\w/g, c => c.toUpperCase()); }

  // events
  startBtn.addEventListener("click", startTest);
  prevBtn.addEventListener("click", showPrev);
  nextBtn.addEventListener("click", showNext);

  // navigation between q using form next/prev
  quizForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // evaluate
    const result = evaluate();
    renderReport(result);
  });

  // keyboard navigation: left / right
  document.addEventListener("keydown", (e) => {
    if (testArea.classList.contains("hidden")) return;
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });

  // Initialize small UI: show total when test active
  // When a radio changes we allow navigation auto
  // Also reflect next/prev button visibility for first/last
  const origRenderQuestion = renderQuestion;
  renderQuestion = function(idx){
    origRenderQuestion(idx);
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === currentQuestions.length - 1;
  };

  // expose for debugging (optional)
  window._TEST_APP = {
    pickQuestions, evaluate
  };

})();
