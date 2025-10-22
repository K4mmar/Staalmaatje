// ===================================================================================
// UI-WORKSHEET.JS - De 'vormgever' van het werkblad
// Deze functie is verantwoordelijk voor het omzetten van de data naar HTML.
// ===================================================================================

// Globale functie om van tab te wisselen
window.switchTab = function(tabName) {
    // Verberg beide panelen
    document.getElementById('student-panel').style.display = 'none';
    document.getElementById('answer-panel').style.display = 'none';

    // Verwijder actieve stijl van beide knoppen
    document.getElementById('student-tab-btn').classList.remove('text-white', 'bg-blue-600');
    document.getElementById('student-tab-btn').classList.add('text-blue-600');
    document.getElementById('answer-tab-btn').classList.remove('text-white', 'bg-green-600');
    document.getElementById('answer-tab-btn').classList.add('text-green-600');

    // Toon het geselecteerde paneel en maak de knop actief
    if (tabName === 'student') {
        document.getElementById('student-panel').style.display = 'block';
        document.getElementById('student-tab-btn').classList.add('text-white', 'bg-blue-600');
        document.getElementById('student-tab-btn').classList.remove('text-blue-600');
    } else {
        document.getElementById('answer-panel').style.display = 'block';
        document.getElementById('answer-tab-btn').classList.add('text-white', 'bg-green-600');
        document.getElementById('answer-tab-btn').classList.remove('text-green-600');
    }
}

// Functie om het werkblad te renderen (maak hem globaal beschikbaar)
window.renderWorksheet = function(worksheetData, selectedCatIds, currentGroup) {
    const worksheetOutput = document.getElementById('worksheet-output');
    if (!worksheetOutput) {
        console.error("Element #worksheet-output niet gevonden.");
        return;
    }

    const categoriesMap = typeof categories !== 'undefined' ? categories : {};
    const groupDisplay = currentGroup === '7' ? '7/8' : currentGroup;

    const wordListHeader = `
        <div class="mb-8 p-4 border rounded-lg bg-slate-50">
            <h3 class="font-semibold text-lg mb-2">Dit zijn je 15 oefenwoorden:</h3>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-6 gap-y-1 text-gray-700">
                ${worksheetData.woordenlijst.map(item => `<span>${item.woord}</span>`).join('')}
            </div>
        </div>
    `;

    const worksheetHeader = `
        <div class="flex justify-between items-center border-b-2 border-slate-200 pb-2 mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Spellingwerkblad Groep ${groupDisplay}</h2>
            <div class="flex gap-4 text-sm text-slate-600">
                <span>Naam: __________________</span>
                <span>Datum: _________</span>
            </div>
        </div>
    `;

    let studentSheetHTML = `
        ${worksheetHeader}
        ${wordListHeader}
        <div class="space-y-6">
    `;

    const renderExerciseBlock = (title, exercises, startIndex) => {
        let blockHTML = `<div class="space-y-4"><h3 class="font-bold text-blue-600 border-b border-blue-100 pb-1 mb-4 text-xl">${title}</h3>`;
        blockHTML += '<div class="grid grid-cols-1 gap-4">';

        exercises.forEach((item, index) => {
            const itemNumber = startIndex + index + 1;
            const opdrachtTekst = item.opdracht;

            blockHTML += `
                <div class="p-3 border border-slate-200 rounded-lg flex items-start gap-4 relative">
                    <span class="font-semibold text-slate-500 mt-1">${itemNumber}.</span>
                    <div class="flex-grow">
                        <div class="flex justify-between items-start gap-2">
                            <p class="text-base flex-grow pr-4">${opdrachtTekst}</p>
                            <span class="flex-shrink-0 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full mt-1">${categoriesMap[item.categorie] || ''}</span>
                        </div>
                        <div class="mt-2 h-8 border-b-2 border-slate-300"></div>
                    </div>
                </div>
            `;
        });

        blockHTML += `</div></div>`;
        return blockHTML;
    };

    studentSheetHTML += renderExerciseBlock('Vul het juiste woord in', worksheetData.oefeningen.invulzinnen, 0);
    studentSheetHTML += renderExerciseBlock('Kies de juiste spelling', worksheetData.oefeningen.kies_juiste_spelling, 5);
    studentSheetHTML += renderExerciseBlock('Pas de spellingregel toe', worksheetData.oefeningen.regelvragen, 10);

    studentSheetHTML += `</div>`; // Sluit space-y-6

    // Verhaal-container (nu BINNEN student-sheet)
    studentSheetHTML += `<div id="story-container" class="prose max-w-none mt-12"></div>`;


    const allExercises = [
        ...worksheetData.oefeningen.invulzinnen,
        ...worksheetData.oefeningen.kies_juiste_spelling,
        ...worksheetData.oefeningen.regelvragen
    ];

    const answerSheetHTML = `
        <h2 class="text-2xl font-bold mb-1 text-slate-800">Antwoordenblad Groep ${groupDisplay}</h2>
        <p class="text-sm text-slate-500 mb-6">Categorieën: ${selectedCatIds.map(id => `${id}: ${categoriesMap[id]}`).join(', ')}</p>
        <table class="w-full">
            <thead><tr class="border-b"><th class="text-left py-2">Nr.</th><th class="text-left py-2">Woord</th><th class="text-left py-2">Categorie</th><th class="text-left py-2">Opdracht</th></tr></thead>
            <tbody>
                ${allExercises.map((item, index) => `
                    <tr class="border-b border-slate-200">
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
            
            <!-- Tab Knoppen -->
            <div class="no-print mb-6 flex border-b border-slate-200">
                <button id="student-tab-btn" onclick="switchTab('student')" class="py-3 px-6 font-semibold text-white bg-blue-600 rounded-t-lg" style="background-color: #2073af;">
                    Werkblad
                </button>
                <button id="answer-tab-btn" onclick="switchTab('answer')" class="py-3 px-6 font-semibold text-green-600 rounded-t-lg" style="color: #a8c641;">
                    Antwoordenblad
                </button>
            </div>

            <!-- Tab Inhoud: Werkblad -->
            <div id="student-panel">
                <div class="no-print mb-6 flex justify-end items-center gap-4">
                    <button id="generate-story-btn" onclick="generateStory()" class="font-semibold py-2 px-6 rounded-full transition-transform transform hover:scale-105 text-white" style="background-color: #f19127;">
                        ✨ Maak een Verhaal
                    </button>
                    <button onclick="printStudentWorksheet()" class="font-semibold py-2 px-6 rounded-full transition-transform transform hover:scale-105 text-white" style="background-color: #2073af;">
                        <i class="fas fa-print mr-2"></i> Print / Opslaan (PDF)
                    </button>
                </div>
                <div id="student-sheet" class="prose max-w-none">${studentSheetHTML}</div>
            </div>

            <!-- Tab Inhoud: Antwoordenblad (standaard verborgen) -->
            <div id="answer-panel" style="display: none;">
                <div class="no-print mb-6 flex justify-end items-center gap-4">
                     <button onclick="printAnswerSheet()" class="font-semibold py-2 px-6 rounded-full transition-transform transform hover:scale-105 text-white" style="background-color: #a8c641;">
                        <i class="fas fa-print mr-2"></i> Print / Opslaan (PDF)
                    </button>
                </div>
                <div id="answer-sheet" class="prose max-w-none page-break mt-12">${answerSheetHTML}</div>
            </div>

        </div>
    `;
    
    // Zorg dat de standaard tab geselecteerd is (nodig bij opnieuw renderen)
    switchTab('student');
};

