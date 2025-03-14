document.addEventListener('DOMContentLoaded', function() {
    // Aktuelles Jahr
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Panels
    initCollapsiblePanels();

    // Sidebar
    initSidebar();

    // Quiz
    initQuiz();

    // Tracking
    initScrollTracking();
});

// Quiz-Daten
const quizQuestions = [
    {
        id: "q1",
        question: "Was ist ein absoluter Kostenvorteil?",
        options: [
            "Die Fähigkeit, ein Gut zu geringeren Opportunitätskosten herzustellen als ein anderer Produzent",
            "Die Fähigkeit, ein Gut mit weniger Ressourceneinsatz herzustellen als ein anderer Produzent",
            "Der Verzicht auf eine Alternative, wenn man sich für die Produktion eines bestimmten Gutes entscheidet",
            "Die Differenz zwischen den Produktionskosten zweier Länder für dasselbe Gut"
        ],
        correctOption: 1
    },
    {
        id: "q2",
        question: "Was sind Opportunitätskosten?",
        options: [
            "Die direkten finanziellen Kosten der Produktion eines Gutes",
            "Die Kosten, die entstehen, wenn man ein Gut unter optimalen Bedingungen produziert",
            "Der entgangene Nutzen der besten nicht gewählten Alternative",
            "Die Kosten, die durch Ineffizienzen in der Produktion entstehen"
        ],
        correctOption: 2
    },
    {
        id: "q3",
        question: "Was ist ein komparativer Kostenvorteil?",
        options: [
            "Die Fähigkeit, ein Gut billiger zu produzieren als jeder andere Produzent",
            "Die Fähigkeit, mehr von einem Gut zu produzieren als andere Länder mit denselben Ressourcen",
            "Die Differenz zwischen den Kosten der Produktion desselben Gutes in verschiedenen Ländern",
            "Die Fähigkeit, ein Gut zu geringeren Opportunitätskosten herzustellen als ein anderer Produzent"
        ],
        correctOption: 3
    },
    {
        id: "q4",
        question: "Land A kann 10 Computer oder 20 Fernseher produzieren. Land B kann 5 Computer oder 15 Fernseher produzieren. Welches Land hat einen komparativen Kostenvorteil bei der Produktion von Fernsehern?",
        options: [
            "Land A, weil es absolut mehr Fernseher produzieren kann",
            "Land B, weil die Opportunitätskosten für einen Fernseher geringer sind (1/3 Computer vs. 1/2 Computer)",
            "Land A, weil die Opportunitätskosten für einen Fernseher geringer sind",
            "Beide Länder haben den gleichen komparativen Kostenvorteil"
        ],
        correctOption: 1
    },
    {
        id: "q5",
        question: "Warum ist der internationale Handel auch dann vorteilhaft, wenn ein Land in der Produktion aller Güter einen absoluten Nachteil hat?",
        options: [
            "Weil das Land mit dem absoluten Nachteil immer von Subventionen des anderen Landes profitiert",
            "Weil das Land mit dem absoluten Nachteil keine andere Wahl hat",
            "Weil das Land sich auf die Produktion von Gütern spezialisieren kann, bei denen es einen komparativen Vorteil hat (geringere Opportunitätskosten)",
            "Handel ist in diesem Fall nicht vorteilhaft"
        ],
        correctOption: 2
    }
];

// Ausklapp-Boxen
function initCollapsiblePanels() {
    const panels = document.querySelectorAll('.collapsible-panel');

    panels.forEach(panel => {
        const header = panel.querySelector('.panel-header');
        const content = panel.querySelector('.panel-content');
        const panelId = panel.getAttribute('data-id');

        // Wenn das Panel früher schon mal ausgeklappt wurde (aus localStorage), 
        // klappe es nicht automatisch aus, aber zähle es als gesehen für den Fortschritt

        header.addEventListener('click', () => {
            const isActive = header.classList.contains('active');

            // Aktiv-Status umschalten
            if (isActive) {
                header.classList.remove('active');
                content.classList.remove('active');
                // Nicht aus expandedPanels entfernen, damit der Fortschritt erhalten bleibt
            } else {
                header.classList.add('active');
                content.classList.add('active');
                recordPanelExpansion(panelId);
            }
        });
    });
}

// Sidebar-Steuerung
function initSidebar() {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Seitenleiste schließen, wenn auf einen Link geklickt wird (bei mobilen Geräten)
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
                sidebar.classList.remove('active');
            }
        });
    });
}

