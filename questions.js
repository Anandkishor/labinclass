let questions = [
  { question: "5 + 7 = ?", options: ["10", "11", "12", "13"], answer: "12", subject: "Maths", topic: "Addition" },
  { question: "The unit of force is?", options: ["Newton", "Joule", "Watt", "Pascal"], answer: "Newton", subject: "Physics", topic: "Units" },
  { question: "12 - 4 = ?", options: ["6", "7", "8", "9"], answer: "8", subject: "Maths", topic: "Subtraction" },
  { question: "Acceleration due to gravity is?", options: ["9.8 m/s²", "10 m/s²", "9 m/s²", "8.8 m/s²"], answer: "9.8 m/s²", subject: "Physics", topic: "Gravity" }
];

let currentQuestion = 0;
let score = 0;
let answers = [];
let studentName = "";

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");

// ---------- Start Quiz ----------
function startQuiz() {
  const studentInput = document.getElementById("studentName");
  studentName = studentInput.value.trim();
  if (!studentName) {
    alert("Please enter your name!");
    return;
  }
  document.getElementById("student-info").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";

  currentQuestion = 0;
  score = 0;
  answers = [];

  showQuestion();
}

// ---------- Show Question ----------
function showQuestion() {
  const q = questions[currentQuestion];
  questionEl.textContent = `${currentQuestion + 1}. [${q.subject}] ${q.question}`;
  optionsEl.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(opt, btn);
    optionsEl.appendChild(btn);
  });
}

// ---------- Select Answer ----------
function selectAnswer(selected, btn) {
  const q = questions[currentQuestion];
  const correct = selected === q.answer;
  answers.push({ ...q, selected, correct });
  if (correct) score++;

  const buttons = optionsEl.querySelectorAll("button");
  buttons.forEach(b => {
    b.disabled = true;
    if (b.textContent === q.answer) {
      b.style.backgroundColor = "#4CAF50";
      b.style.color = "white";
    } else if (b === btn && !correct) {
      b.style.backgroundColor = "#f44336";
      b.style.color = "white";
    }
  });

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questions.length) showQuestion();
    else showResult();
  }, 1000);
}

// ---------- Show Result ----------
function showResult() {
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("result-container").style.display = "block";

  const resultDiv = document.getElementById("result");
  let html = `<p>Student: ${studentName}</p>`;
  html += `<p>Score: ${score} / ${questions.length}</p>`;

  // Subject-wise analysis
  const subjectStats = {};
  const topicStats = {};
  questions.forEach(q => {
    if (!subjectStats[q.subject]) subjectStats[q.subject] = { total: 0, correct: 0 };
    subjectStats[q.subject].total++;
    if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
    topicStats[q.topic].total++;
  });

  answers.forEach(ans => {
    if (ans.correct) {
      subjectStats[ans.subject].correct++;
      topicStats[ans.topic].correct++;
    }
  });

  html += "<h4>Subject Analysis:</h4><ul>";
  for (const sub in subjectStats) {
    const s = subjectStats[sub];
    html += `<li>${sub}: ${s.correct} / ${s.total} correct</li>`;
  }
  html += "</ul>";

  html += "<h4>Topic Analysis:</h4><ul>";
  for (const t in topicStats) {
    const s = topicStats[t];
    html += `<li>${t}: ${s.correct} / ${s.total} correct</li>`;
  }
  html += "</ul>";

  resultDiv.innerHTML = html;

  drawChart(subjectStats, topicStats);
}

