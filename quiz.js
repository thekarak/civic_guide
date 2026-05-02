const fullQuiz = [
  { q: "Which Article of the Indian Constitution provides for Adult Suffrage (Universal Franchise)?", options: ["Article 14", "Article 21", "Article 326", "Article 352"], answer: 2, diff: 1, exp: "Article 326 guarantees the right to vote to every Indian citizen above 18." },
  { q: "What is the minimum age to vote in India?", options: ["16 years", "18 years", "21 years", "25 years"], answer: 1, diff: 1, exp: "The 61st Amendment reduced it from 21 to 18." },
  { q: "What does EVM stand for?", options: ["Electronic Verification Machine", "Electronic Voting Machine", "Electoral Vote Monitor", "Electrical Voting Mechanism"], answer: 1, diff: 1, exp: "EVMs revolutionized Indian elections by stopping booth capture." },
  { q: "Which body conducts Lok Sabha elections in India?", options: ["Supreme Court of India", "Ministry of Home Affairs", "Election Commission of India", "NITI Aayog"], answer: 2, diff: 1, exp: "Article 324 gives ECI the power to superintend elections." },
  { q: "What is the security deposit amount for a General category candidate contesting Lok Sabha elections?", options: ["₹10,000", "₹15,000", "₹25,000", "₹50,000"], answer: 2, diff: 2, exp: "₹25,000 for General and ₹12,500 for SC/ST candidates." },
  { q: "How many hours before polling must election campaigning stop?", options: ["24 hours", "36 hours", "48 hours", "72 hours"], answer: 2, diff: 2, exp: "This is known as the silence period, allowing voters to reflect peacefully." },
  { q: "What does NOTA stand for on the EVM?", options: ["Not On The Agenda", "None Of The Applicants", "None Of The Above", "No Other Ticket Available"], answer: 2, diff: 2, exp: "Introduced by SC order to allow voters to reject all candidates." },
  { q: "In India, who manufactures the indelible ink used during elections?", options: ["DRDO, Delhi", "Mysore Paints and Varnish Limited (MPVL)", "Indian Oil Corporation", "Hindustan Unilever"], answer: 1, diff: 2, exp: "MPVL is a Karnataka Govt PSU, making this ink since 1962." },
  { q: "Under the new 2023 Election Commission law, who is NOT on the committee that selects the Chief Election Commissioner?", options: ["Prime Minister", "Leader of Opposition", "Chief Justice of India", "A Cabinet Minister nominated by PM"], answer: 2, diff: 2, exp: "Parliament passed a law replacing CJI with a Cabinet Minister." },
  { q: "A candidate who gets less than _____ of total valid votes forfeits their security deposit.", options: ["1/8th", "1/6th", "1/4th", "1/3rd"], answer: 1, diff: 2, exp: "Getting less than 1/6th valid votes means forfeiture of deposit." },
  { q: "VVPAT paper slip is visible to the voter for how many seconds?", options: ["3 seconds", "5 seconds", "7 seconds", "10 seconds"], answer: 2, diff: 2, exp: "Visible for exactly 7 seconds before dropping into the sealed box." },
  { q: "Which Constitutional Amendment reduced the voting age from 21 to 18 years in India?", options: ["42nd Amendment", "52nd Amendment", "61st Amendment", "73rd Amendment"], answer: 2, diff: 3, exp: "Passed in 1988, effective from 1989 elections." },
  { q: "The Rajya Sabha is elected by which method?", options: ["Direct election by citizens", "First Past The Post by MPs", "Single Transferable Vote by MLAs", "Nomination by President"], answer: 2, diff: 3, exp: "MLAs vote for Rajya Sabha using proportional representation." },
  { q: "In India's 2024 General Election, approximately how many registered voters were there?", options: ["54 crore", "72 crore", "85 crore", "96.8 crore"], answer: 3, diff: 3, exp: "World's largest electorate, more than population of Europe!" },
  { q: "What happens if two candidates in an Indian election get EXACTLY equal number of votes?", options: ["Re-polling is conducted", "The Returning Officer decides by drawing a lot", "The senior-aged candidate wins", "The case goes to the High Court"], answer: 1, diff: 3, exp: "Under RPA rules, RO draws a lot (coin flip/chit) to decide." }
];

