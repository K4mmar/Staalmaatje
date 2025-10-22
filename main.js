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
        // Gebruik de groupCategories uit data.js (ervan uitgaande dat die geladen is)
        const cats = typeof groupCategories !== 'undefined' ? groupCategories[group] : [];
        if (!cats) return;
        cats.forEach(catId => {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            div.innerHTML = `
                <input id="cat-${catId}" type="checkbox" data-cat-id="${catId}" class="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500">
                <label for="cat-${catId}" class="ml-3 block text-sm text-gray-700">${catId}. ${categories[catId] || 'Onbekend'}</label>
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
                // Gebruik Wiktionary API voor woordvalidatie
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
            // Gebruik spellingRegels uit data.js
            const geselecteerdeRegels = typeof spellingRegels !== 'undefined'
                ? spellingRegels.filter(regel => selectedCatIds.includes(regel.id))
                : [];
            const groupDisplay = currentGroup === '7' ? '7 of 8' : currentGroup;

            const userQuery = `Genereer een spellingwerkblad voor groep ${groupDisplay} op basis van deze regels: ${JSON.stringify(geselecteerdeRegels, null, 2)}`;

            // --- AANGEPAST: Placeholder veranderd naar '...' ---
            const systemPrompt = `Je bent een ervaren en creatieve leerkracht voor het basisonderwijs in Nederland, expert in de 'Staal' spellingmethode. Je taak is het genereren van een compleet, printklaar en didactisch verantwoord spellingwerkblad.

    **BELANGRIJKSTE REGEL:** De complexiteit van *alle* zinnen en opdrachten moet **strikt** aansluiten bij de opgegeven groep.
    * **Groep 4:** Gebruik uitsluitend zeer eenvoudige, korte zinnen (onderwerp-werkwoord-voorwerp, max 8-10 woorden).
    * **Groep 5/6:** Zinnen mogen iets langer zijn, maar de focus blijft op eenvoudige taal.
    * **Groep 7/8:** Zinnen mogen complexer zijn, maar de focus ligt altijd op spelling, niet op leesbegrip.

    Je volgt deze stappen:
    1.  **Genereer 15 Woorden:** Maak eerst een lijst van 15 unieke, voor de groep geschikte woorden die passen bij de opgegeven spellingcategorieën. **BELANGRIJK: Alle gegenereerde woorden moeten 100% correct gespeld zijn en voorkomen in het Nederlandse woordenboek.**
    2.  **Maak 3 Soorten Oefeningen:** Gebruik deze 15 woorden om 3 verschillende soorten oefeningen te maken. Elke oefeningsoort gebruikt 5 unieke woorden uit de lijst. Zorg dat elk woord precies één keer wordt gebruikt.

        - **Vorm 1: 'invulzinnen' (5 woorden):** Maak een **contextrijke zin** die **eenvoudig genoeg is voor de geselecteerde groep** en vervang het doelwoord door '...' (drie puntjes).
          **BELANGRIJKE REGELS VOOR INVULZINNEN:**
          1.  **Niveau-aanpassing (CRUCIAAL):** De zin *moet* makkelijk leesbaar zijn. Voor groep 4, houd zinnen extreem kort en simpel. De moeilijkheid zit in het *spellen* van het woord, niet in het *begrijpen* van de zin.
          2.  **Plaatsing Placeholder:** De '...' hoeft **NIET** aan het einde te staan. Plaats het waar het grammaticaal en logisch zinvol is.
          3.  **Engagement:** Maak de zinnen leuk (dieren, avontuur, school), maar *nooit* ten koste van de eenvoud.
          4.  **Duidelijke Context:** De zin moet nog steeds voldoende context (minstens 2 woorden) bevatten zodat het kind het woord kan raden.
          5.  **Geen Vage Zinnen:** VERBIED zinnen als 'Ik heb een ...', 'Het ... is mooi.', 'Ik zie een ...', of definities.
          6.  **Voorbeeld Interessant (maar simpel):** 'De dappere ridder vecht tegen de ... met zijn zwaard.' (Voorbeeld voor groep 5/6)
          7.  **Voorbeeld Middenin (simpel):** 'In de winter draag ik een warme ... en handschoenen.'
          8.  **Slecht Voorbeeld:** 'Een ... is geel.' (Te saai, geen context).

        - **Vorm 2: 'kies_juiste_spelling' (5 woorden):** Maak een opdracht waarbij de leerling moet kiezen tussen het correct gespelde woord en een veelvoorkomende, fonetische fout (bv. 'hond / hont', 'pauw / pau', 'geit / gijt'). Gebruik een ' / ' als scheidingsteken.

        - **Vorm 3: 'regelvragen' (5 woorden):** Maak een concrete vraag die de leerling dwingt om de **specifieke spellingregel** (behorend bij de categorie) toe te passen om het doelwoord te vormen.
          **BELANGRIJKE REGELS VOOR REGELVRAGEN:**
          1.  **Directe Link:** De vraag moet *direct* de strategie van de spellingcategorie testen.
          2.  **Focus op Toepassing:** De vraag moet de leerling leiden naar het *schrijven* van het doelwoord door de regel toe te passen.
          3.  **Suggesties (niet verplicht):** Gebruik formats die passen bij de regel.
              * Bij 'Langermaakwoord' (bv. hond): "Maak het langer: hond ⟶ ..." (om 'd' of 't' te testen).
              * Bij 'Verkleinwoord' (bv. boom): "Maak het verkleinwoord: boom ⟶ ..."
              * Bij 'Samenstelling' (bv. rugzak): "Voeg samen: rug + zak ⟶ ..."
              * Bij 'Klankgroepenwoord' (bv. bakker): Vraag naar het meervoud, of een vraag die de klankgroep test.
          4.  **Verbod:** Abstracte vragen over *betekenis* zijn STRIKT VERBODEN.

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
                    const originalWord = ex.woord;
                    if (correctionMap.has(originalWord)) {
                        const correctedWord = correctionMap.get(originalWord);
                        ex.woord = correctedWord;
                        try {
                           const escapedOriginalWord = originalWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                           // Gebruik de global flag 'g' om alle voorkomens te vervangen
                           const regex = new RegExp(escapedOriginalWord.replace(/\.\.\./g, '\\.\\.\\.'), 'g');
                           ex.opdracht = ex.opdracht.replace(regex, correctedWord);
                        } catch (e) {
                            console.warn("Kon woord niet vervangen in opdracht:", originalWord, correctedWord, e);
                            ex.opdracht = ex.opdracht.replace(originalWord, correctedWord); // Fallback
                        }
                         // Specifieke vervanging voor de placeholder zelf, mocht die in het 'woord' staan (onwaarschijnlijk maar safe)
                         ex.opdracht = ex.opdracht.replace('...........', '...');
                         ex.opdracht = ex.opdracht.replace('...', '...'); // Zorg dat we altijd maar 3 puntjes hebben
                    }
                     // Vervang ook de placeholder in correcte woorden
                     ex.opdracht = ex.opdracht.replace('...........', '...');

                });
                 // Laatste controle: zorg dat alle placeholders '...' zijn
                Object.values(worksheetData.oefeningen).flat().forEach(ex => {
                   ex.opdracht = ex.opdracht.replace('...........', '...');
                });
            }


            currentWorksheetData = worksheetData;
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


