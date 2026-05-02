let chatHistory = [];
let userState = null;
let userConstituency = null;
let awaitingState = true;
let isExpertMode = false;
let checklistStep = 0;
let checklistAnswers = {};

const pincodeMap = {
  "700032": { dist: "Jadavpur", state: "West Bengal", mp: "Saayoni Ghosh" },
  "110001": { dist: "New Delhi", state: "Delhi", mp: "Bansuri Swaraj" },
  "400001": { dist: "Mumbai South", state: "Maharashtra", mp: "Arvind Sawant" },
  "560001": { dist: "Bangalore Central", state: "Karnataka", mp: "P. C. Mohan" }
};

const responses = {
  greeting: `**Hello! Namaskar! Nomoshkar!** 🙏\n\nI'm **CivicGuide** — your personal guide to understanding how India's elections work, step by step, in simple language.\n\n🇮🇳 India is the world's LARGEST democracy. But do YOU know exactly how it works?\n\nLet's customize your experience. **What is your Pincode or District name?**`,
  
  menu: `**Here's what you can learn today:**\n\n🏛️ **[1]** What is an election & types in India\n🗓️ **[2]** Full Election Timeline (Announcement to Oath)\n🗳️ **[3]** How to Vote — Step by Step Guide\n📋 **[4]** How to Register as a Voter\n⚙️ **[19]** How EVMs and VVPAT Work\n📜 **[23]** Model Code of Conduct — Full Rules\n🏆 **[34]** Test Your Knowledge — Championship Quiz\n\nJust type a **NUMBER** or ask me anything!`,

  error: `I'm CivicGuide — India's election education specialist! Want to pick a topic from the menu? Type **menu**! 🗳️`
};

window.toggleExpertMode = function() {
  isExpertMode = !isExpertMode;
  const toggle = document.getElementById('mode-toggle');
  const firstTimerLabel = toggle.querySelector('.first-timer');
  const expertLabel = toggle.querySelector('.expert');
  
  if (isExpertMode) {
    toggle.classList.add('expert-active');
    firstTimerLabel.classList.remove('active');
    expertLabel.classList.add('active');
    addBotMessage("Switched to **Expert Mode**. I will now provide detailed, constitutional, and technical facts suitable for advanced learning or exam prep.");
  } else {
    toggle.classList.remove('expert-active');
    firstTimerLabel.classList.add('active');
    expertLabel.classList.remove('active');
    addBotMessage("Switched to **First Timer Mode**. I'll keep things simple, practical, and easy to understand with everyday analogies.");
  }
};

function formatModule(id) {
  const m = window.CivicKnowledge[id];
  if (!m) return responses.error;
  
  let html = `<h3>${m.title}</h3>`;
  const whatText = isExpertMode ? m.expert_what : m.first_timer_what;
  html += `<strong>📖 WHAT IT IS:</strong><br>${whatText}<br><br>`;
  html += `<strong>🎯 WHY IT MATTERS:</strong><br>${m.why}<br><br>`;
  html += `<strong>⚙️ HOW IT WORKS:</strong><ul class="step-list">`;
  m.how.forEach(step => {
    html += `<li>${step}</li>`;
  });
  html += `</ul><br>`;
  
  // Constituency Personalizer Injection
  let exampleText = m.example;
  if (userConstituency && id === 2) {
    exampleText = `In your constituency of ${userConstituency.dist}, ${userConstituency.state}, ${userConstituency.mp} was elected as your MP in the recent Lok Sabha elections.`;
  }
  
  html += `<div class="fact-box"><div class="fact-box-title">📰 REAL INDIA EXAMPLE</div>${exampleText}</div>`;
  html += `<strong>❓ QUICK QUIZ:</strong><br>${m.quiz}`;
  
  return html;
}

