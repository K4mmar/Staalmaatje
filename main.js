// ===================================================================================
// MAIN.JS - De 'motor' van de applicatie
// Dit bestand bevat de interactieve logica, AI-communicatie en event listeners.
// ===================================================================================

let currentWorksheetData = {};
let currentGroup = null;
let worksheetHistory = []; // Voor de geschiedenis

document.addEventListener('DOMContentLoaded', () => {
    // Stijlen voor printen toevoegen
    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            @page { size: A4 portrait; margin: 1cm; }
            body.print-student-sheet #student-sheet { display: block; }
            body.print-answer-sheet #answer-sheet { display: block; }
            .no-print { display: none !important; }
            
            /* Compactere printstijlen */
            body.print-student-sheet #student-sheet,
            body.print-answer-sheet #answer-sheet {
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
            }
            .printable-area {
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
            }
            #student-sheet .text-2xl, #answer-sheet .text-2xl { font-size: 14pt; }
            #student-sheet .text-xl, #answer-sheet .text-xl { font-size: 12pt; }
            #student-sheet .text-base, #answer-sheet .text-base { font-size: 9pt; }
            #student-sheet .mb-8, #answer-sheet .mb-8 { margin-bottom: 1rem; }
            #student-sheet .mb-6, #answer-sheet .mb-6 { margin-bottom: 0.75rem; }
            #student-sheet .mb-4, #answer-sheet .mb-4 { margin-bottom: 0.5rem; }
            #student-sheet .p-4, #answer-sheet .p-4 { padding: 0.5rem; }
            #student-sheet .p-3, #answer-sheet .p-3 { padding: 0.4rem; }
            #student-sheet .gap-4, #answer-sheet .gap-4 { gap: 0.5rem; }
            #student-sheet .space-y-6, #answer-sheet .space-y-6 { gap: 0.75rem; }
            #student-sheet .mt-12, #answer-sheet .mt-12 { margin-top: 1rem; }
        }
    `;
    document.head.appendChild(style);

    // DOM-elementen ophalen
    const groupButtonsContainer = document.getElementById('group-buttons');
    const categorySelection = document.getElementById('category-selection');
    const categoryList = document.getElementById('category-list');
    const generateBtnContainer = document.getElementById('generate-button-container');
    const generateBtn = document.getElementById('generate-btn');
    const worksheetOutput = document.getElementById('worksheet-output');
    
    // Tab-elementen
    const tabNew = document.getElementById('tab-new');
    const tabArchive = document.getElementById('tab-archive');
    // GEWIJZIGD: Verwijst nu naar de container-div
    const newWorksheetBlock = document.getElementById('new-worksheet-block');
    const archivePanel = document.getElementById('archive-panel');
    // Deze blijven nodig om de selecties te kunnen resetten
    const welcomePanel = document.getElementById('welcome-panel'); 
    const newPanel = document.getElementById('new-panel'); 
    
    // Geschiedenis-elementen
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Functie voor notificaties
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.textContent = message;
        // Gebruik de nieuwe kleuren
        const bgColor = isError ? 'bg-red-500' : (COLORS.blue || '#2073af');
        notification.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50 ${isError ? 'bg-red-500' : ''}`;
        if (!isError) {
            notification.style.backgroundColor = bgColor;
        }
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
        // Gebruik de nieuwe kleuren
        btn.className = 'group-btn font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 bg-slate-200 text-slate-700';
        btn.dataset.group = group === '7/8' ? '7' : group;
        if (groupButtonsContainer) {
            groupButtonsContainer.appendChild(btn);
        }
    });

    // Event listener voor groep-knoppen
    if (groupButtonsContainer) {
        groupButtonsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('group-btn')) {
                handleGroupSelection(e.target, e.target.dataset.group);
            }
        });
    }

    function handleGroupSelection(selectedBtn, group) {
        currentGroup = group;

        // Update knopstijlen
        document.querySelectorAll('.group-btn').forEach(btn => {
            btn.classList.remove('text-white');
            btn.classList.add('bg-slate-200', 'text-slate-700');
            btn.style.backgroundColor = ''; // Reset inline style
        });
        selectedBtn.classList.add('text-white');
        selectedBtn.classList.remove('bg-slate-200', 'text-slate-700');
        selectedBtn.style.backgroundColor = COLORS.blue; // Gebruik de kleurvar

        displayCategories(currentGroup);
        if(worksheetOutput) worksheetOutput.innerHTML = ''; // Wis vorig werkblad
    }

    // Categorieën weergeven op basis van groep
    function displayCategories(group) {
        if (!categoryList) return;
        categoryList.innerHTML = '';
        const cats = (typeof groupCategories !== 'undefined' && groupCategories[group]) ? groupCategories[group] : [];
        if (cats.length === 0) return;
        
        cats.forEach(catId => {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            // Checkbox ook stylen met de nieuwe kleur
            div.innerHTML = `
                <input id="cat-${catId}" type="checkbox" data-cat-id="${catId}" class="h-4 w-4 rounded border-gray-300 focus:ring-opacity-50" style="color: ${COLORS.blue};">
                <label for="cat-${catId}" class="ml-3 block text-sm text-slate-700">${catId}. ${(typeof categories !== 'undefined' && categories[catId]) ? categories[catId] : 'Onbekend'}</label>
            `;
            categoryList.appendChild(div);
        });
    }


    // Maximaal 3 categorieën selecteren
    if (categoryList) {
        categoryList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const checkedCheckboxes = categoryList.querySelectorAll('input[type="checkbox"]:checked');
                if (checkedCheckboxes.length > 3) {
                    showNotification('Je kunt maximaal 3 categorieën selecteren.', true);
                    e.target.checked = false;
                }
            }
        });
    }

    // Event listener voor 'Maak Werkblad' knop
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const selectedCatIds = Array.from(categoryList.querySelectorAll('input:checked')).map(cb => parseInt(cb.dataset.catId));

            if (selectedCatIds.length === 0) {
                showNotification('Kies alsjeblieft minstens één categorie.', true);
                return;
            }
            // Sla de selecties op voor de geschiedenis
            const generationData = {
                selectedCatIds: selectedCatIds,
                group: currentGroup
            };
            await generateWorksheetWithAI(generationData, true); // true = save to history
        });
    }

    // --- AANGEPAST: Functie accepteert nu een data-object ---
    async function generateWorksheetWithAI(generationData, saveToHistory = false) {
        const { selectedCatIds, group } = generationData;
        
        // Zorg dat de UI klopt, ook bij laden uit geschiedenis
        currentGroup = group; 
        // Zoek de knop op basis van data-group attribuut
        const groupBtnValue = group === '7' ? '7' : group;
        const activeBtn = document.querySelector(`.group-btn[data-group="${groupBtnValue}"]`);
        if (activeBtn) {
            handleGroupSelection(activeBtn, group);
        }
        // Vink de checkboxes aan
        if (categoryList) {
            Array.from(categoryList.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
                cb.checked = selectedCatIds.includes(parseInt(cb.dataset.catId));
            });
        }


        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Woorden worden bedacht...`;

        try {
            const geselecteerdeRegels = (typeof spellingRegels !== 'undefined')
                ? spellingRegels.filter(regel => selectedCatIds.includes(regel.id))
                : [];
            const groupDisplay = group === '7' ? '7 of 8' : group;

            // --- AANGEPAST: Gebruikt de 'group' var ---
            const userQuery = `Genereer een spellingwerkblad voor groep ${groupDisplay} op basis van deze regels: ${JSON.stringify(geselecteerdeRegels, null, 2)}`;

            const systemPrompt = `Je bent een ervaren en creatieve leerkracht voor het basisonderwijs in Nederland, expert in de 'Staal' spellingmethode. Je taak is het genereren van een compleet, printklaar en didactisch verantwoord spellingwerkblad.
    
    Je volgt deze stappen:
    1.  **Genereer 15 Woorden:** Maak eerst een lijst van 15 unieke, voor de groep geschikte woorden die passen bij de opgegeven spellingcategorieën. **BELANGRIJK: Alle gegenereerde woorden moeten 100% correct gespeld zijn en voorkomen in het Nederlandse woordenboek.**
    2.  **Maak 3 Soorten Oefeningen:** Gebruik deze 15 woorden om 3 verschillende soorten oefeningen te maken. Elke oefeningsoort gebruikt 5 unieke woorden uit de lijst. Zorg dat elk woord precies één keer wordt gebruikt.

        - **Vorm 1: 'invulzinnen' (5 woorden):** Maak een **interessante, contextrijke zin** voor een basisschoolkind en vervang het doelwoord door '...' (drie puntjes).
          
          **BELANGRIJKE HOOFDREGEL: Pas de zinscomplexiteit AAN OP DE GROEP!**
          - **Groep 4:** Zeer korte, simpele zinnen (max. 8-10 woorden, geen moeilijke bijzinnen). Gebruik basiswoorden.
          - **Groep 5/6:** Korte, duidelijke zinnen (max. 10-12 woorden).
          - **Groep 7/8:** Zinnen mogen iets langer, maar de focus blijft op het woord, niet op begrijpend lezen.

          **ANDERE REGELS VOOR INVULZINNEN:**
          1.  **Plaatsing Placeholder:** De '...' hoeft **NIET** aan het einde te staan.
          2.  **Duidelijke Context:** De zin moet nog steeds voldoende context (minstens 2 woorden) bevatten zodat het kind het woord kan raden.
          3.  **Geen Vage Zinnen:** VERBIED zinnen als 'Ik heb een ...', 'Het ... is mooi.', 'Ik zie een ...', of definities.

        - **Vorm 2: 'kies_juiste_spelling' (5 woorden):** Maak een opdracht waarbij de leerling moet kiezen tussen het correct gespelde woord en een veelvoorkomende, fonetische fout (bv. 'hond / hont', 'pauw / pau', 'geit / gijt'). Gebruik een ' / ' als scheidingsteken.

        - **Vorm 3: 'regelvragen' (5 woorden):** Maak een concrete vraag die de spellingstrategie test. **BELANGRIJK: De vraag MOET de spellingregel van de categorie testen.** * Voorbeeld (Langermaakwoord): "Maak het langer: [verkorte vorm] ⟶"
          * Voorbeeld (Verkleinwoord): "Maak het verkleinwoord: [grondwoord] ⟶"
          * Voorbeeld (Samenstelling): "Voeg samen: [deel 1] + [deel 2] ⟶"
          * Voorbeeld (Kilowoord): "Wat hoor je, wat schrijf je? k-?-lo"
          * Wees creatief en zorg dat de vraag *altijd* relevant is voor de categorie.

    3.  **Lever het resultaat** als een perfect gestructureerd JSON-object. Gebruik exact dit formaat:
        \`{ "woordenlijst": [ { "woord": "voorbeeld", "categorie": 10 }, ... ], "oefeningen": { "invulzinnen": [ { "opdracht": "...", "woord": "...", "categorie": ... } ], "kies_juiste_spelling": [ { "opdracht": "Kies: ... / ...", "woord": "...", "categorie": ... } ], "regelvragen": [ { "opdracht": "...", "woord": "...", "categorie": ... } ] } }\``;

            let jsonResponseString = await callGeminiAPI(userQuery, systemPrompt);
            let worksheetData = JSON.parse(jsonResponseString);

            if (!worksheetData || !worksheetData.woordenlijst || !worksheetData.oefeningen || !worksheetData.oefeningen.invulzinnen || !worksheetData.oefeningen.kies_juiste_spelling || !worksheetData.oefeningen.regelvragen) {
                throw new Error("De AI gaf een onvolledig of incorrect geformatteerd antwoord.");
            }

            generateBtn.innerHTML = `<i class="fas fa-spell-check mr-2"></i> Woorden worden gecontroleerd...`;
            
            // --- AANROEP NAAR DE TOEGEVOEGDE FUNCTIE ---
            let invalidWords = await validateWords(worksheetData.woordenlijst);

            if (invalidWords.length > 0) {
                generateBtn.innerHTML = `<i class="fas fa-wand-magic-sparkles mr-2"></i> Magie wordt toegevoegd...`; // Positief bericht

                const invalidWordsInfo = invalidWords.map(item => ({ original: item.woord, categorie: (typeof categories !== 'undefined' && categories[item.categorie]) ? categories[item.categorie] : 'Onbekend' }));
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
            
            // --- AANGEPAST: Sla op in geschiedenis ---
            if (saveToHistory) {
                saveWorksheetToHistory(generationData, worksheetData);
            }
            
            if (typeof renderWorksheet === 'function') {
                // --- AANGEPAST: Geef de *huidige* selecties mee ---
                renderWorksheet(worksheetData, selectedCatIds, group);
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
                 userMessage = "De AI gaf een onverwacht antwoord. Probeer het nog eens.";
            } else if (error.message.includes("veiligheidsfilter")) {
                userMessage = error.message;
            }
            showNotification(userMessage, true);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic mr-2"></i> Maak Werkblad`;
        }
    }

    // --- TOEGEVOEGDE FUNCTIE ---
    // Functie om woorden te valideren via een externe API
    async function validateWords(wordList) {
        const invalidWords = [];
        const apiUrl = "https://nl.wiktionary.org/api/rest_v1/page/definition/";

        for (const item of wordList) {
            const word = item.woord.toLowerCase();
            try {
                // Wacht 50ms tussen verzoeken om de API-limiet niet te raken
                await new Promise(resolve => setTimeout(resolve, 50)); 
                
                const response = await fetch(apiUrl + encodeURIComponent(word), {
                    headers: { 'Accept': 'application/json' }
                });

                if (response.status === 404) {
                    // 404 betekent dat het woord niet is gevonden
                    invalidWords.push(item);
                } else if (!response.ok) {
                    // Andere fouten (bv. 500, 503) negeren we en we gaan ervan uit dat het woord oké is
                    console.warn(`Woordenboek API gaf status ${response.status} voor woord: ${word}`);
                }
                // Als response.ok (status 200) is, is het woord geldig.
                
            } catch (error) {
                console.error(`Fout bij valideren van woord ${word}:`, error);
                // Bij een netwerkfout gaan we er voor nu vanuit dat het woord oké is
            }
        }
        return invalidWords;
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

    // ===================================================================================
    // GESCHIEDENIS FUNCTIES
    // ===================================================================================

    function loadHistory() {
        const savedHistory = localStorage.getItem('staalmaatjeHistory');
        worksheetHistory = savedHistory ? JSON.parse(savedHistory) : [];
    }

    function saveHistory() {
        localStorage.setItem('staalmaatjeHistory', JSON.stringify(worksheetHistory));
    }

    function saveWorksheetToHistory(generationData, worksheetData) {
        const timestamp = new Date().toISOString();
        const title = `Groep ${generationData.group === '7' ? '7/8' : generationData.group} - ${generationData.selectedCatIds.map(id => (typeof categories !== 'undefined' && categories[id]) ? categories[id] : '').join(', ').substring(0, 30)}...`;
        
        const historyEntry = {
            id: timestamp,
            title: title,
            generationData: generationData,
            worksheetData: worksheetData // Sla het *resultaat* op
        };

        // Voeg vooraan toe
        worksheetHistory.unshift(historyEntry);
        
        // Beperk tot 10
        if (worksheetHistory.length > 10) {
            worksheetHistory.pop();
        }
        
        saveHistory();
        renderHistoryList(); // Update de lijst
    }

    function renderHistoryList() {
        if (!historyList) return;
        
        historyList.innerHTML = ''; // Maak leeg
        
        if (worksheetHistory.length === 0) {
            historyList.innerHTML = `<p class="text-slate-500">Je hebt nog geen werkbladen gemaakt. Maak een nieuw werkblad en het verschijnt hier!</p>`;
            return;
        }

        worksheetHistory.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'p-4 border border-slate-200 rounded-lg flex justify-between items-center transition-all hover:bg-slate-50';
            div.innerHTML = `
                <div>
                    <a href="#" class="font-semibold" style="color: ${COLORS.blue};" data-history-id="${entry.id}">${entry.title}</a>
                    <p class="text-sm text-slate-500">${new Date(entry.id).toLocaleString('nl-NL')}</p>
                </div>
                <button data-delete-id="${entry.id}" class="text-red-500 hover:text-red-700 px-2 py-1 rounded-md">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            historyList.appendChild(div);
        });
    }
    
    function deleteWorksheetFromHistory(id) {
        worksheetHistory = worksheetHistory.filter(entry => entry.id !== id);
        saveHistory();
        renderHistoryList();
    }

    function loadWorksheetFromHistory(id) {
        const entry = worksheetHistory.find(entry => entry.id === id);
        if (!entry) {
            showNotification('Kon dit werkblad niet vinden in de geschiedenis.', true);
            return;
        }
        
        // Laad de opgeslagen data
        currentWorksheetData = entry.worksheetData;
        
        // Render het werkblad met de opgeslagen data
        if (typeof renderWorksheet === 'function') {
            renderWorksheet(entry.worksheetData, entry.generationData.selectedCatIds, entry.generationData.group);
        } else {
            console.error("renderWorksheet functie niet gevonden.");
            showNotification("Fout bij het weergeven van het werkblad.", true);
        }
        
        // We hoeven niet terug te schakelen naar de 'Nieuw' tab,
        // het werkblad wordt gewoon onderaan de 'Archief' tab geladen.
    }

    // Event listener for history list (laden en verwijderen)
    if (historyList) {
        historyList.addEventListener('click', (e) => {
            const target = e.target.closest('a[data-history-id]');
            const deleteBtn = e.target.closest('button[data-delete-id]');

            if (target) {
                e.preventDefault();
                loadWorksheetFromHistory(target.dataset.historyId);
            } else if (deleteBtn) {
                e.preventDefault();
                // Vervang alert/confirm door custom UI indien gewenst
                if (window.confirm('Weet je zeker dat je dit opgeslagen werkblad wilt verwijderen?')) {
                    // --- FIX: Typfout in functienaam ---
                    deleteWorksheetFromHistory(deleteBtn.dataset.deleteId);
                }
            }
        });
    }
    
    // Knop 'Alles wissen'
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            // Vervang alert/confirm door custom UI indien gewenst
            if (window.confirm('Weet je zeker dat je de *volledige* geschiedenis wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
                worksheetHistory = [];
                saveHistory();
                renderHistoryList();
            }
        });
    }

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
        // --- FIX: Ontbrekend haakje { toegevoegd ---
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
    
    // ===================================================================================
    // INIT & TAB LOGICA
    // ===================================================================================
    
    function switchToTab(tabName) {
        if (tabName === 'new') {
            // Set active tab styles
            if (tabNew) {
                tabNew.style.color = COLORS.blue;
                tabNew.style.boxShadow = `inset 0 -2px 0 0 ${COLORS.blue}`;
            }
            if (tabArchive) {
                tabArchive.style.color = '';
                tabArchive.style.boxShadow = 'none';
            }

            // Show/hide panels
            // GEWIJZIGD: Toon/verberg de nieuwe container
            if (newWorksheetBlock) {
                newWorksheetBlock.classList.remove('hidden');
                newWorksheetBlock.classList.add('grid');
// FOUT: 'open' hier verwijderd
            }
            if (archivePanel) archivePanel.classList.add('hidden');
            if (worksheetOutput) worksheetOutput.innerHTML = ''; // Clear worksheet
            
            // Reset de "Nieuw" tab naar de standaard (Groep 4)
            const defaultGroupBtn = document.querySelector('.group-btn[data-group="4"]');
            if (defaultGroupBtn) {
                handleGroupSelection(defaultGroupBtn, '4');
            }
            
        } else { // 'archive'
            // Set active tab styles
            if (tabNew) {
                tabNew.style.color = '';
                tabNew.style.boxShadow = 'none';
            }
            if (tabArchive) {
                tabArchive.style.color = COLORS.blue;
                tabArchive.style.boxShadow = `inset 0 -2px 0 0 ${COLORS.blue}`;
            }

            // Show/hide panels
            // GEWIJZIGD: Toon/verberg de nieuwe container
            if (newWorksheetBlock) {
                newWorksheetBlock.classList.add('hidden');
                newWorksheetBlock.classList.remove('grid');
            }
            if (archivePanel) archivePanel.classList.remove('hidden');
            if (worksheetOutput) worksheetOutput.innerHTML = ''; // Clear worksheet
            
            // Laad en toon de geschiedenis
            renderHistoryList();
        }
    }

    // Tab-logica
    if (tabNew) {
        tabNew.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab('new');
        });
    }
 
    // --- FIX: De event listener voor de Archief-knop was verdwenen ---
    if (tabArchive) {
        tabArchive.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab('archive');
        });
    }

    // --- INIT ---
    loadHistory();
    // Selecteer Groep 4 standaard
    const defaultGroupBtn = document.querySelector('.group-btn[data-group="4"]');
    if (defaultGroupBtn) {
        handleGroupSelection(defaultGroupBtn, '4');
    }
    // Start op de 'Nieuw' tab
    switchToTab('new');
});



