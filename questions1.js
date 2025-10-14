// questions.js
// Structure per question:
// { id, class: "6"|"7"|"8", subject: "maths"|"physics", topic: "topic-name",
//   q: "Question text", options: ["A","B","C","D"], answer: 0-based index }

const QUESTION_BANK = [
  /* ====== CLASS 6 — MATHS ====== */
  { id: "6m1", class: "6", subject: "maths", topic: "fractions",
    q: "What is 1/2 + 1/3 ?", options: ["1/5","5/6","2/5","3/6"], answer: 1 },
  { id: "6m2", class: "6", subject: "maths", topic: "number-sense",
    q: "Which is the largest? 0.5, 1/2, 2/3, 0.66", options: ["0.5","1/2","2/3","0.66"], answer: 2 },
  { id: "6m3", class: "6", subject: "maths", topic: "geometry",
    q: "A triangle has angles 50° and 60°. The third angle is:", options: ["70°","60°","80°","90°"], answer: 2 },
  { id: "6m4", class: "6", subject: "maths", topic: "arithmetic",
    q: "Find LCM of 6 and 8.", options: ["12","24","48","14"], answer: 1 },
  { id: "6m5", class: "6", subject: "maths", topic: "fractions",
    q: "Which is equivalent to 2/3?", options: ["4/6","3/4","1/3","6/9"], answer: 0 },

  /* ====== CLASS 6 — PHYSICS ====== */
  { id: "6p1", class: "6", subject: "physics", topic: "motion",
    q: "Which device measures temperature?", options: ["Barometer","Thermometer","Ammeter","Speedometer"], answer: 1 },
  { id: "6p2", class: "6", subject: "physics", topic: "light",
    q: "Light travels fastest in:", options: ["Air","Glass","Vacuum","Water"], answer: 2 },
  { id: "6p3", class: "6", subject: "physics", topic: "force",
    q: "Which of these is a contact force?", options: ["Gravity","Magnetism","Friction","Electrostatic"], answer: 2 },
  { id: "6p4", class: "6", subject: "physics", topic: "energy",
    q: "Energy of motion is called:", options: ["Potential energy","Kinetic energy","Thermal energy","Chemical energy"], answer: 1 },

  /* ====== CLASS 7 — MATHS ====== */
  { id: "7m1", class: "7", subject: "maths", topic: "algebra",
    q: "Solve: 2x + 3 = 11. x = ?", options: ["3","4","5","2"], answer: 1 },
  { id: "7m2", class: "7", subject: "maths", topic: "geometry",
    q: "Interior angles of a quadrilateral sum to:", options: ["180°","360°","270°","540°"], answer: 1 },
  { id: "7m3", class: "7", subject: "maths", topic: "ratio",
    q: "If ratio a:b = 2:3 and b:c = 3:4 then a:c = ?", options: ["6:12","2:4","6:8","1:2"], answer: 2 },
  { id: "7m4", class: "7", subject: "maths", topic: "number-sense",
    q: "Prime numbers between 10 and 20 are:", options: ["11,13,17,19","11,12,13","13,15,17","11,13,14"], answer: 0 },

  /* ====== CLASS 7 — PHYSICS ====== */
  { id: "7p1", class: "7", subject: "physics", topic: "motion",
    q: "Speed is distance divided by:", options: ["Time","Mass","Force","Area"], answer: 0 },
  { id: "7p2", class: "7", subject: "physics", topic: "energy",
    q: "Which energy source does NOT directly rely on sunlight?", options: ["Wind","Coal","Biofuel","Solar"], options: ["Wind","Coal","Biofuel","Solar"], answer: 1 },
  { id: "7p3", class: "7", subject: "physics", topic: "electricity",
    q: "Which instrument measures current?", options: ["Voltmeter","Ammeter","Ohmmeter","Wattmeter"], answer: 1 },

  /* ====== CLASS 8 — MATHS ====== */
  { id: "8m1", class: "8", subject: "maths", topic: "algebra",
    q: "Factorize: x^2 - 5x + 6", options: ["(x-2)(x-3)","(x+2)(x+3)","(x-1)(x-6)","(x-3)(x-3)"], answer: 0 },
  { id: "8m2", class: "8", subject: "maths", topic: "geometry",
    q: "Area of circle with radius 7 is (π=22/7):", options: ["154","44","77","308"], answer: 0 },
  { id: "8m3", class: "8", subject: "maths", topic: "percentages",
    q: "10% of 250 is:", options: ["20","25","15","10"], answer: 1 },

  /* ====== CLASS 8 — PHYSICS ====== */
  { id: "8p1", class: "8", subject: "physics", topic: "pressure",
    q: "Pressure = Force / ____", options: ["Volume","Area","Mass","Density"], answer: 1 },
  { id: "8p2", class: "8", subject: "physics", topic: "thermal",
    q: "Which expands most on heating?", options: ["Solids","Liquids","Gases","All equal"], answer: 2 }
];

// Export for script.js if loaded as module; else just global variable is enough for browser
// (we will use global QUESTION_BANK in script.js)