function handleChecklistFlow(text) {
  let isYes = text.includes('yes') || text.includes('y') || text === '1';
  
  if (checklistStep === 1) {
    checklistAnswers.age = isYes;
    checklistStep = 2;
    addBotMessage(`**Question 2 / 5:**\nDo you have a Voter ID card (EPIC)? (Yes / No)`);
  } else if (checklistStep === 2) {
    checklistAnswers.hasId = isYes;
    checklistStep = 3;
    addBotMessage(`**Question 3 / 5:**\nIs your name verified on the current Electoral Roll? (Yes / No / Not Sure)`);
  } else if (checklistStep === 3) {
    checklistAnswers.onRoll = isYes && !text.includes('not');
    checklistStep = 4;
    addBotMessage(`**Question 4 / 5:**\nDo you know where your specific polling booth is located? (Yes / No)`);
  } else if (checklistStep === 4) {
    checklistAnswers.knowsBooth = isYes;
    checklistStep = 5;
    addBotMessage(`**Question 5 / 5:**\nDo you know the candidates contesting in your constituency? (Yes / No)`);
  } else if (checklistStep === 5) {
    checklistAnswers.knowsCandidates = isYes;
    checklistStep = 0; // End flow
    
    // Generate Report
    let report = `### Your Voting Readiness Report 📊\n\n`;
    let todos = [];
    
    if (!checklistAnswers.age) {
      todos.push("❌ You must be an Indian citizen and 18+ to vote. If you're turning 18 soon, you can apply in advance!");
    } else if (!checklistAnswers.onRoll) {
      todos.push("❌ **Critical:** You must register your name on the Electoral Roll (Form 6). You cannot vote without this, even if you have an ID!");
    } else {
      if (!checklistAnswers.hasId) {
        todos.push("⚠️ You don't have a physical Voter ID, but since your name is on the roll, you can use Aadhaar, PAN, or Passport.");
      }
      if (!checklistAnswers.knowsBooth) {
        todos.push("🔍 Find your polling booth using the Voter Helpline App or voters.eci.gov.in.");
      }
      if (!checklistAnswers.knowsCandidates) {
        todos.push("📱 Check the 'Know Your Candidate' (KYC) App by ECI to see details and criminal antecedents of your candidates.");
      }
      if (todos.length === 0) {
        report += "🌟 **YOU ARE 100% READY TO VOTE!** 🌟\n\nYou have everything sorted. See you at the booth!";
      }
    }
    
    if (todos.length > 0) {
      report += "**Your Action Plan:**\n" + todos.map(t => `- ${t}`).join('\n');
    }
    
    report += `\n\n<button class="share-ink-btn" onclick="alert('Shared to your social media! #CivicGuide #IndiaVotes')">Share Your Ink 🗳️</button>`;
    
    addBotMessage(report);
  }
}

