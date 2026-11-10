const app = document.querySelector("#app");
const homeButton = document.querySelector("#brandHome");
const installButton = document.querySelector("#installButton");
const installHelp = document.querySelector("#installHelp");
const installDialog = document.querySelector("#installDialog");
const confirmInstall = document.querySelector("#confirmInstall");
const iosHint = document.querySelector("#iosHint");
let bank = [];
let game = null;
let deferredInstallPrompt = null;
const STORAGE = { settings: "nautiktrainer.settings.v1", stats: "nautiktrainer.stats.v1", mistakes: "nautiktrainer.mistakes.v1", favorites: "nautiktrainer.favorites.v1" };
function readStored(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
let settings = Object.assign({ topic: "Alle Themen", examLength: 30, textSize: "normal" }, readStored(STORAGE.settings, {}));
let stats = readStored(STORAGE.stats, {});
let mistakes = new Set(readStored(STORAGE.mistakes, []));
let favorites = new Set(readStored(STORAGE.favorites, []));
function saveSettings() { localStorage.setItem(STORAGE.settings, JSON.stringify(settings)); }
function saveStats() { localStorage.setItem(STORAGE.stats, JSON.stringify(stats)); }
function saveMistakes() { localStorage.setItem(STORAGE.mistakes, JSON.stringify(Array.from(mistakes))); }
function saveFavorites() { localStorage.setItem(STORAGE.favorites, JSON.stringify(Array.from(favorites))); }
function topicOf(q) {
  if (q.image && q.image.indexOf("signal-flag-") === 0) return "Flaggen";
  var text = (q.prompt + " " + q.options.join(" ")).toLocaleLowerCase("de");
  if (/flagge|signalflag|flaggen|alfa|oscar|bravo|charlie|hotel|quebec/.test(text)) return "Flaggen";
  if (/licht|laterne|topplicht|hecklicht|seitenlicht|rundumlicht/.test(text)) return "Lichter";
  if (/wetter|wind|welle|wolke|luftdruck|gewitter|front|nebel|beaufort/.test(text)) return "Wetter";
  if (/notfall|rett|brand|mann über bord|notruf|erste hilfe|sicherheit|schlepp|anker/.test(text)) return "Sicherheit";
  if (/recht|regel|ausweich|vorfahrt|kollisions/.test(text)) return "Regeln";
  if (/karte|navigation|peil|kompass|kurs|fahrwasser|tonne|seezeichen|kardinal|bake|seemeile/.test(text)) return "Navigation";
  return "Seemannschaft";
}
function filteredPool(pool, topic) {
  topic = topic || settings.topic;
  return pool.filter(function(q) { return topic === "Alle Themen" || (topic === "Bildfragen" ? !!q.image : topicOf(q) === topic); });
}
function recordAnswer(q, correct) {
  var topic = topicOf(q);
  stats[topic] = stats[topic] || { seen: 0, correct: 0 };
  stats[topic].seen += 1;
  if (correct) { stats[topic].correct += 1; mistakes.delete(q.id); } else mistakes.add(q.id);
  saveStats(); saveMistakes();
}
function applyTextSize() { document.documentElement.dataset.textSize = settings.textSize; }


const LETTERS = ["A", "B", "C", "D"];
const ICON = '<img class="hero-logo" src="./icons/icon-512.png" alt="NautikTrainer Kompasslogo">';

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function cleanPrompt(value) {
  return value.toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function uniqueQuestionPool(items) {
  const seen = new Set();
  const repeatedFacts = new Set(["book-032", "book-066", "extra-004", "extra-010", "extra-011", "extra-012", "extra-019", "extra-021", "extra-022", "extra-023", "extra-028", "extra-030"]);
  return items.filter(item => {
    if (repeatedFacts.has(item.id)) return false;
    const key = cleanPrompt(item.prompt);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function makeOptions(question) {
  return shuffle(question.options.map((text, index) => ({ text, correct: index === question.correct })));
}
function svgFrame(body, viewBox = "0 0 360 210") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Nautische Illustration"><rect width="100%" height="100%" rx="18" fill="#f5faf8"/>${body}</svg>`;
}
function illustration(id) {
  const navy = "#123250", teal = "#009b91", cream = "#fff9e8", red = "#cf3c42", green = "#16835a", yellow = "#f5d452", blue = "#1268a0";
  const art = {
    "lateral-green-cone": `<path d="M180 30v145" stroke="#6d8190" stroke-width="5"/><path d="M164 65 180 35 196 65Z" fill="${green}"/><path d="M157 67h46l-10 91h-26Z" fill="${green}"/><path d="M130 160h100" stroke="${navy}" stroke-width="5"/><path d="M140 172h80" stroke="#9eb2bb" stroke-width="3"/>`,
    "cardinal-north": `<path d="M180 30 207 74h-54Z" fill="#111827"/><path d="M180 82 207 126h-54Z" fill="#111827"/><rect x="154" y="130" width="52" height="26" fill="#111827"/><rect x="154" y="156" width="52" height="16" fill="${yellow}"/><path d="M140 174h80" stroke="${navy}" stroke-width="5"/>`,
    "isolated-danger": `<circle cx="180" cy="37" r="15" fill="#111827"/><circle cx="180" cy="65" r="15" fill="#111827"/><rect x="151" y="83" width="58" height="38" fill="#111827"/><rect x="151" y="121" width="58" height="38" fill="${red}"/><rect x="151" y="159" width="58" height="24" fill="#111827"/><path d="M136 185h88" stroke="${navy}" stroke-width="5"/>`,
    "safe-water": `<circle cx="180" cy="38" r="14" fill="${red}"/><rect x="150" y="55" width="60" height="126" fill="#fff" stroke="${navy}" stroke-width="3"/><path d="M150 76h60M150 98h60M150 120h60M150 142h60M150 164h60" stroke="${red}" stroke-width="14"/><path d="M136 184h88" stroke="${navy}" stroke-width="5"/>`,
    "special-mark": `<path d="M180 30v142" stroke="#788894" stroke-width="5"/><rect x="150" y="46" width="60" height="127" rx="8" fill="${yellow}" stroke="${navy}" stroke-width="3"/><path d="m163 62 34 34m0-34-34 34m0 20 34 34m0-34-34 34" stroke="#293844" stroke-width="7"/><path d="M136 178h88" stroke="${navy}" stroke-width="5"/>`,
    "signal-flag-alfa": `<path d="M82 28v156" stroke="#617786" stroke-width="6"/><path d="M88 37h190v92l-36-46 36-46" fill="${blue}" stroke="${navy}" stroke-width="3"/><path d="M88 37h95v92H88Z" fill="#fff" stroke="${navy}" stroke-width="2"/>`,
    "signal-flag-oscar": `<path d="M82 28v156" stroke="#617786" stroke-width="6"/><rect x="88" y="38" width="190" height="110" fill="${yellow}" stroke="${navy}" stroke-width="3"/><path d="M88 38h190L88 148Z" fill="${red}"/>`,
    "light-sectors": `<path d="M180 112 75 35A130 130 0 0 1 180 0Z" fill="#fff3bf" stroke="#cfb858"/><path d="M180 112V0A130 130 0 0 1 310 112Z" fill="#fbd0d0" stroke="#d99"/><path d="M180 112h130a130 130 0 0 1-65 112Z" fill="#c7ead9" stroke="#8bbaa5"/><path d="M180 112 245 224A130 130 0 0 1 115 224Z" fill="#e5ecf3" stroke="#a6b4c2"/><path d="M180 112 75 35M180 112V0M180 112h130" stroke="${navy}" stroke-width="2"/><path d="M125 103 180 86q35 26 0 52l-55-5Z" fill="${navy}"/><circle cx="190" cy="112" r="8" fill="#fff"/>`,
    "lights-not-under-command": `<path d="M180 155V84" stroke="${navy}" stroke-width="5"/><circle cx="180" cy="58" r="17" fill="${red}" stroke="#8f2025" stroke-width="3"/><circle cx="180" cy="97" r="17" fill="${red}" stroke="#8f2025" stroke-width="3"/><path d="M115 160h130l-25 26h-80Z" fill="${navy}"/><path d="M126 159 110 114m124 45 16-45" stroke="#6b7e8e" stroke-width="3"/>`,
    "lights-power-vessel-under-50m": `<path d="M180 145V62" stroke="${navy}" stroke-width="5"/><circle cx="180" cy="47" r="16" fill="#fff" stroke="#7c8e9c" stroke-width="3"/><circle cx="137" cy="125" r="16" fill="${red}"/><circle cx="223" cy="125" r="16" fill="${green}"/><path d="M110 157h140l-25 27h-90Z" fill="${navy}"/>`,
    "lights-anchored-under-50m": `<path d="M180 48v113" stroke="#718393" stroke-width="4"/><circle cx="180" cy="56" r="20" fill="#fff" stroke="#718393" stroke-width="3"/><path d="M115 163h130l-25 26h-80Z" fill="${navy}"/>`,
    "chart-depth-colors": `<path d="M30 40h122v130H30Z" fill="#f2e4a1"/><path d="M152 40h65v130h-65Z" fill="#1767a8"/><path d="M217 40h65v130h-65Z" fill="#8ec5e8"/><path d="M282 40h48v130h-48Z" fill="#fff" stroke="#cbd5e1"/><path d="M152 40v130m65-130v130m65-130v130" stroke="#fff" stroke-width="3"/><path d="M40 178h280" stroke="${navy}" stroke-width="3"/>`,
    "north-directions": `<circle cx="180" cy="108" r="76" fill="#fff" stroke="#ccd9dc" stroke-width="2"/><path d="M180 108V33" stroke="${teal}" stroke-width="7" stroke-linecap="round"/><path d="m169 48 11-17 11 17" fill="${teal}"/><path d="M180 108 240 62" stroke="#dc6c56" stroke-width="7" stroke-linecap="round"/><path d="m222 62 18-1-7 17" fill="#dc6c56"/><path d="M180 108 122 59" stroke="#3d78ae" stroke-width="7" stroke-linecap="round"/><path d="m137 60-18-1 7 17" fill="#3d78ae"/><circle cx="180" cy="108" r="6" fill="${navy}"/><text x="180" y="24" text-anchor="middle" fill="${navy}" font-size="15" font-weight="700">RwN</text><text x="257" y="60" fill="${navy}" font-size="15" font-weight="700">MwN</text><text x="80" y="57" fill="${navy}" font-size="15" font-weight="700">KwN</text>`,
    "warm-front-cloud-sequence": `<path d="M34 160H326" stroke="#78909b" stroke-width="3"/><path d="m315 152 12 8-12 8" fill="none" stroke="#78909b" stroke-width="3"/><g fill="#dce8ef" stroke="#718491" stroke-width="2"><path d="M47 88q11-20 29-10 13-25 33-5 25-3 25 17 0 11-13 13H51q-12-3-4-15Z"/><path d="M126 89q12-23 32-10 14-29 36-7 25-5 30 16 2 14-14 15h-77q-16-4-7-14Z"/><path d="M213 88q11-22 30-10 14-27 36-6 24-3 27 17 1 13-15 14h-71q-16-3-7-15Z"/></g><path d="M229 126v18m20-18v18m20-18v18" stroke="#458dc4" stroke-width="4" stroke-linecap="round"/><path d="M56 120q35-28 68-14m15 16q34-29 66-14m14 14q35-29 68-13" fill="none" stroke="#a8bac6" stroke-width="3"/>`

    ,"signal-flag-bravo": '<path d="M82 28v156" stroke="#617786" stroke-width="6"/><path d="M88 38h190l-26 52 26 52H88Z" fill="#cf3c42" stroke="#123250" stroke-width="3"/>'
    ,"signal-flag-charlie": '<path d="M82 28v156" stroke="#617786" stroke-width="6"/><rect x="88" y="38" width="190" height="110" fill="#fff" stroke="#123250" stroke-width="3"/><path d="M88 38h190v18H88Zm0 36h190v18H88Zm0 36h190v20H88Z" fill="#1268a0"/>'
    ,"signal-flag-hotel": '<path d="M82 28v156" stroke="#617786" stroke-width="6"/><rect x="88" y="38" width="95" height="110" fill="#fff" stroke="#123250" stroke-width="3"/><rect x="183" y="38" width="95" height="110" fill="#cf3c42" stroke="#123250" stroke-width="3"/>'
    ,"signal-flag-quebec": '<path d="M82 28v156" stroke="#617786" stroke-width="6"/><rect x="88" y="38" width="190" height="110" fill="#f5d452" stroke="#123250" stroke-width="3"/>'
  };
  return art[id] ? svgFrame(art[id]) : "";
}
function showHome() {
  game = null;
  var pool = filteredPool(uniqueQuestionPool(bank));
  var topics = ["Lichter","Flaggen","Navigation","Wetter","Sicherheit","Regeln","Seemannschaft"];
  var topicStats = topics.filter(function(t){return stats[t] && stats[t].seen;}).map(function(t){
    return '<span class="topic-progress"><b>'+t+'</b><span>'+stats[t].correct+'/'+stats[t].seen+' richtig</span></span>';
  }).join("");
  var options = ["Alle Themen","Flaggen","Lichter","Navigation","Wetter","Sicherheit","Regeln","Seemannschaft","Bildfragen"].map(function(t){
    return '<option value="'+t+'" '+(settings.topic===t?"selected":"")+'>'+t+'</option>';
  }).join("");
  app.innerHTML = '<section class="hero">'+ICON+
    '<p class="eyebrow">Dein persönlicher Nautiktrainer</p><h1>Bereit zum Ablegen?</h1>'+
    '<p class="hero-copy">Übe in deinem Tempo oder starte eine Prüfung.</p>'+
    '<div class="home-controls"><label for="topicFilter">Thema</label><select id="topicFilter">'+options+'</select><button id="settingsButton" class="secondary-button" type="button">Einstellungen</button></div>'+
    '<div class="mode-grid">'+
    '<button class="mode-card" id="learnMode" type="button"><span class="mode-icon" aria-hidden="true">✦</span><h2>Lernen</h2><p>Zufällige Reihenfolge, sofortige Rückmeldung und Erklärung.</p></button>'+
    '<button class="mode-card exam" id="examMode" type="button"><span class="mode-icon" aria-hidden="true">✓</span><h2>Prüfung</h2><p>'+settings.examLength+' zufällige Fragen. Ergebnis am Schluss.</p></button></div>'+
    '<div class="quick-actions"><button id="reviewErrors" class="secondary-button" '+(mistakes.size?"":"disabled")+'>Falsche Fragen wiederholen ('+mistakes.size+')</button>'+
    '<button id="reviewFavorites" class="secondary-button" '+(favorites.size?"":"disabled")+'>Merkliste üben ('+favorites.size+')</button>'+
    '<button id="imagePractice" class="secondary-button">Bildfragen üben</button></div>'+
    (topicStats?'<section class="progress-summary"><h2>Dein Lernfortschritt</h2><div>'+topicStats+'</div></section>':'<p class="progress-empty">Dein Fortschritt erscheint hier, sobald du Fragen beantwortet hast.</p>')+
    '<p class="bank-note">'+pool.length+' Fragen in der Auswahl · vier Antwortmöglichkeiten · offline verfügbar</p>'+
    '</section><dialog id="settingsDialog" class="dialog settings-dialog"><form method="dialog"><button class="dialog-close" aria-label="Schließen">×</button></form>'+
    '<h2>Einstellungen</h2><label>Fragen pro Prüfung<select id="examLength"><option value="10">10 Fragen</option><option value="20">20 Fragen</option><option value="30">30 Fragen</option><option value="50">50 Fragen</option></select></label>'+
    '<label>Schriftgröße<select id="textSize"><option value="normal">Normal</option><option value="large">Groß</option></select></label>'+
    '<button id="saveSettings" class="primary-button" type="button">Speichern</button></dialog>';
  applyTextSize();
  document.querySelector("#topicFilter").addEventListener("change",function(e){settings.topic=e.target.value;saveSettings();showHome();});
  document.querySelector("#learnMode").addEventListener("click",function(){startGame("learn");});
  document.querySelector("#examMode").addEventListener("click",function(){startGame("exam");});
  document.querySelector("#reviewErrors").addEventListener("click",function(){startGame("learn","mistakes");});
  document.querySelector("#reviewFavorites").addEventListener("click",function(){startGame("learn","favorites");});
  document.querySelector("#imagePractice").addEventListener("click",function(){startGame("learn","images");});
  var dialog=document.querySelector("#settingsDialog");
  document.querySelector("#settingsButton").addEventListener("click",function(){
    document.querySelector("#examLength").value=String(settings.examLength);
    document.querySelector("#textSize").value=settings.textSize;dialog.showModal();
  });
  document.querySelector("#saveSettings").addEventListener("click",function(){
    settings.examLength=Number(document.querySelector("#examLength").value);
    settings.textSize=document.querySelector("#textSize").value;saveSettings();dialog.close();showHome();
  });
}
function startGame(mode, special) {
  var pool=uniqueQuestionPool(bank);
  if(special==="mistakes") pool=pool.filter(function(q){return mistakes.has(q.id);});
  else if(special==="favorites") pool=pool.filter(function(q){return favorites.has(q.id);});
  else if(special==="images") pool=pool.filter(function(q){return !!q.image;});
  else pool=filteredPool(pool);
  if(!pool.length){window.alert("Für diese Auswahl gibt es noch keine Fragen.");return;}
  var questions=mode==="exam"?shuffle(pool).slice(0,Math.min(settings.examLength,pool.length)):shuffle(pool);
  game={mode:mode,special:special,questions:questions,index:0,score:0,currentOptions:null,answered:false,wrong:[]};
  showQuestion();
}
function showQuestion() {
  if (!game || game.index >= game.questions.length) return game.mode === "exam" ? showExamResult() : showLearnResult();
  const q = game.questions[game.index];
  game.currentOptions = makeOptions(q);
  game.answered = false;
  const total = game.questions.length;
  const number = game.index + 1;
  const modeName = game.mode === "learn" ? "Lernen" : "Prüfung";
  const meta = topicOf(q) + (q.image ? " · Bildfrage" : "");
  const image = q.image ? `<figure class="visual">${illustration(q.image)}</figure>` : "";
  app.innerHTML = `<section class="question-wrap">
    <div class="quiz-head"><div><p class="quiz-mode">${modeName}</p><button class="exit-button" id="exitQuiz" type="button">← Übersicht</button></div><span class="quiz-count">Frage ${number} von ${total}</span><button id="favoriteQuestion" class="favorite-button" type="button" aria-label="${favorites.has(q.id)?"Aus Merkliste entfernen":"In Merkliste speichern"}">${favorites.has(q.id)?"★":"☆"}</button></div>
    <div class="progress" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${number}"><span style="width:${number / total * 100}%"></span></div>
    <article class="question-card">
      <p class="question-meta">${meta}</p>
      <h1 class="question-title" id="questionTitle"></h1>
      ${image}
      <div class="answers" id="answers"></div>
      <div id="feedback" aria-live="assertive"></div>
      <div class="quiz-actions"><span></span><button id="nextButton" type="button" class="primary-button" disabled>${number === total ? (game.mode === "exam" ? "Auswertung anzeigen" : "Lernrunde beenden") : "Weiter"}</button></div>
    </article>
  </section>`;
  document.querySelector("#questionTitle").textContent = q.prompt;
  const answers = document.querySelector("#answers");
  game.currentOptions.forEach((option, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.innerHTML = `<span class="answer-letter">${LETTERS[i]}</span><span class="answer-text"></span>`;
    button.querySelector(".answer-text").textContent = option.text;
    button.addEventListener("click", () => chooseAnswer(i));
    answers.append(button);
  });
  document.querySelector("#exitQuiz").addEventListener("click", showHome);
  document.querySelector("#favoriteQuestion").addEventListener("click", function(e){
    if(favorites.has(q.id))favorites.delete(q.id);else favorites.add(q.id);saveFavorites();
    var saved=favorites.has(q.id);e.currentTarget.textContent=saved?"★":"☆";
    e.currentTarget.setAttribute("aria-label",saved?"Aus Merkliste entfernen":"In Merkliste speichern");
  });
  document.querySelector("#nextButton").addEventListener("click", () => { game.index += 1; showQuestion(); });
}
function chooseAnswer(index) {
  if (!game || game.answered) return;
  game.answered = true;
  const buttons = [...document.querySelectorAll(".answer")];
  const chosen = game.currentOptions[index];
  buttons.forEach((button, i) => {
    button.disabled = true;
    if (game.mode === "learn") {
      if (game.currentOptions[i].correct) button.classList.add("correct");
      else if (i === index && !chosen.correct) button.classList.add("incorrect");
    }
  });
  recordAnswer(game.questions[game.index],chosen.correct);
  if (chosen.correct) game.score += 1; else game.wrong.push(game.questions[game.index].id);
  const feedback = document.querySelector("#feedback");
  if (game.mode === "learn") {
    feedback.className = `feedback ${chosen.correct ? "good" : "bad"}`;
    const q = game.questions[game.index];
    const explanation = q.explanation || ({Flaggen:"Farben und Muster kennzeichnen eine festgelegte Meldung.",Lichter:"Bei Lichterbildern zählen Farbe, Position und Sichtbereich.",Navigation:"Vergleiche das Zeichen oder die Kartenangabe mit der beschriebenen Situation.",Wetter:"Beziehe Wind, Sicht und Wetterentwicklung gemeinsam in die Beurteilung ein.",Sicherheit:"Erkenne die Situation und wähle die passende Maßnahme."}[topicOf(q)] || "Achte auf die nautischen Fachbegriffe und präge dir die richtige Antwort ein.");
    feedback.textContent = (chosen.correct ? "Richtig! " : `Noch nicht ganz. Richtig ist: ${game.currentOptions.find(x => x.correct).text}. `) + `Erklärung: ${explanation}`;
  } else {
    feedback.className = "feedback subtle";
    feedback.textContent = "Antwort gespeichert. Weiter zur nächsten Frage.";
  }
  document.querySelector("#nextButton").disabled = false;
}
function showExamResult() {
  const total = game.questions.length;
  const percent = Math.round((game.score / total) * 100);
  app.innerHTML = `<section class="result"><img class="result-logo" src="./icons/icon-192.png" alt=""><p class="eyebrow">Prüfung abgeschlossen</p><h1>Dein Ergebnis</h1><div class="score-ring" style="--score:${percent * 3.6}deg"><span class="score-number">${percent}%</span></div><p class="result-text">${game.score} von ${total} Fragen richtig · ${game.wrong.length} falsch.</p><div class="result-actions"><button id="newExam" class="primary-button" type="button">Neue Prüfung</button><button id="wrongReview" class="secondary-button" type="button" ${game.wrong.length?"":"disabled"}>Falsche wiederholen</button><button id="resultHome" class="secondary-button" type="button">Zur Übersicht</button></div></section>`;
  document.querySelector("#newExam").addEventListener("click", () => startGame("exam"));
  document.querySelector("#wrongReview").addEventListener("click", () => startGame("learn","mistakes"));
  document.querySelector("#resultHome").addEventListener("click", showHome);
}
function showLearnResult() {
  app.innerHTML = `<section class="result"><img class="result-logo" src="./icons/icon-192.png" alt=""><p class="eyebrow">Lernrunde abgeschlossen</p><h1>Gut geübt!</h1><p class="result-text">${game.score} von ${game.questions.length} Fragen richtig. ${game.wrong.length} falsche Antworten kannst du gleich wiederholen.</p><div class="result-actions"><button id="newLearn" class="primary-button" type="button">Neue Lernrunde</button><button id="wrongReview" class="secondary-button" type="button" ${game.wrong.length?"":"disabled"}>Falsche wiederholen</button><button id="resultHome" class="secondary-button" type="button">Zur Übersicht</button></div></section>`;
  document.querySelector("#newLearn").addEventListener("click", () => startGame("learn"));
  document.querySelector("#wrongReview").addEventListener("click", () => startGame("learn","mistakes"));
  document.querySelector("#resultHome").addEventListener("click", showHome);
}
function openInstallHelp() {
  const isApple = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  iosHint.classList.toggle("hidden", !isApple);
  confirmInstall.classList.toggle("hidden", !deferredInstallPrompt);
  installDialog.showModal();
}
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.classList.remove("hidden");
  confirmInstall.classList.remove("hidden");
});
installButton.addEventListener("click", openInstallHelp);
installHelp.addEventListener("click", openInstallHelp);
confirmInstall.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
  installDialog.close();
});
homeButton.addEventListener("click", showHome);

fetch("./data/questions.json").then(response => {
  if (!response.ok) throw new Error("Fragen konnten nicht geladen werden.");
  return response.json();
}).then(data => {
  bank = data;
  showHome();
}).catch(() => {
  app.innerHTML = `<section class="result"><h1>Fragen nicht geladen</h1><p class="result-text">Bitte lade die App erneut, sobald eine Verbindung besteht.</p></section>`;
});
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
