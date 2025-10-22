// ===================================================================================
// UI-WORKSHEET.JS - De 'vormgever' van het werkblad
// Deze functie is verantwoordelijk voor het omzetten van de data naar HTML.
// ===================================================================================

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
        <div class="mb-8 p-4 border rounded-lg bg-slate-50 border-slate-200">
            <h3 class="font-semibold text-lg mb-2 text-slate-700">Dit zijn je 15 oefenwoorden:</h3>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-6 gap-y-1 text-slate-700">
                ${worksheetData.woordenlijst.map(item => `<span>${item.woord}</span>`).join('')}
            </div>
        </div>
    `;

    const worksheetHeader = `
        <div class="flex justify-between items-center border-b-2 border-slate-200 pb-2 mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Spellingwerkblad Groep ${groupDisplay}</h2>
            <div class="flex gap-4 text-sm text-slate-600">
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
        let blockHTML = `<div class="space-y-4"><h3 class="font-bold border-b border-slate-200 pb-1 mb-4 text-xl" style="color: ${COLORS.blue};">${title}</h3>`;

        blockHTML += '<div class="grid grid-cols-1 gap-4">';

        exercises.forEach((item, index) => {
            const itemNumber = startIndex + index + 1;
            const opdrachtTekst = item.opdracht;

            blockHTML += `
                <div class="p-3 border border-slate-200 rounded-lg flex items-start gap-4">
                    <span class="font-semibold text-slate-500 mt-1">${itemNumber}.</span>
                    <div class="flex-grow">
                        <p class="text-base text-slate-800">${opdrachtTekst}</p>
                        <div class="mt-2 h-8 border-b-2 border-slate-300"></div>
                    </div>
                    <span class="flex-shrink-0 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full mt-1">${categoriesMap[item.categorie] || ''}</span>
                </div>
            `;
        });

        blockHTML += `</div></div>`;
        return blockHTML;
    };

    studentSheetHTML += renderExerciseBlock('Vul het juiste woord in', worksheetData.oFefeningen.invulzinnen, 0);
    studentSheetHTML += renderExerciseBlock('Kies de juiste spelling', worksheetData.oefeningen.kies_juiste_spelling, 5);
    studentSheetHTML += renderExerciseBlock('Pas de spellingregel toe', worksheetData.oefeningen.regelvragen, 10);

    // Plaats de verhaal-container binnen het student-sheet zodat het meeprint
    studentSheetHTML += `<div id="story-container" class="prose max-w-none mt-12"></div>`;
    studentSheetHTML += `</div>`; // Einde space-y-6

    const allExercises = [
        ...worksheetData.oefeningen.invulzinnen,
        ...worksheetData.oefeningen.kies_juiste_spelling,
        ...worksheetData.oefeningen.regelvragen
    ];

    const answerSheetHTML = `
        <h2 class="text-2xl font-bold mb-1 text-slate-800">Antwoordenblad Groep ${groupDisplay}</h2>
        <p class="text-sm text-slate-500 mb-6">Categorieën: ${selectedCatIds.map(id => `${id}: ${categoriesMap[id]}`).join(', ')}</p>
        <table class="w-full">
            <thead><tr class="border-b border-slate-200"><th class="text-left py-2 text-slate-600">Nr.</th><th class="text-left py-2 text-slate-600">Woord</th><th class="text-left py-2 text-slate-600">Categorie</th><th class="text-left py-2 text-slate-600">Opdracht</th></tr></thead>
            <tbody>
                ${allExercises.map((item, index) => `
                    <tr class="border-b border-slate-200">
                        <td class="py-2 align-top text-slate-600">${index + 1}.</td>
                        <td class="py-2 align-top font-semibold" style="color: ${COLORS.green};">${item.woord}</td>
                        <td class="py-2 align-top text-slate-600">${item.categorie}. ${categoriesMap[item.categorie] || ''}</td>
                        <td class="py-2 align-top text-sm text-slate-600">${item.opdracht}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    worksheetOutput.innerHTML = `
        <div class="printable-area bg-white p-6 md:p-10 rounded-2xl shadow-lg max-w-4xl mx-auto no-print">
            
            <!-- Tab Knoppen -->
            <div class="sm:flex sm:justify-between items-center border-b border-slate-200 mb-6">
                <div class="flex space-x-6">
                    <a href="#" id="tab-worksheet" onclick="switchTab('worksheet'); return false;" class="inline-flex items-center px-1 pt-1 border-b-2 font-semibold" style="border-color: ${COLORS.blue}; color: ${COLORS.blue};">
                        Werkblad
                    </a>
                    <a href="#" id="tab-answer" onclick="switchTab('answer'); return false;" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300">
                        Antwoordenblad
                    </a>
                </div>
                
                <!-- Knoppen binnen de tabs (worden getoond/verborgen) -->
                <div id="worksheet-buttons" class="flex gap-4 mt-4 sm:mt-0">
                    <button onclick="printStudentWorksheet()" class="text-white font-semibold py-2 px-6 rounded-full transition-transform transform hover:scale-105" style="background-color: ${COLORS.blue};">
                        <i class="fas fa-print mr-2"></i> Print / Opslaan (PDF)
                    </button>
                    <button id="generate-story-btn" onclick="generateStory()" class="text-white font-semibold py-2 px-6 rounded-full transition-transform transform hover:scale-105" style="background-color: ${COLORS.orange};">
                        ✨ Maak een Verhaal
                    </button>
                </div>

                <div id="answer-buttons" class="hidden gap-4 mt-4 sm:mt-0">
                    <button onclick="printAnswerSheet()" class="text-white font-semibold py-2 px-6 rounded-full transition-transform transform hover:scale-105" style="background-color: ${COLORS.green};">
                        <i class="fas fa-print mr-2"></i> Print / Opslaan (PDF)
                    </button>
                </div>
            </div>

            <!-- Inhoud -->
            <div id="student-sheet" class="prose max-w-none">${studentSheetHTML}</div>
            <div id="answer-sheet" class="prose max-w-none hidden">${answerSheetHTML}</div>

        </div>
    `;
}; // Einde van renderWorksheet functie


