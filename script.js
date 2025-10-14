// Quiz data
const quizData = [
    {
        question: "What is 12 × 8?",
        options: ["96", "86", "108", "100"],
        answer: "96",
        topic: "Maths"
    },
    {
        question: "Force = mass × ?",
        options: ["Speed", "Acceleration", "Energy", "Momentum"],
        answer: "Acceleration",
        topic: "Physics"
    },
    {
        question: "The square root of 144 is?",
        options: ["12", "14", "16", "10"],
        answer: "12",
        topic: "Maths"
    },
    {
        question: "Unit of electric current is?",
        options: ["Volt", "Ohm", "Ampere", "Watt"],
        answer: "Ampere",
        topic: "Physics"
    }
];

// DOM elements
const quizContainer = document.getElementById("quiz");
const submitBtn = document.getElementById("submit-btn");
const resultContainer = document.getElementById("result-container");
const resultDiv = document.getElementById("result");
const downloadBtn = document.getElementById("download-pdf");

// Load quiz questions
function loadQuiz() {
    quizContainer.innerHTML = "";
    quizData.forEach((q, index) => {
        const qDiv = document.createElement("div");
        qDiv.classList.add("question-block");
        qDiv.innerHTML = `<p>${index + 1}. ${q.question}</p>`;
        q.options.forEach(opt => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="radio" name="q${index}" value="${opt}"> ${opt}`;
            qDiv.appendChild(label);
            qDiv.appendChild(document.createElement("br"));
        });
        quizContainer.appendChild(qDiv);
    });
}

// Analyze results
function analyzeResults(score, wrongTopics) {
    let analysis = `<p>You scored ${score} out of ${quizData.length}</p>`;
    if (wrongTopics.length > 0) {
        analysis += "<p>Topics to improve:</p><ul>";
        wrongTopics.forEach(t => analysis += `<li>${t}</li>`);
        analysis += "</ul>";
    } else {
        analysis += "<p>Great! You got all correct!</p>";
    }
    return analysis;
}

// Generate PDF using jsPDF
function generatePDF(content) {
    const { jsPDF } = window.jspdf; // ✅ Access jsPDF from CDN correctly
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save("quiz-result.pdf");
}

// Submit quiz
submitBtn.addEventListener("click", () => {
    let score = 0;
    let wrongTopics = [];
    quizData.forEach((q, index) => {
        const selected = document.querySelector(`input[name=q${index}]:checked`);
        if (selected && selected.value === q.answer) {
            score++;
        } else {
            wrongTopics.push(q.topic);
        }
    });
    resultDiv.innerHTML = analyzeResults(score, [...new Set(wrongTopics)]);
    quizContainer.style.display = "none";
    submitBtn.style.display = "none";
    resultContainer