function processInput(text) {
  text = text.trim().toLowerCase();
  if (!text) return;
  
  addUserMessage(text);
  document.getElementById("user-input").value = "";
  
  showTyping();
  
  setTimeout(() => {
    hideTyping();
    let reply = "";
    
    if (checklistStep > 0) {
      handleChecklistFlow(text);
      return;
    }
    
    if (awaitingState) {
      awaitingState = false;
      let matched = null;
      if (/^\d{6}$/.test(text) && pincodeMap[text]) {
        matched = pincodeMap[text];
      }
      
      if (matched) {
        userConstituency = matched;
        reply = `Awesome! I see you are from **${matched.dist}, ${matched.state}**.\nFun fact: Your current MP is ${matched.mp}! 🏛️\n\n` + responses.menu;
      } else {
        reply = `Awesome! Nice to meet someone from **${text.toUpperCase()}**! 😊\n\n` + responses.menu;
      }
    } else if (text.includes("am i ready to vote") || text.includes("ready to vote") || text.includes("checklist")) {
      checklistStep = 1;
      checklistAnswers = {};
      reply = `**"Am I Ready to Vote?" Personal Checklist** 📋\n\nLet's find out exactly what you need to do before election day.\n\n**Question 1 / 5:**\nAre you an Indian citizen aged 18 or older? (Yes / No)`;
    } else if (text.includes("lost") && text.includes("id")) {
      reply = `**What if I lost my Voter ID?**\n\nDon't panic! You can still vote. As long as your name is on the Electoral Roll, you can use any of the 11 alternative photo IDs approved by the ECI, such as:\n- Aadhaar Card\n- PAN Card\n- Driving License\n- Indian Passport\n\n*Pro tip: Always check your name on the roll online before going to the booth.*`;
    } else if (text.includes("not on roll") || text.includes("isn't on the roll") || text.includes("not in list")) {
      reply = `**What if my name isn't on the roll?**\n\nYou CANNOT vote. Even if you have a physical Voter ID card, if your name is not on the voter list for your booth, you cannot cast a vote. You must apply for registration (Form 6) before the next election cycle.`;
    } else if (text.includes("travelling") || text.includes("out of town") || text.includes("traveling")) {
      reply = `**What if I am travelling on polling day?**\n\nUnfortunately, standard voters must vote in person at their designated booth. Postal ballots are only available for specific categories: Service voters (armed forces), election duty staff, media persons, and citizens above 85 years of age or with disabilities.`;
    } else if (text === "menu" || text === "help" || text === "start") {
      reply = responses.menu;
    } else if (text === "34" || text === "[34]" || text.includes("quiz")) {
      reply = `Let's test your knowledge! Opening the Championship Quiz now... 🏆`;
      setTimeout(() => window.CivicQuiz.openQuiz(), 1500);
    } else if (!isNaN(parseInt(text.replace(/[\[\]]/g, '')))) {
      let num = parseInt(text.replace(/[\[\]]/g, ''));
      if (window.CivicKnowledge[num]) {
        reply = formatModule(num);
      } else {
        reply = `I don't have module [${num}] loaded right now. Try 1, 2, 3, 4, 19, or 23!`;
      }
    } else if (text.includes("story")) {
      reply = `**Arjun's First Vote** 📖\n\nArjun, an 18-year-old from Bhopal, was excited. He applied online using Form 6. When the day came, he walked to the booth, showed his EPIC card. The officer put indelible ink on his left index finger. He walked to the EVM, pressed the blue button next to his choice, heard the loud BEEP, and saw the VVPAT slip for 7 seconds. He walked out, chest swelled with pride, and took a selfie showing his inked finger!`;
    } else {
      reply = responses.error;
    }
    
    addBotMessage(reply);
  }, 800);
}

function parseMarkdown(text) {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

function addUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'msg-row user';
  div.innerHTML = `
    <div class="msg-bubble">${text}</div>
    <div class="msg-avatar user-avatar">👤</div>
  `;
  document.getElementById("chat-messages").appendChild(div);
  scrollToBottom();
}

function addBotMessage(text) {
  const div = document.createElement('div');
  div.className = 'msg-row bot';
  let formatted = text.includes("📖 WHAT IT IS") || text.includes("<button") ? text : parseMarkdown(text);
  div.innerHTML = `
    <div class="msg-avatar bot-avatar">🗳️</div>
    <div class="msg-bubble">${formatted}</div>
  `;
  document.getElementById("chat-messages").appendChild(div);
  scrollToBottom();
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg-row bot';
  div.id = 'typing-row';
  div.innerHTML = `
    <div class="msg-avatar bot-avatar">🗳️</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
    </div>
  `;
  document.getElementById("chat-messages").appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const tr = document.getElementById('typing-row');
  if (tr) tr.remove();
}

function scrollToBottom() {
  const cm = document.getElementById("chat-messages");
  cm.scrollTop = cm.scrollHeight;
}

function initBot() {
  setTimeout(() => {
    addBotMessage(responses.greeting);
  }, 500);
  
  document.getElementById("send-btn").onclick = () => {
    processInput(document.getElementById("user-input").value);
  };
  
  document.getElementById("user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      processInput(document.getElementById("user-input").value);
    }
  });
  
  document.querySelectorAll(".chip").forEach(chip => {
    chip.onclick = () => {
      // Remove icon emojis from text before sending
      let val = chip.innerText.replace(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
      processInput(val);
    };
  });
}

window.initBot = initBot;