// Functie om tussen werkblad en antwoorden te wisselen
window.switchTab = function(tabName) {
    const worksheetTab = document.getElementById('tab-worksheet');
    const answerTab = document.getElementById('tab-answer');
    const worksheetContent = document.getElementById('student-sheet');
    const answerContent = document.getElementById('answer-sheet');
    const worksheetButtons = document.getElementById('worksheet-buttons');
    const answerButtons = document.getElementById('answer-buttons');

    // Stijlen voor de ACTIEVE tab (alleen rand en tekst)
    const activeClasses = ['border-b-2', 'font-semibold'];
    
    // Stijlen voor de INACTIEVE tab
    const inactiveClasses = ['border-b-2', 'border-transparent', 'text-slate-500', 'hover:text-slate-700', 'hover:border-slate-300'];
    
    // Reset beide tabs
    worksheetTab.classList.remove(...activeClasses, 'border-blue-600', 'text-blue-600', 'border-green-600', 'text-green-600');
    worksheetTab.classList.add(...inactiveClasses);
    worksheetTab.style.color = '';
    worksheetTab.style.borderColor = '';
    
    answerTab.classList.remove(...activeClasses, 'border-blue-600', 'text-blue-600', 'border-green-600', 'text-green-600');
    answerTab.classList.add(...inactiveClasses);
    answerTab.style.color = '';
    answerTab.style.borderColor = '';

    if (tabName === 'worksheet') {
        // Maak Werkblad Actief (Blauw)
        worksheetTab.classList.add(...activeClasses);
        worksheetTab.classList.remove(...inactiveClasses);
        worksheetTab.style.borderColor = COLORS.blue;
        worksheetTab.style.color = COLORS.blue;
        
        // Toon/verberg content en knoppen
        worksheetContent.classList.remove('hidden');
        answerContent.classList.add('hidden');
        worksheetButtons.classList.remove('hidden');
        worksheetButtons.classList.add('flex');
        answerButtons.classList.add('hidden');
        answerButtons.classList.remove('flex');
    } else { // 'answer'
        // Maak Antwoorden Actief (Groen)
        answerTab.classList.add(...activeClasses);
        answerTab.classList.remove(...inactiveClasses);
        answerTab.style.borderColor = COLORS.green;
        answerTab.style.color = COLORS.green;

        // Toon/verberg content en knoppen
        worksheetContent.classList.add('hidden');
        answerContent.classList.remove('hidden');
        worksheetButtons.classList.add('hidden');
        worksheetButtons.classList.remove('flex');
        answerButtons.classList.remove('hidden');
        answerButtons.classList.add('flex');
    }
}