// Quiz-Setup
function initQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    const evaluateBtn = document.getElementById('evaluate-quiz');
    const resetBtn = document.getElementById('reset-quiz');
    const resultsContainer = document.getElementById('quiz-results');
    const errorAlert = document.getElementById('quiz-error');

    let selectedAnswers = {};
    let localQuizCompleted = false;

    // Gespeicherten Quizstatus laden, falls vorhanden
    if (quizCompleted) {
        resetBtn.style.display = 'inline-block';
        evaluateBtn.style.display = 'none';
        localQuizCompleted = true;
    }

    // Quizfragen anzeigen
    renderQuiz();

    // Quiz auswerten
    evaluateBtn.addEventListener('click', () => {
        if (Object.keys(selectedAnswers).length < quizQuestions.length) {
            errorAlert.style.display = 'block';
            return;
        }

        errorAlert.style.display = 'none';
        const results = evaluateQuiz();
        showResults(results);

        evaluateBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';

        // Globalen Quizstatus aktualisieren
        localQuizCompleted = true;
        quizCompleted = true;
        updateProgress();
        saveProgress();
    });

    // Quiz zurücksetzen
    resetBtn.addEventListener('click', () => {
        selectedAnswers = {};

        // UI zurücksetzen
        resultsContainer.style.display = 'none';
        resetBtn.style.display = 'none';
        evaluateBtn.style.display = 'inline-block';

        // Optionsauswahl zurücksetzen
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
        });

        // Ergebnisanzeigen entfernen
        const resultDisplays = document.querySelectorAll('.quiz-result');
        resultDisplays.forEach(result => {
            result.remove();
        });

        // Lokalen Status zurücksetzen (globaler Status bleibt bestehen für Fortschritt)
        localQuizCompleted = false;

        // Globalen Quizstatus nicht ändern, damit Fortschritt erhalten bleibt
        // So kann der Fortschritt nur nach oben gehen
    });

    function renderQuiz() {
        // Container leeren
        quizContainer.innerHTML = '';

        // Jede Frage durchlaufen und anzeigen
        quizQuestions.forEach((question, qIndex) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question';

            const questionTitle = document.createElement('h3');
            questionTitle.textContent = `Frage ${qIndex + 1}: ${question.question}`;
            questionTitle.className = 'mb-3';

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quiz-options';

            question.options.forEach((option, oIndex) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'quiz-option';
                optionDiv.textContent = option;

                // Klick-Ereignis hinzufügen
                optionDiv.addEventListener('click', () => {
                    if (!localQuizCompleted) {
                        // Auswahl von allen anderen Optionen dieser Frage entfernen
                        optionsDiv.querySelectorAll('.quiz-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });

                        // Diese Option als ausgewählt markieren
                        optionDiv.classList.add('selected');

                        // Ausgewählte Antwort speichern
                        selectedAnswers[question.id] = oIndex;
                    }
                });

                optionsDiv.appendChild(optionDiv);
            });

            questionDiv.appendChild(questionTitle);
            questionDiv.appendChild(optionsDiv);
            quizContainer.appendChild(questionDiv);
        });
    }

    function evaluateQuiz() {
        // Ergebnisobjekt vorbereiten
        const results = {
            correct: 0,
            incorrect: 0,
            questions: {}
        };

        // Jede Frage auswerten
        quizQuestions.forEach(question => {
            const isCorrect = selectedAnswers[question.id] === question.correctOption;
            results.questions[question.id] = isCorrect;

            // Zähler aktualisieren
            if (isCorrect) {
                results.correct++;
            } else {
                results.incorrect++;
            }
        });

        return results;
    }

    function showResults(results) {
        // Richtige und falsche Antworten markieren
        quizQuestions.forEach(question => {
            const questionDiv = document.querySelector(`.quiz-question:nth-child(${quizQuestions.findIndex(q => q.id === question.id) + 1})`);
            const options = questionDiv.querySelectorAll('.quiz-option');

            // Nutzerauswahl markieren
            if (selectedAnswers[question.id] !== undefined) {
                const selectedOption = options[selectedAnswers[question.id]];
                if (selectedAnswers[question.id] === question.correctOption) {
                    selectedOption.classList.add('correct');
                } else {
                    selectedOption.classList.add('incorrect');
                    // Richtige Antwort markieren
                    options[question.correctOption].classList.add('correct');
                }
            }

            // Ergebnismeldung hinzufügen
            const resultDiv = document.createElement('div');
            resultDiv.className = `quiz-result ${results.questions[question.id] ? 'correct' : 'incorrect'}`;
            resultDiv.textContent = results.questions[question.id] ? 'Richtig! 👍' : 'Falsch! Die richtige Antwort ist markiert.';
            questionDiv.appendChild(resultDiv);
        });

        // Gesamtergebnis anzeigen
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'block';

        const resultTitle = document.createElement('h3');
        resultTitle.textContent = 'Ergebnis';

        const resultScore = document.createElement('p');
        resultScore.textContent = `Du hast ${results.correct} von ${quizQuestions.length} Fragen richtig beantwortet.`;

        const resultMessage = document.createElement('p');
        resultMessage.textContent = getResultMessage(results.correct, quizQuestions.length);

        if (results.correct === quizQuestions.length) {
            resultMessage.style.color = 'var(--success-color)';
        } else if (results.correct >= 3) {
            resultMessage.style.color = 'var(--primary-dark)';
        } else {
            resultMessage.style.color = 'var(--error-color)';
        }

        resultsContainer.appendChild(resultTitle);
        resultsContainer.appendChild(resultScore);
        resultsContainer.appendChild(resultMessage);
    }

    function getResultMessage(score, total) {
        const percentage = (score / total) * 100;

        if (percentage === 100) {
            return "Hervorragend! Du hast alle Fragen richtig beantwortet. Du hast die Konzepte der wirtschaftlichen Kostenvorteile vollständig verstanden.";
        } else if (percentage >= 60) {
            return "Gut gemacht! Du hast die meisten Konzepte verstanden. Vielleicht möchtest du die Abschnitte zu den falsch beantworteten Fragen noch einmal durchlesen.";
        } else {
            return "Du solltest die Konzepte noch einmal durcharbeiten, um dein Verständnis zu verbessern.";
        }
    }
}

