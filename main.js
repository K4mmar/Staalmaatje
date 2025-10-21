// ===================================================================================
// MAIN.JS - De 'motor' van de applicatie
// Dit bestand bevat de interactieve logica, AI-communicatie en event listeners.
// ===================================================================================

let currentWorksheetData = {};
let currentGroup = null;

document.addEventListener('DOMContentLoaded', () => {
    // Stijlen voor printen toevoegen
    const style = document.createElement('style');
    style.innerHTML = `
        @media print { 
            @page { size: A4 portrait; margin: 1.5cm; } 
            #student-sheet, #answer-sheet { display: none; }
            body.print-student-sheet #student-sheet { display: block; }
            body.print-answer-sheet #answer-sheet { display: block; }
            .no-print { display: none !important; }
            .printable-area { box-shadow: none !important; border: none !important; }
        }
    `;
    document.head.appendChild(style);

    // DOM-elementen ophalen
    const groupButtonsContainer = document.getElementById('group-buttons');
    const categorySelection = document.getElementById('category-selection');
    const categoryList = document.getElementById('category-list');
    const generateBtnContainer = document.getElementById('generate-button-container');
    const generateBtn = document.getElementById('generate-btn');

    // Functie voor notificaties
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50 ${isError ? 'bg-red-500' : 'bg-blue-500'}`;
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
        btn.className = 'group-btn font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 bg-gray-200 text-gray-700';
        btn.dataset.group = group === '7/8' ? '7' : group;
        groupButtonsContainer.appendChild(btn);
    });

    // Event listener voor groep-knoppen
    groupButtonsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('group-btn')) {
            currentGroup = e.target.dataset.group;
            
            document.querySelectorAll('.group-btn').forEach(btn => {
                btn.classList.remove('bg-pink-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            e.target.classList.add('bg-pink-600', 'text-white');
            e.target.classList.remove('bg-gray-200', 'text-gray-700');

            displayCategories(currentGroup);
            categorySelection.classList.remove('hidden');
            generateBtnContainer.classList.remove('hidden');
            document.getElementById('worksheet-output').innerHTML = ''; 
        }
    });

    // Categorieën weergeven op basis van groep
    function displayCategories(group) {
        categoryList.innerHTML = '';
        const cats = groupCategories[group];
        if (!cats) return;
        cats.forEach(catId => {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            div.innerHTML = `
                <input id="cat-${catId}" type="checkbox" data-cat-id="${catId}" class="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500">
                <label for="cat-${catId}" class="ml-3 block text-sm text-gray-700">${catId}. ${categories[catId]}</label>
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
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/nl/${word}`);
                if (!response.ok && response.status === 404) {
                    return { ...item, isValid: false };
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
            const geselecteerdeRegels = spellingRegels.filter(regel => selectedCatIds.includes(regel.id));
            const groupDisplay = currentGroup === '7' ? '7 of 8' : currentGroup;
            
            const userQuery = `Genereer een spellingwerkblad voor groep ${groupDisplay} op basis van deze regels: ${JSON.stringify(geselecteerdeRegels, null, 2)}`;
            const systemPrompt = `Je bent een ervaren en creatieve leerkracht voor het basisonderwijs in Nederland, expert in de 'Staal' spellingmethode. Je taak is het genereren van een compleet, printklaar en didactisch verantwoord spellingwerkblad.
    
    Je volgt deze stappen:
    1.  **Genereer 15 Woorden:** Maak eerst een lijst van 15 unieke, voor de groep geschikte woorden die passen bij de opgegeven spellingcategorieën. **BELANGRIJK: Alle gegenereerde woorden moeten 100% correct gespeld zijn en voorkomen in het Nederlandse woordenboek.**
    2.  **Maak 3 Soorten Oefeningen:** Gebruik deze 15 woorden om 3 verschillende soorten oefeningen te maken. Elke oefeningsoort gebruikt 5 unieke woorden uit de lijst. Zorg dat elk woord precies één keer wordt gebruikt.
        - **Vorm 1: 'invulzinnen' (5 woorden):** Maak een zin en vervang het doelwoord door '...........'.
        - **Vorm 2: 'kies_juiste_spelling' (5 woorden):** Maak een opdracht waarbij de leerling moet kiezen tussen het correct gespelde woord en een veelvoorkomende, fonetische fout (bv. 'hond / hont', 'pauw / pau', 'geit / gijt').
        - **Vorm 3: 'regelvragen' (5 woorden):** Maak een concrete vraag die de spellingstrategie test. **BELANGRIJK: De vraag MOET één van deze formats gebruiken:** "Maak het meervoud: [enkelvoudsvorm] ⟶", "Maak het langer: [verkorte vorm] ⟶", "Maak het verkleinwoord: [grondwoord] ⟶", of "Voeg samen: [deel 1] + [deel 2] ⟶". De vraag moet de leerling leiden naar het invullen van het doelwoord. Abstracte vragen over betekenis zijn STRIKT VERBODEN.
    3.  **Lever het resultaat** als een perfect gestructureerd JSON-object. Gebruik exact dit formaat:
        \`{ "woordenlijst": [ { "woord": "voorbeeld", "categorie": 10 }, ... ], "oefeningen": { "invulzinnen": [ { "opdracht": "...", "woord": "...", "categorie": ... } ], "kies_juiste_spelling": [ { "opdracht": "Kies: ... / ...", "woord": "...", "categorie": ... } ], "regelvragen": [ { "opdracht": "...", "woord": "...", "categorie": ... } ] } }\``;
    
            let jsonResponseString = await callGeminiAPI(userQuery, systemPrompt);
            let worksheetData = JSON.parse(jsonResponseString);

            if (!worksheetData || !worksheetData.woordenlijst || !worksheetData.oefeningen) {
                throw new Error("De AI gaf een onvolledig antwoord.");
            }
            
            generateBtn.innerHTML = `<i class="fas fa-spell-check mr-2"></i> Woorden worden gecontroleerd...`;
            let invalidWords = await validateWords(worksheetData.woordenlijst);

            if (invalidWords.length > 0) {
                generateBtn.innerHTML = `<i class="fas fa-wand-magic-sparkles mr-2"></i> Foutjes worden hersteld...`;
                
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
                    if (correctionMap.has(ex.woord)) {
                        const originalWord = ex.woord;
                        const correctedWord = correctionMap.get(originalWord);
                        ex.woord = correctedWord;
                        ex.opdracht = ex.opdracht.replace(new RegExp(originalWord, 'g'), correctedWord);
                    }
                });
            }

            currentWorksheetData = worksheetData;
            renderWorksheet(worksheetData, selectedCatIds, currentGroup);

        } catch (error) {
            console.error("Fout bij genereren van AI werkblad:", error);
            let userMessage = `Oeps, er ging iets mis: ${error.message}`;
            if (error.message.includes("429") || error.message.includes("quota")) {
                userMessage = "De AI-limiet voor de gratis versie is bereikt. Probeer het over een minuutje opnieuw.";
            } else if (error.message.includes("503")) {
                userMessage = "De AI-service is momenteel overbelast. Probeer het later opnieuw.";
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
                    errorMsg = errorJson.error ? errorJson.error.message : responseText;
                } catch (e) {
                     errorMsg = responseText || errorMsg;
                }
                throw new Error(errorMsg);
            }
            return responseText;

        } catch (error) {
            console.error("Fout bij het aanroepen van de Netlify Function:", error);
            throw error;
        }
    }

    // Functies die globaal beschikbaar moeten zijn (voor knoppen in de HTML)
    window.generateStory = async function() {
        const storyBtn = document.getElementById('generate-story-btn');
        const storyContainer = document.getElementById('story-container');
        if (!storyBtn || !storyContainer || !currentWorksheetData.woordenlijst) return;

        storyBtn.disabled = true;
        storyBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Verhaal wordt gemaakt...`;
        storyContainer.innerHTML = `<h3 class="text-2xl font-bold mb-4">✨ Jouw unieke verhaal!</h3><div id="story-output" class="p-4 bg-purple-50 rounded-lg border border-purple-200 min-h-[100px]"><p>Een momentje, de woorden-elfjes zijn druk aan het schrijven...</p></div>`;

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
});
