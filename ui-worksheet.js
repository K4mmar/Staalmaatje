// ===================================================================================
// UI-WORKSHEET.JS - De 'vormgever' van het werkblad
// Deze functie is verantwoordelijk voor het omzetten van de data naar HTML.
// ===================================================================================

// Functie om te wisselen tussen tabbladen
window.switchTab = function(tabName) {
    const studentPanel = document.getElementById('tab-panel-student');
    const answerPanel = document.getElementById('tab-panel-answer');
    const studentBtn = document.getElementById('tab-btn-student');
    const answerBtn = document.getElementById('tab-btn-answer');

    if (tabName === 'student') {
        studentPanel.classList.remove('hidden');
        answerPanel.classList.add('hidden');
        studentBtn.classList.add('active-tab-btn');
        answerBtn.classList.remove('active-tab-btn');
    } else {
        studentPanel.classList.add('hidden');
        answerPanel.classList.remove('hidden');
        studentBtn.classList.remove('active-tab-btn');
        answerBtn.classList.add('active-tab-btn');
    }
}

// Functie om het werkblad te renderen (maak hem globaal beschikbaar)
window.renderWorksheet = function(worksheetData, selectedCatIds, currentGroup) {
    const worksheetOutput = document.getElementById('worksheet-output');
    if (!worksheetOutput) {
        console.error("Element #worksheet-output niet gevonden.");
        return;
    }

    // Gebruik de globale 'categories' variabele (ervan uitgaande dat data.js geladen is)
    const categoriesMap = typeof categories !== 'undefined' ? categories : {};

    const groupDisplay = currentGroup === '7' ? '7/8' : currentGroup;

    const wordListHeader = `
        <div class="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 class="font-semibold text-lg mb-2">Dit zijn je 15 oefenwoorden:</h3>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-6 gap-y-1 text-gray-700">
                ${worksheetData.woordenlijst.map(item => `<span>${item.woord}</span>`).join('')}
            </div>
        </div>
    `;

    const worksheetHeader = `
        <div class="flex justify-between items-center border-b-2 pb-2 mb-6">
            <h2 class="text-2xl font-bold">Spellingwerkblad Groep ${groupDisplay}</h2>
            <div class="flex gap-4 text-sm">
                <span>Naam: _________________________</span>
                <span>Datum: _____________</span>
            </div>
        </div>
    `;

    let studentSheetHTML = `
        ${worksheetHeader}
        ${wordListHeader}
        <div class="space-y-6"> <!-- Ruimte tussen de 3 blokken -->
    `;

    const renderExerciseBlock = (title, exercises, startIndex) => {
        let blockHTML = `<div class="space-y-4"><h3 class="font-bold text-pink-600 border-b border-pink-200 pb-1 mb-4 text-xl">${title}</h3>`;

        blockHTML += '<div class="grid grid-cols-1 gap-4">';

        exercises.forEach((item, index) => {
            const itemNumber = startIndex + index + 1;
            const opdrachtTekst = item.opdracht;

            // --- GECORRIGEERD: Structuur voor uitlijning met categorie rechts ---
            blockHTML += `
                <div class="p-3 border border-gray-200 rounded-lg flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 flex-grow">
                        <span class="font-semibold text-gray-500 mt-1">${itemNumber}.</span>
                        <div class="flex-grow">
                            <p class="text-base">${opdrachtTekst}</p>
                            <div class="mt-2 h-8 border-b-2 border-gray-300"></div> <!-- Aparte schrijflijn -->
                        </div>
                    </div>
                    <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full mt-1 flex-shrink-0">${categoriesMap[item.categorie] || ''}</span>
                </div>
            `;
        });

        blockHTML += `</div></div>`;
        return blockHTML;
    };

    studentSheetHTML += renderExerciseBlock('Vul het juiste woord in', worksheetData.oefeningen.invulzinnen, 0);
    studentSheetHTML += renderExerciseBlock('Kies de juiste spelling', worksheetData.oefeningen.kies_juiste_spelling, 5);
    studentSheetHTML += renderExerciseBlock('Pas de spellingregel toe', worksheetData.oefeningen.regelvragen, 10);

    studentSheetHTML += `</div>`;

    const allExercises = [
        ...worksheetData.oefeningen.invulzinnen,
        ...worksheetData.oefeningen.kies_juiste_spelling,
        ...worksheetData.oefeningen.regelvragen
    ];

    const answerSheetHTML = `
        <h2 class="text-2xl font-bold mb-1">Antwoordenblad Groep ${groupDisplay}</h2>
        <p class="text-sm text-gray-500 mb-6">Categorieën: ${selectedCatIds.map(id => `${id}: ${categoriesMap[id]}`).join(', ')}</p>
        <table class="w-full">
            <thead><tr class="border-b"><th class="text-left py-2">Nr.</th><th class="text-left py-2">Woord</th><th class="text-left py-2">Categorie</th><th class="text-left py-2">Opdracht</th></tr></thead>
            <tbody>
                ${allExercises.map((item, index) => `
                    <tr class="border-b">
                        <td class="py-2 align-top">${index + 1}.</td>
                        <td class="py-2 align-top font-semibold">${item.woord}</td>
                        <td class="py-2 align-top">${item.categorie}. ${categoriesMap[item.categorie] || ''}</td>
                        <td class="py-2 align-top text-sm">${item.opdracht}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    worksheetOutput.innerHTML = `
        <div class="printable-area bg-white p-6 md:p-10 rounded-2xl shadow-lg max-w-4xl mx-auto">
            
            <!-- Tab Knoppen (niet printen) -->
            <div id="worksheet-tabs" class="mb-6 border-b border-gray-200 no-print">
                <nav class="-mb-px flex gap-6" aria-label="Tabs">
                    <button id="tab-btn-student" onclick="switchTab('student')" class="tab-btn active-tab-btn" type="button">
                        Werkblad
                    </button>
                    <button id="tab-btn-answer" onclick="switchTab('answer')" class="tab-btn" type="button">
                        Antwoordenblad
                    </button>
                </nav>
            </div>

            <!-- Tab Panelen -->
            <div id="tab-panel-student" class="tab-panel">
                <!-- Knoppen voor dit tabblad -->
                <div class="no-print mb-6 flex justify-end items-center gap-4">
                    <button onclick="printStudentWorksheet()" class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105">
                        <i class="fas fa-print mr-2"></i> Print Werkblad
                    </button>
                    <button id="generate-story-btn" onclick="generateStory()" class="bg-purple-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105">
                        ✨ Maak een Verhaal
                    </button>
                </div>
                
                <!-- Inhoud Werkblad (INCLUSIEF verhaal) -->
                <div id="student-sheet" class="prose max-w-none">
                    ${studentSheetHTML}
                
                    <!-- Verhaal container (nu BINNEN student-sheet en ZONDER no-print) -->
                    <div id="story-container" class="prose max-w-none mt-12"></div>
                </div>

            </div>

            <div id="tab-panel-answer" class="tab-panel hidden">
                <!-- Knoppen voor dit tabblad -->
                <div class="no-print mb-6 flex justify-end items-center gap-4">
                    <button onclick="printAnswerSheet()" class="bg-green-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-green-700 transition-transform transform hover:scale-105">
                        <i class="fas fa-print mr-2"></i> Print Antwoorden
                    </button>
                </div>
                
                <!-- Inhoud Antwoordenblad -->
                <div id="answer-sheet" class="prose max-w-none">${answerSheetHTML}</div>
            </div>

        </div>

        <!-- Stijlen voor tabbladen (inline) -->
        <style>
            .tab-btn {
                border-bottom: 2px solid transparent;
                padding: 0.5rem 1rem;
                font-size: 1rem;
                font-weight: 600;
                color: #4b5563; /* gray-600 */
                transition: all 0.2s ease;
            }
            .tab-btn:hover {
                border-bottom-color: #d1d5db; /* gray-300 */
                color: #1f2937; /* gray-800 */
            }
            .tab-btn.active-tab-btn {
                border-bottom-color: #ec4899; /* pink-500 */
                color: #ec4899; /* pink-500 */
            }
        </style>
    `;
}; // Einde van renderWorksheet functie