// Fortschritt-Variablen
let viewedSections = new Set();
let expandedPanels = new Set();
let quizCompleted = false;

// Gewichtung
const SECTIONS_WEIGHT = 50;  // Abschnitte
const PANELS_WEIGHT = 30;    // Infos
const QUIZ_WEIGHT = 20;      // Quiz

// Scroll-Tracking
function initScrollTracking() {
    // Fortschritt laden
    loadProgress();

    const sections = document.querySelectorAll('.content-section');

    // Scroll überwachen
    window.addEventListener('scroll', function() {
        // 100ms Verzögerung
        if (!window.scrollCheckTimeout) {
            window.scrollCheckTimeout = setTimeout(function() {
                checkVisibleSections();
                window.scrollCheckTimeout = null;
            }, 100);
        }
    });

    // Initiale Prüfung
    checkVisibleSections();

    // Beim Verlassen speichern
    window.addEventListener('beforeunload', saveProgress);
}

// Aus localStorage laden
function loadProgress() {
    try {
        // Abschnitte
        const savedSections = localStorage.getItem('viewedSections');
        if (savedSections) {
            viewedSections = new Set(JSON.parse(savedSections));
        }

        // Panels
        const savedPanels = localStorage.getItem('expandedPanels');
        if (savedPanels) {
            expandedPanels = new Set(JSON.parse(savedPanels));
        }

        // Quiz
        const savedQuizStatus = localStorage.getItem('quizCompleted');
        if (savedQuizStatus) {
            quizCompleted = JSON.parse(savedQuizStatus);
        }

        // UI aktualisieren
        updateProgress();
    } catch (error) {
        console.error('Fehler beim Laden des Fortschritts:', error);
    }
}

// In localStorage speichern
function saveProgress() {
    try {
        localStorage.setItem('viewedSections', JSON.stringify([...viewedSections]));
        localStorage.setItem('expandedPanels', JSON.stringify([...expandedPanels]));
        localStorage.setItem('quizCompleted', JSON.stringify(quizCompleted));
    } catch (error) {
        console.error('Fehler beim Speichern des Fortschritts:', error);
    }
}

// Sichtbare Abschnitte prüfen
function checkVisibleSections() {
    const sections = document.querySelectorAll('.content-section');
    let progressUpdated = false;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Mind. 30% sichtbar = gesehen
        if (rect.top < windowHeight * 0.7 && rect.bottom > windowHeight * 0.3) {
            if (!viewedSections.has(section.id)) {
                viewedSections.add(section.id);
                progressUpdated = true;
            }
        }
    });

    if (progressUpdated) {
        updateProgress();
        saveProgress();
    }
}

// Panel-Expansion tracken
function recordPanelExpansion(panelId) {
    expandedPanels.add(panelId);
    updateProgress();
    saveProgress();
}

// Progress-UI updaten (immer aufwärts)
function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const totalSections = document.querySelectorAll('.content-section').length;
    const totalPanels = document.querySelectorAll('.collapsible-panel').length;

    // Komponenten berechnen
    const sectionsProgress = (viewedSections.size / totalSections) * SECTIONS_WEIGHT;
    const panelsProgress = (expandedPanels.size / totalPanels) * PANELS_WEIGHT;
    const quizProgress = quizCompleted ? QUIZ_WEIGHT : 0;

    const totalProgress = Math.min(100, Math.round(sectionsProgress + panelsProgress + quizProgress));

    // Nie abwärts gehen
    const currentProgress = parseInt(progressPercentage.textContent) || 0;
    const finalProgress = Math.max(currentProgress, totalProgress);

    // UI aktualisieren
    progressBar.style.width = `${finalProgress}%`;
    progressPercentage.textContent = `${finalProgress}%`;
}