let quizState = { current: 0, score: 0, active: false };

function openQuiz() {
  quizState = { current: 0, score: 0, active: true };
  document.getElementById("quiz-modal").classList.add("open");
  renderQuestion();
}

function closeQuiz() {
  document.getElementById("quiz-modal").classList.remove("open");
  quizState.active = false;
  document.getElementById("quiz-result-screen").style.display = 'none';
  document.getElementById("quiz-body").style.display = 'block';
}

function renderQuestion() {
  const q = fullQuiz[quizState.current];
  document.getElementById("quiz-qnum").innerText = `Question ${quizState.current + 1} / 15`;
  document.getElementById("quiz-score-live").innerText = `Score: ${quizState.score}`;
  
  const diffStars = "⭐".repeat(q.diff);
  document.getElementById("quiz-difficulty").innerHTML = diffStars;
  
  document.getElementById("quiz-progress-fill").style.width = `${((quizState.current) / 15) * 100}%`;
  
  document.getElementById("quiz-question").innerText = q.q;
  
  const optionsDiv = document.getElementById("quiz-options");
  optionsDiv.innerHTML = "";
  const labels = ["A", "B", "C", "D"];
  q.options.forEach((opt, idx) => {
    const div = document.createElement("div");
    div.className = "quiz-option";
    div.innerHTML = `<div class="option-letter">${labels[idx]}</div><div>${opt}</div>`;
    div.onclick = () => selectAnswer(idx, div);
    optionsDiv.appendChild(div);
  });
  
  document.getElementById("quiz-feedback").style.display = 'none';
  document.getElementById("quiz-next-btn").classList.remove("show");
}

function selectAnswer(idx, el) {
  const q = fullQuiz[quizState.current];
  const isCorrect = (idx === q.answer);
  
  const options = document.querySelectorAll(".quiz-option");
  options.forEach((opt, i) => {
    opt.classList.add("disabled");
    if (i === q.answer) opt.classList.add("correct");
    else if (i === idx && !isCorrect) opt.classList.add("wrong");
  });
  
  if (isCorrect) quizState.score++;
  
  const fb = document.getElementById("quiz-feedback");
  fb.className = `quiz-feedback ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
  fb.innerHTML = `<strong>${isCorrect ? '✅ CORRECT!' : '❌ WRONG!'}</strong><br>${q.exp}`;
  fb.style.display = 'block';
  
  document.getElementById("quiz-score-live").innerText = `Score: ${quizState.score}`;
  document.getElementById("quiz-next-btn").classList.add("show");
}

function nextQuestion() {
  quizState.current++;
  if (quizState.current < fullQuiz.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("quiz-body").style.display = 'none';
  document.getElementById("quiz-progress-fill").style.width = "100%";
  const resScreen = document.getElementById("quiz-result-screen");
  resScreen.style.display = 'block';
  
  let title = "", msg = "", emoji = "";
  if (quizState.score >= 13) {
    title = "ELECTION CHAMPION!"; emoji = "🏆";
    msg = "You could work for the Election Commission of India!";
    triggerConfetti();
  } else if (quizState.score >= 9) {
    title = "DEMOCRACY SCHOLAR!"; emoji = "🥈";
    msg = "Excellent knowledge! Just a few minor things to review.";
  } else if (quizState.score >= 5) {
    title = "RISING CITIZEN!"; emoji = "📈";
    msg = "Good foundation! Want me to explain the topics you missed?";
  } else {
    title = "BEGINNER'S JOURNEY!"; emoji = "💪";
    msg = "No worries! Let's start from Module A together. Every expert was once a beginner! 🇮🇳";
  }
  
  document.getElementById("res-emoji").innerText = emoji;
  document.getElementById("res-title").innerText = title;
  document.getElementById("res-score").innerText = `${quizState.score} / 15`;
  document.getElementById("res-msg").innerText = msg;
}

window.CivicQuiz = { openQuiz, closeQuiz, nextQuestion };
