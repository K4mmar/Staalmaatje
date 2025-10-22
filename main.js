// ===================================================================================
// MAIN.JS - De 'motor' van de applicatie
// Dit bestand bevat de interactieve logica, AI-communicatie en event listeners.
// ===================================================================================

let currentWorksheetData = {};
let currentGroup = null;

// Kleurenpalet
const COLORS = {
    blue: '#2073af',
    orange: '#f19127',
    green: '#a8c641',
    slate: '#64748b' // (een grijstint voor tekst)
};

document.addEventListener('DOMContentLoaded', () => {
    // Stijlen voor printen toevoegen (compacter)
    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            @page { size: A4 portrait; margin: 1cm; } /* Kleinere marges */
            #student-sheet, #answer-sheet { display: none; }
            body.print-student-sheet #student-sheet { display: block; }
            body.print-answer-sheet #answer-sheet { display: block; }
            .no-print { display: none !important; }
            .printable-area { box-shadow: none !important; border: none !important; }
            
            /* Compactere opmaak */
            #student-sheet h2, #answer-sheet h2 { font-size: 14pt; margin-bottom: 0.5rem; }
            #student-sheet h3 { font-size: 11pt; margin-bottom: 0.3rem; }
            #student-sheet .text-base { font-size: 9pt; } /* Lettertype opdrachten kleiner */
            #student-sheet .p-3 { padding: 0.4rem !important; }
            #student-sheet .space-y-6 { gap: 1rem; } /* Kleinere ruimte tussen blokken */
            #student-sheet .mb-8 { margin-bottom: 1rem !important; }
            #student-sheet .text-sm { font-size: 9pt; }
        }
    `;
    document.head.appendChild(style);

    // --- DOM-elementen ophalen ---
    const groupButtonsContainer = document.getElementById('group-buttons');
    const categorySelection = document.getElementById('category-selection');
    const categoryList = document.getElementById('category-list');
    const generateBtnContainer = document.getElementById('generate-button-container');
    const generateBtn = document.getElementById('generate-btn');
    const historyListContainer = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // --- Tab-navigatie (Nieuw / Opgeslagen) ---
    const newTab = document.getElementById('new-worksheet-tab');
    const historyTab = document.getElementById('history-tab');
    const newPanel = document.getElementById('new-worksheet-panel');
    const historyPanel = document.getElementById('history-panel');

    newTab.addEventListener('click', (e) => {
        e.preventDefault();
        newTab.classList.add('border-blue-600', 'text-blue-600');
        newTab.classList.remove('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'hover:border-slate-300');
        newTab.style.color = COLORS.blue;
        newTab.style.borderColor = COLORS.blue;
        
        historyTab.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'hover:border-slate-300');
        historyTab.classList.remove('border-blue-600', 'text-blue-600');
        historyTab.style.color = '';
        historyTab.style.borderColor = 'transparent';

        newPanel.classList.remove('hidden');
        historyPanel.classList.add('hidden');
    });

    historyTab.addEventListener('click', (e) => {
        e.preventDefault();
        historyTab.classList.add('border-blue-600', 'text-blue-600');
        historyTab.classList.remove('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'hover:border-slate-300');
        historyTab.style.color = COLORS.blue;
        historyTab.style.borderColor = COLORS.blue;

        newTab.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'hover:border-slate-300');
        newTab.classList.remove('border-blue-600', 'text-blue-600');
        newTab.style.color = '';
        newTab.style.borderColor = 'transparent';
        
        newPanel.classList.add('hidden');
        historyPanel.classList.remove('hidden');
        
        renderHistoryList(); // Laad de lijst als je op de tab klikt
    });

    // Functie voor notificaties
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50 ${isError ? 'bg-red-500' : 'bg-blue-500'}`;
        notification.style.backgroundColor = isError ? '#E53E3E' : COLORS.blue;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Groep-knoppen genereren
    ['4', '5', '6', '7/8'].forEach(group => {
        const btn = document.createElement('button');
        btn.textContent = `Groep ${group}`;
        btn.className = 'group-btn font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 bg-slate-100 text-slate-700 hover:bg-slate-200';
        btn.dataset.group = group === '7/8' ? '7' : group;
        groupButtonsContainer.appendChild(btn);
    });

    // Event listener voor groep-knoppen
    groupButtonsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('group-btn')) {
            currentGroup = e.target.dataset.group;

            document.querySelectorAll('.group-btn').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-slate-100', 'text-slate-700');
                btn.style.backgroundColor = '';
                btn.style.color = '';
            });
            e.target.style.backgroundColor = COLORS.blue;
            e.target.style.color = 'white';
            e.target.classList.remove('bg-slate-100', 'text-slate-700');

            displayCategories(currentGroup);
            // categorySelection.classList.remove('hidden'); // VERWIJDERD
            // generateBtnContainer.classList.remove('hidden'); // VERWIJDERD
            document.getElementById('worksheet-output').innerHTML = ''; // Maak vorig werkblad leeg
        }
    });

    // Categorieën weergeven op basis van groep
    function displayCategories(group) {
        categoryList.innerHTML = '';
        const cats = typeof groupCategories !== 'undefined' ? groupCategories[group] : [];
        if (!cats) return;
        cats.forEach(catId => {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            div.innerHTML = `
                <input id="cat-${catId}" type="checkbox" data-cat-id="${catId}" class="h-4 w-4 rounded border-slate-300 focus:ring-blue-500" style="color: ${COLORS.blue};">
                <label for="cat-${catId}" class="ml-3 block text-sm text-slate-700">${catId}. ${categories[catId] || 'Onbekend'}</label>
            `;
            categoryList.appendChild(div);
        });
    }

    // Maximaal 3 categorieën selecteren
    categoryList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const checkedCheckboxes = categoryList.querySelectorAll('input[type="checkbox"]:checked');
            if (checkedCheckboxes.length > 3) {
                showNotification('Je kunt maximaal 3 categorieën selecteren.', true);
                e.target.checked = false;
            }
        }
    });

    // Event listener voor 'Maak Werkblad' knop
    generateBtn.addEventListener('click', async () => {
        const selectedCatIds = Array.from(categoryList.querySelectorAll('input:checked')).map(cb => parseInt(cb.dataset.catId));

        if (selectedCatIds.length === 0) {
            showNotification('Kies alsjeblieft minstens één categorie.', true);
            return;
        }
        await generateWorksheetWithAI(selectedCatIds);
    });

    // Valideer woorden met de dictionary API
    async function validateWords(wordList) {
        const validationPromises = wordList.map(async (item) => {
            const word = item.woord;
            try {
                const response = await fetch(`https://nl.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
                if (!response.ok && response.status === 404) {
                    return { ...item, isValid: false };
                }
                const data = await response.json();
                if (!data.nl || data.nl.length === 0) {
                   console.warn(`Wiktionary gaf geen definitie voor "${word}", fallback naar DictionaryAPI.`);
                   const fallbackResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/nl/${encodeURIComponent(word)}`);
                   if (!fallbackResponse.ok && fallbackResponse.status === 404) {
                       return { ...item, isValid: false };
                   }
                }
                return { ...item, isValid: true };
            } catch (error) {
                console.warn(`Kon woord "${word}" niet valideren, we gaan uit van het goede.`, error);
                return { ...item, isValid: true };
            }
        });

        const results = await Promise.all(validationPromises);
        return results.filter(r => !r.isValid);
    }

    // Hoofdfunctie voor het genereren van het werkblad met AI
    async function generateWorksheetWithAI(selectedCatIds) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Woorden worden bedacht...`;

        try {
            const geselecteerdeRegels = typeof spellingRegels !== 'undefined'
                ? spellingRegels.filter(regel => selectedCatIds.includes(regel.id))
                : [];
            const groupDisplay = currentGroup === '7' ? '7 of 8' : currentGroup;

            const userQuery = `Genereer een spellingwerkblad voor groep ${groupDisplay} op basis van deze regels: ${JSON.stringify(geselecteerdeRegels, null, 2)}`;
            
            // Systeemprompt met niveau-specifieke zinnen
            const systemPrompt = `Je bent een ervaren en creatieve leerkracht voor het basisonderwijs in Nederland, expert in de 'Staal' spellingmethode. Je taak is het genereren van een compleet, printklaar en didactisch verantwoord spellingwerkblad.

    **ALLERBELANGRIJKSTE REGEL:** Pas de complexiteit van de zinnen AAN OP DE GROEP:
    - **Groep 4:** Zeer korte, simpele zinnen (max. 8-10 woorden). Gebruik alleen basiswoordenschat.
    - **Groep 5/6:** Korte zinnen (max. 12 woorden). Eenvoudige zinsbouw.
    - **Groep 7/8:** Zinnen mogen iets langer, maar de focus moet 100% op de spelling blijven, niet op begrijpend lezen.

    Je volgt deze stappen:
    1.  **Genereer 15 Woorden:** Maak eerst een lijst van 15 unieke, voor de groep geschikte woorden die passen bij de opgegeven spellingcategorieën. **BELANGRIJK: Alle gegenereerde woorden moeten 100% correct gespeld zijn en voorkomen in het Nederlandse woordenboek.**
    2.  **Maak 3 Soorten Oefeningen:** Gebruik deze 15 woorden om 3 verschillende soorten oefeningen te maken. Elke oefeningsoort gebruikt 5 unieke woorden uit de lijst. Zorg dat elk woord precies één keer wordt gebruikt.

        - **Vorm 1: 'invulzinnen' (5 woorden):** Maak een **interessante, contextrijke zin** die past bij het leesniveau (zie hoofdregel) en vervang het doelwoord door '...'.
          **REGELS VOOR INVULZINNEN:**
          1.  **NIVEAU:** Volg de 'ALLERBELANGRIJKSTE REGEL' over zinscomplexiteit.
          2.  **Plaatsing Placeholder:** De '...' hoeft NIET aan het einde te staan.
          3.  **Engagement:** Maak de zinnen leuk (dieren, avontuur, school, spelletjes).
          4.  **Geen Vage Zinnen:** VERBIED zinnen als 'Ik heb een ...', 'Het ... is mooi.', 'Ik zie een ...'.

        - **Vorm 2: 'kies_juiste_spelling' (5 woorden):** Maak een opdracht waarbij de leerling moet kiezen tussen het correct gespelde woord en een veelvoorkomende, fonetische fout (bv. 'hond / hont', 'pauw / pau'). Gebruik een ' / ' als scheidingsteken.

        - **Vorm 3: 'regelvragen' (5 woorden):** Maak een concrete vraag die de **specifieke spellingstrategie** van de categorie test.
          **REGELS VOOR REGELVRAGEN:**
          1.  **DIDACTISCH:** De vraag moet de leerling dwingen de regel toe te passen.
          2.  **VOORBEELDEN:** Als de categorie 'Langermaakwoord' is, MOET de vraag zijn "Maak het langer: [woord] ⟶". Als het 'Verkleinwoord' is, "Maak het verkleinwoord: [woord] ⟶". Als het 'Klankgroepenwoord' is, is 'Maak het meervoud' een goede vraag.
          3.  **DOEL:** De vraag leidt de leerling naar het invullen van het doelwoord.

    3.  **Lever het resultaat** als een perfect gestructureerd JSON-object. Gebruik exact dit formaat:
        \`{ "woordenlijst": [ { "woord": "voorbeeld", "categorie": 10 }, ... ], "oefeningen": { "invulzinnen": [ { "opdracht": "...", "woord": "...", "categorie": ... } ], "kies_juiste_spelling": [ { "opdracht": "Kies: ... / ...", "woord": "...", "categorie": ... } ], "regelvragen": [ { "opdracht": "...", "woord": "...", "categorie": ... } ] } }\``;

            let jsonResponseString = await callGeminiAPI(userQuery, systemPrompt);
            let worksheetData = JSON.parse(jsonResponseString);

            if (!worksheetData || !worksheetData.woordenlijst || !worksheetData.oefeningen || !worksheetData.oefeningen.invulzinnen || !worksheetData.oefeningen.kies_juiste_spelling || !worksheetData.oefeningen.regelvragen) {
                throw new Error("De AI gaf een onvolledig of incorrect geformatteerd antwoord.");
            }

            generateBtn.innerHTML = `<i class="fas fa-spell-check mr-2"></i> Woorden worden gecontroleerd...`;
            let invalidWords = await validateWords(worksheetData.woordenlijst);

            if (invalidWords.length > 0) {
                generateBtn.innerHTML = `<i class="fas fa-wand-magic-sparkles mr-2"></i> Magie wordt toegevoegd...`;

                const invalidWordsInfo = invalidWords.map(item => ({ original: item.woord, categorie: categories[item.categorie] }));
                const correctionQuery = `Je hebt eerder de volgende woorden gegenereerd die spelfouten bevatten: ${JSON.stringify(invalidWordsInfo)}. Geef de correcte spelling voor elk van deze woorden.`;
                const correctionSystemPrompt = `Je bent een spellingcorrector. Je krijgt een lijst met foute woorden en hun context (categorie). Geef een JSON-object terug dat de originele foute woorden koppelt aan hun correcte spelling. Gebruik dit formaat: \`{ "correcties": [ { "origineel": "foutwoord1", "correct": "goedwoord1" }, { "origineel": "foutwoord2", "correct": "goedwoord2" } ] }\``;

                const correctionResponseString = await callGeminiAPI(correctionQuery, correctionSystemPrompt);
                const correctionData = JSON.parse(correctionResponseString);
                const corrections = correctionData.correcties;

                if (!corrections) {
                    throw new Error("Kon de spelfouten niet automatisch corrigeren.");
                }

                const correctionMap = new Map(corrections.map(c => [c.origineel, c.correct]));

                worksheetData.woordenlijst.forEach(item => {
                    if (correctionMap.has(item.woord)) {
                        item.woord = correctionMap.get(item.woord);
                    }
                });

                Object.values(worksheetData.oefeningen).flat().forEach(ex => {
                    const originalWord = ex.woord;
                    if (correctionMap.has(originalWord)) {
                        const correctedWord = correctionMap.get(originalWord);
                        ex.woord = correctedWord;
                        try {
                           const escapedOriginalWord = originalWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                           const regex = new RegExp(escapedOriginalWord.replace(/\.\.\./g, '\\.\\.\\.'), 'g');
                           ex.opdracht = ex.opdracht.replace(regex, correctedWord);
                        } catch (e) {
                            console.warn("Kon woord niet vervangen in opdracht:", originalWord, correctedWord, e);
                            ex.opdracht = ex.opdracht.replace(originalWord, correctedWord); // Fallback
                        }
                         ex.opdracht = ex.opdracht.replace('...........', '...');
                         ex.opdracht = ex.opdracht.replace('...', '...'); 
                    }
                     ex.opdracht = ex.opdracht.replace('...........', '...');
                });
                Object.values(worksheetData.oefeningen).flat().forEach(ex => {
                   ex.opdracht = ex.opdracht.replace('...........', '...');
                });
            }


            currentWorksheetData = worksheetData;
            // Sla op in geschiedenis
            saveWorksheetToHistory(worksheetData, selectedCatIds, currentGroup);

            if (typeof renderWorksheet === 'function') {
                renderWorksheet(worksheetData, selectedCatIds, currentGroup);
            } else {
                console.error("renderWorksheet functie niet gevonden. Is ui-worksheet.js correct geladen?");
                 showNotification("Fout bij het weergeven van het werkblad.", true);
            }

        } catch (error) {
            console.error("Fout bij genereren van AI werkblad:", error);
            let userMessage = `Oeps, er ging iets mis: ${error.message}`;
             if (error.message.includes("429") || error.message.includes("quota")) {
                userMessage = "De AI-limiet voor de gratis versie is bereikt. Probeer het over een minuutje opnieuw.";
            } else if (error.message.includes("503")) {
                userMessage = "De AI-service is momenteel overbelast. Probeer het later opnieuw.";
            } else if (error.message.includes("onvolledig") || error.message.includes("incorrect geformatteerd") || error.message.includes("niet-JSON")) {
                 userMessage = "De AI gaf een onverwacht antwoord. Proeer het nog eens.";
            } else if (error.message.includes("veiligheidsfilter")) {
                userMessage = error.message;
            }
            showNotification(userMessage, true);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic mr-2"></i> Maak Werkblad`;
        }
    }

    // Functie voor API-aanroep
    async function callGeminiAPI(userQuery, systemPrompt) {
        const functionUrl = '/.netlify/functions/generate-words';
        let responseText = '';
        try {
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userQuery, prompt: systemPrompt }),
            });

            responseText = await response.text();

            if (!response.ok) {
                let errorMsg = `Serverfout (status ${response.status})`;
                try {
                    const errorJson = JSON.parse(responseText);
                    if (errorJson.error && errorJson.error.message.toLowerCase().includes('quota')) {
                       throw new Error("429: Quota Exceeded");
                    }
                    if (errorJson.promptFeedback && errorJson.promptFeedback.blockReason) {
                        console.error("AI verzoek geblokkeerd door safety filter:", errorJson.promptFeedback);
                        throw new Error(`Het verzoek is geblokkeerd door het veiligheidsfilter (${errorJson.promptFeedback.blockReason}). Probeer andere categorieën.`);
                    }
                    errorMsg = errorJson.error ? errorJson.error.message : responseText;
                } catch (e) {
                     if (!(e instanceof Error && (e.message.startsWith("429") || e.message.includes("veiligheidsfilter")))) {
                         errorMsg = responseText || errorMsg;
                     } else {
                         throw e;
                     }
                }
                throw new Error(errorMsg);
            }

             try {
                JSON.parse(responseText);
             } catch(e) {
                console.error("AI gaf geen geldige JSON terug:", responseText);
                throw new Error("De AI gaf een onverwacht (niet-JSON) antwoord.");
             }

            return responseText;

        } catch (error) {
            console.error("Fout bij het aanroepen van de Netlify Function:", error);
            throw error;
        }
    }


    // --- Geschiedenis Functies ---

    function getHistory() {
        return JSON.parse(localStorage.getItem('staalmaatjeHistory') || '[]');
    }

    function saveHistory(history) {
        localStorage.setItem('staalmaatjeHistory', JSON.stringify(history));
    }

    function saveWorksheetToHistory(worksheetData, selectedCatIds, group) {
        let history = getHistory();
        const groupDisplay = group === '7' ? '7/8' : group;
        const catNames = selectedCatIds.map(id => categories[id] || 'Onbekend').join(', ');
        
        const newEntry = {
            id: new Date().toISOString(),
            timestamp: new Date().toLocaleString('nl-NL'),
            title: `Groep ${groupDisplay} - ${catNames}`,
            data: worksheetData,
            selectedCatIds: selectedCatIds,
            group: group
        };

        // Voeg vooraan toe
        history.unshift(newEntry);
        
        // Beperk tot 10 items
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        saveHistory(history);
    }

    function loadWorksheetFromHistory(id) {
        const history = getHistory();
        const entry = history.find(item => item.id === id);
        if (entry) {
            currentWorksheetData = entry.data;
            currentGroup = entry.group;
            if (typeof renderWorksheet === 'function') {
                renderWorksheet(entry.data, entry.selectedCatIds, entry.group);
                // Spring terug naar de 'Nieuw Werkblad' tab om het resultaat te tonen
                // newTab.click(); // <-- DEZE REGEL IS VERWIJDERD
            } else {
                showNotification("Fout bij het laden van het werkblad.", true);
            }
        }
    }

    function deleteWorksheetFromHistory(id) {
        let history = getHistory();
        history = history.filter(item => item.id !== id);
        saveHistory(history);
        renderHistoryList(); // Ververs de lijst
    }

    function renderHistoryList() {
        const history = getHistory();
        historyListContainer.innerHTML = ''; // Maak leeg

        if (history.length === 0) {
            historyListContainer.innerHTML = `<p class="text-slate-500">Je hebt nog geen werkbladen opgeslagen.</p>`;
            clearHistoryBtn.classList.add('hidden');
            return;
        }

        clearHistoryBtn.classList.remove('hidden');

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm';
            div.innerHTML = `
                <div class="flex-grow cursor-pointer worksheet-loader" data-id="${item.id}">
                    <strong class="text-blue-600" style="color: ${COLORS.blue};">${item.title}</strong>
                    <p class="text-sm text-slate-500">${item.timestamp}</p>
                </div>
                <button class="delete-item p-2 text-slate-400 hover:text-red-500" data-id="${item.id}" title="Verwijder dit werkblad">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            historyListContainer.appendChild(div);
        });
    }

    // Event listener voor de geschiedenislijst (voor laden en verwijderen)
    historyListContainer.addEventListener('click', (e) => {
        const loader = e.target.closest('.worksheet-loader');
        const deleter = e.target.closest('.delete-item');

        if (loader) {
            loadWorksheetFromHistory(loader.dataset.id);
        } else if (deleter) {
            deleteWorksheetFromHistory(deleter.dataset.id);
        }
    });

    // Knop om hele geschiedenis te wissen
    clearHistoryBtn.addEventListener('click', () => {
        saveHistory([]);
        renderHistoryList();
    });

    // --- Einde Geschiedenis Functies ---


    // Functies die globaal beschikbaar moeten zijn (voor knoppen in de HTML)
    window.generateStory = async function() {
        const storyBtn = document.getElementById('generate-story-btn');
        const storyContainer = document.getElementById('story-container');
        if (!storyBtn || !storyContainer || !currentWorksheetData.woordenlijst) return;

        storyBtn.disabled = true;
        storyBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Verhaal wordt gemaakt...`;
        storyContainer.innerHTML = `<h3 class="text-2xl font-bold mb-4" style="color: ${COLORS.orange};">✨ Jouw unieke verhaal!</h3><div id="story-output" class="p-4 bg-orange-50 rounded-lg border border-orange-200 min-h-[100px]"><p>Een momentje, de woorden-elfjes zijn druk aan het schrijven...</p></div>`;

        try {
            const wordList = currentWorksheetData.woordenlijst.map(item => item.woord);
            if (wordList.length === 0) throw new Error("Geen woorden om een verhaal te maken.");

            const groupDisplay = currentGroup === '7' ? '7 of 8' : currentGroup;
            const userPrompt = `Schrijf een heel kort, grappig en eenvoudig verhaaltje in het Nederlands voor een kind in groep ${groupDisplay}. Het verhaal moet de volgende woorden bevatten: ${wordList.join(', ')}. Maak de woorden uit de lijst dikgedrukt in de tekst door ze te omringen met **. Zorg ervoor dat het verhaal logisch en makkelijk te lezen is.`;
            const systemPrompt = `Je bent een creatieve kinderboekenschrijver. Schrijf een kort, positief en grappig verhaal. Geef je antwoord als JSON object met een "story" key.`;

            const jsonResponseString = await callGeminiAPI(userPrompt, systemPrompt);
            const storyText = JSON.parse(jsonResponseString).story || jsonResponseString;

            if (!storyText) throw new Error("Kon geen verhaal genereren.");

            const formattedStory = storyText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            const storyOutput = document.getElementById('story-output');
            storyOutput.innerHTML = `<p>${formattedStory}</p>`;
        } catch (error) {
            console.error('Error generating story:', error);
            const storyOutput = document.getElementById('story-output');
            if (storyOutput) {
                storyOutput.innerHTML = `<p class="text-red-600">Oeps, er ging iets mis bij het maken van het verhaal: ${error.message}</p>`;
            }
        } finally {
            storyBtn.disabled = false;
            storyBtn.innerHTML = `✨ Maak een Verhaal`;
        }
    }

    window.printStudentWorksheet = function() {
        document.body.classList.remove('print-answer-sheet');
        document.body.classList.add('print-student-sheet');
        window.print();
    }

    window.printAnswerSheet = function() {
        document.body.classList.remove('print-student-sheet');
        document.body.classList.add('print-answer-sheet');
        window.print();
    }

    // Init
    // Stel de standaardkleuren in voor knoppen die niet door JS worden gegenereerd
    document.getElementById('generate-btn').style.backgroundColor = COLORS.orange;
    document.getElementById('clear-history-btn').style.backgroundColor = COLORS.slate;
    document.querySelector('.text-blue-600').style.color = COLORS.blue;
    document.querySelector('.border-blue-600').style.borderColor = COLORS.blue;
    
    // Simuleer een klik op de eerste groepknop (Groep 4) om de categorieën te laden
    if (document.querySelector('.group-btn')) {
        document.querySelector('.group-btn').click();
    }
    
});