// ---------- Draw Chart ----------
function drawChart(subjectStats, topicStats) {
  const ctx = document.getElementById("resultChart").getContext("2d");

  // Prepare data
  const subjects = Object.keys(subjectStats);
  const subCorrects = subjects.map(s => subjectStats[s].correct);
  const subTotals = subjects.map(s => subjectStats[s].total);

  const topics = Object.keys(topicStats);
  const topCorrects = topics.map(t => topicStats[t].correct);

  if (window.myChart) window.myChart.destroy(); // destroy previous chart

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [
        { label: "Correct Answers", data: subCorrects, backgroundColor: "#4CAF50" },
        { label: "Total Questions", data: subTotals, backgroundColor: "#2196F3" }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ---------- Generate PDF ----------
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const imgLogo = new Image();
  imgLogo.src = 'logo.png';

  imgLogo.onload = () => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const logoWidth = 40;
    const logoHeight = 20;
    const headerY = 10;
    let currentPage = 1;

    // --------- HEADER & FOOTER FUNCTION ----------
    function addHeaderFooter() {
      const xLogo = (pageWidth - logoWidth) / 2;
      pdf.addImage(imgLogo, 'PNG', xLogo, headerY, logoWidth, logoHeight);
      pdf.setFontSize(16);
      pdf.text("Lab on Table - Student Report", pageWidth / 2, headerY + 30, { align: 'center' });

      const today = new Date();
      const dateStr = today.toLocaleDateString();
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${dateStr}`, 15, pageHeight - 10);
      pdf.text(`Page ${currentPage}`, pageWidth - 25, pageHeight - 10);
    }

    // Initialize first page
    addHeaderFooter();
    let y = headerY + 55;

    // --------- STUDENT INFO ----------
    pdf.setFontSize(12);
    pdf.text(`Student: ${studentName}`, 15, y);
    pdf.text(`Score: ${score} / ${questions.length}`, 15, y + 8);
    y += 20;

    // --------- SUBJECT ANALYSIS ----------
    const subjectStats = {};
    questions.forEach(q => {
      if (!subjectStats[q.subject]) subjectStats[q.subject] = { total: 0, correct: 0 };
      subjectStats[q.subject].total++;
    });
    answers.forEach(ans => {
      if (ans.correct) subjectStats[ans.subject].correct++;
    });

    pdf.setFontSize(14);
    pdf.text("Subject Analysis:", 15, y);
    y += 6;
    pdf.setFontSize(12);

    // Table header background
    pdf.setFillColor(200, 200, 200);
    pdf.rect(15, y, pageWidth - 30, 8, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Subject", 18, y + 6);
    pdf.text("Score", 90, y + 6);
    pdf.text("Percentage", 140, y + 6);
    y += 10;

    for (const sub in subjectStats) {
      const s = subjectStats[sub];
      const percent = ((s.correct / s.total) * 100).toFixed(1);

      // Alternate row background
      if (y / 10 % 2 === 0) pdf.setFillColor(245, 245, 245);
      else pdf.setFillColor(255, 255, 255);
      pdf.rect(15, y - 2, pageWidth - 30, 8, 'F');

      pdf.setTextColor(0, 0, 0);
      pdf.text(sub, 18, y + 4);
      pdf.text(`${s.correct} / ${s.total}`, 90, y + 4);

      // Color bars with percentage inside
      const barWidth = 80 * (s.correct / s.total);
      pdf.setFillColor(76, 175, 80);
      pdf.rect(15, y + 6, barWidth, 4, 'F');
      pdf.setFillColor(244, 67, 54);
      pdf.rect(15 + barWidth, y + 6, 80 - barWidth, 4, 'F');

      // Draw percentage text inside green bar if enough space, else outside
      pdf.setTextColor(255, 255, 255);
      if (barWidth > 12) pdf.text(`${percent}%`, 15 + barWidth / 2 - 5, y + 9);
      else pdf.setTextColor(0, 0, 0), pdf.text(`${percent}%`, 15 + barWidth + 2, y + 9);

      y += 12;
      if (y > pageHeight - 60) {
        pdf.addPage();
        currentPage++;
        addHeaderFooter();
        y = headerY + 55;
      }
    }

    y += 4;
// Compute weak & strong subjects/topics
const weakSubjects = [];
const strongSubjects = [];

for(const sub in subjectStats){
    const s = subjectStats[sub];
    const perc = (s.correct / s.total) * 100;
    if(perc < 50) weakSubjects.push(sub);
    else if(perc >= 80) strongSubjects.push(sub);
}

// Generate recommendation
let recommendation = "";
if(weakSubjects.length > 0){
    recommendation = `Review ${weakSubjects.join(", ")} chapters.`;
} else {
    recommendation = "Keep up the good work!";
}

    // --------- ADD CHART ----------
    const chartCanvas = document.getElementById("resultChart");
    const chartImg = chartCanvas.toDataURL("image/png", 1.0);
    const chartWidth = pageWidth - 30;
    const chartHeight = (chartCanvas.height / chartCanvas.width) * chartWidth;

    if (y + chartHeight > pageHeight - 30) {
      pdf.addPage();
      currentPage++;
      addHeaderFooter();
      y = headerY + 55;
    }
    pdf.addImage(chartImg, 'PNG', 15, y, chartWidth, chartHeight);
    y += chartHeight + 6;

    // --------- TOPIC ANALYSIS ----------
    const topicStats = {};
    questions.forEach(q => {
      if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
      topicStats[q.topic].total++;
    });
    answers.forEach(ans => {
      if (ans.correct) topicStats[ans.topic].correct++;
    });

    pdf.setFontSize(14);
    pdf.text("Topic Analysis:", 15, y);
    y += 6;
    pdf.setFontSize(12);

    // Table header
    pdf.setFillColor(200, 200, 200);
    pdf.rect(15, y, pageWidth - 30, 8, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Topic", 18, y + 6);
    pdf.text("Score", 90, y + 6);
    pdf.text("Percentage", 140, y + 6);
    y += 10;

    for (const t in topicStats) {
      const s = topicStats[t];
      const percent = ((s.correct / s.total) * 100).toFixed(1);

      // Alternate row colors
      if (y / 10 % 2 === 0) pdf.setFillColor(245, 245, 245);
      else pdf.setFillColor(255, 255, 255);
      pdf.rect(15, y - 2, pageWidth - 30, 8, 'F');

      pdf.setTextColor(0, 0, 0);
      pdf.text(t, 18, y + 4);
      pdf.text(`${s.correct} / ${s.total}`, 90, y + 4);

      // Color bars with percentage
      const barWidth = 80 * (s.correct / s.total);
      pdf.setFillColor(76, 175, 80);
      pdf.rect(15, y + 6, barWidth, 4, 'F');
      pdf.setFillColor(244, 67, 54);
      pdf.rect(15 + barWidth, y + 6, 80 - barWidth, 4, 'F');

      pdf.setTextColor(255, 255, 255);
      if (barWidth > 12) pdf.text(`${percent}%`, 15 + barWidth / 2 - 5, y + 9);
      else pdf.setTextColor(0, 0, 0), pdf.text(`${percent}%`, 15 + barWidth + 2, y + 9);

      y += 12;
      if (y > pageHeight - 60) {
        pdf.addPage();
        currentPage++;
        addHeaderFooter();
        y = headerY + 55;
      }
    }

    y += 6;
y += 20; // spacing

pdf.setFontSize(14);
pdf.setTextColor(0,0,80);
pdf.text("Performance Summary:", 40, y);
y += 20;

pdf.setFontSize(12);
pdf.setTextColor(0,0,0);

pdf.text(`Weak Areas: ${weakSubjects.join(", ") || "None"}`, 50, y);
y += 18;
pdf.text(`Strong Areas: ${strongSubjects.join(", ") || "None"}`, 50, y);
y += 18;
pdf.text(`Recommendation: ${recommendation}`, 50, y);
y += 25;

    // --------- ANSWERS SECTION ----------
    pdf.setFontSize(14);
    pdf.text("Answers:", 15, y);
    y += 6;
    pdf.setFontSize(12);

    answers.forEach((a, i) => {
      // Alternate row background
      if (i % 2 === 0) pdf.setFillColor(245, 245, 245);
      else pdf.setFillColor(255, 255, 255);
      pdf.rect(15, y - 2, pageWidth - 30, 12, 'F');

      pdf.setTextColor(0, 0, 0);
      pdf.text(`${i + 1}. [${a.subject}] ${a.question}`, 18, y + 4);
      y += 6;
      pdf.text(`Your Answer: ${a.selected} | Correct: ${a.answer}`, 20, y + 4);
      y += 10;

      if (y > pageHeight - 40) {
        pdf.addPage();
        currentPage++;
        addHeaderFooter();
        y = headerY + 55;
      }
    });

    pdf.save(`${studentName}_report.pdf`);
  };
}
