// ===================================================================================
// SPELLINGREGELS - Het 'brein' van de app
// ===================================================================================
const spellingRegels = [
  { "id": 1, "naam": "Hakwoord", "regel": "Ik schrijf het woord zoals ik het hoor. Speciaal hakwoord (zoals in 'melk'): daar mag geen 'u' tussen." },
  { "id": 2, "naam": "Zingwoord", "regel": "Net als bij ding dong." },
  { "id": 3, "naam": "Luchtwoord", "regel": "Korte klank + cht met de ch van lucht. Uitzonderingen: hij ligt, hij legt, hij zegt." },
  { "id": 4, "naam": "Plankwoord", "regel": "Daar mag geen 'g' tussen." },
  { "id": 5, "naam": "Eer-oor-eur woord", "regel": "Ik schrijf eer, oor, of eur." },
  { "id": 6, "naam": "Aai-ooi-oei woord", "regel": "Ik hoorde de 'j', maar ik schrijf de 'i'." },
  { "id": 7, "naam": "Eeuw-ieuw woord", "regel": "Ik denk aan de 'u' bij eeuw." },
  { "id": 8, "naam": "Langermaakwoord", "regel": "Ik hoor een 't' aan het eind, dus langer maken om te horen of ik 'd' of 't' moet schrijven (hond-honden). Ook voor woorden die eindigen op 'b' (krab-krabben)." },
  { "id": 9, "naam": "Voorvoegsel", "regel": "Ik hoor de 'u', maar ik schrijf de 'e' (be-, ge-, ver-)." },
  { "id": 10, "naam": "Klankgroepenwoord", "regel": "Verdeel het woord in klankgroepen. Korte klank aan het eind van een klankgroep: medeklinker dubbel schrijven (bakker). Lange klank aan het eind van een klankgroep: een stukje van de lange klank weghalen (apen)." },
  { "id": 11, "naam": "Verkleinwoord", "regel": "Grondwoord + -je, -tje of -pje. Ik hoor '-utje', maar ik schrijf '-etje'." },
  { "id": 12, "naam": "Achtervoegsel", "regel": "-ig: Ik hoor '-ug', maar ik schrijf '-ig'. -lijk: Ik hoor '-luk', maar ik schrijf '-lijk'." },
  { "id": 13, "naam": "Kilowoord", "regel": "Ik hoor de 'ie', maar ik schrijf de 'i'." },
  { "id": 14, "naam": "Komma-s meervoud", "regel": "Meervoud en aan het eind een lange klank, dan komma-s, behalve bij de -e." },
  { "id": 15, "naam": "Centwoord", "regel": "Ik hoor de 's', maar ik schrijf de 'c'." },
  { "id": 16, "naam": "Komma-s diverse", "regel": "Komma-s bij meervoud, bezit, verkleinwoorden of weglatingsteken." },
  { "id": 17, "naam": "Politiewoord", "regel": "Ik hoor 'sie', maar ik schrijf 'tie'." },
  { "id": 18, "naam": "Colawoord", "regel": "Ik hoor de 'k', maar ik schrijf de 'c'." },
  { "id": 19, "naam": "Tropisch woord", "regel": "Ik hoor 'ies', maar ik schrijf 'isch'." },
  { "id": 20, "naam": "Taxiwoord", "regel": "Ik hoor 'ks', maar ik schrijf de 'x'." },
  { "id": 21, "naam": "Chefwoord", "regel": "Ik hoor 'sj', maar ik schrijf 'ch'." },
  { "id": 22, "naam": "Theewoord", "regel": "Ik hoor 't', maar ik schrijf 'th'." },
  { "id": 23, "naam": "Caféwoord", "regel": "Met een streepje op de 'e'." },
  { "id": 24, "naam": "Cadeauwoord", "regel": "Ik hoor 'oo', maar ik schrijf 'eau'." },
  { "id": 25, "naam": "Routewoord", "regel": "Ik hoor 'oe', maar ik schrijf 'ou'." },
  { "id": 26, "naam": "Garagewoord", "regel": "Ik hoor 'zj', maar ik schrijf 'g'." },
  { "id": 27, "naam": "Lollywoord", "regel": "Ik hoor 'ie' aan het eind, maar ik schrijf 'y'." },
  { "id": 28, "naam": "Tremawoord", "regel": "Bij klinkerbotsing, een trema op de volgende klinker. Uitzondering: -ee en -ie." },
  { "id": 29, "naam": "Militairwoord", "regel": "Ik hoor 'èr', maar ik schrijf 'air'." },
  { "id": 30, "naam": "Koppelteken", "regel": "In samenstellingen met klinkerbotsing, aardrijkskundige namen, afkortingen." },
  { "id": 31, "naam": "Trottoirwoord", "regel": "Ik hoor 'waar', maar ik schrijf 'oir'." },
  { "id": 32, "naam": "Tussen-e of -en", "regel": "Samenstelling met tussen -n of -en. Hoofdregel: schrijf altijd -en, tenzij het eerste deel uniek is of geen -en meervoud heeft." },
  { "id": 33, "naam": "Apostrofwoord", "regel": "Bij meervoud van woorden op -a, -i, -o, -u, -y. Bij bezit als de naam eindigt op een sisklank of een lange klinker." },
  { "id": 34, "naam": "Latijns voorvoegsel", "regel": "Voorvoegsels zoals ab-, ad-, con-, ob-, sub-." },
  { "id": 35, "naam": "Samenstelling", "regel": "Een woord dat bestaat uit twee of meer woorden die ook zelfstandig kunnen voorkomen." },
  { "id": 36, "naam": "Ei-plaat", "regel": "Weetwoord, leer de woorden van de ei-plaat." },
  { "id": 37, "naam": "Au-plaat", "regel": "Weetwoord, leer de woorden van de au-plaat." }
];

const categories = {
    1: "Hakwoord", 2: "Zingwoord", 3: "Luchtwoord", 4: "Plankwoord", 5: "Eer-oor-eur woord",
    6: "Aai-ooi-oei woord", 7: "Eeuw-ieuw woord", 8: "Langermaakwoord", 9: "Voorvoegsel", 10: "Klankgroepenwoord",
    11: "Verkleinwoord", 12: "Achtervoegsel (-ig/-lijk)", 13: "Kilowoord", 14: "Komma-s meervoud", 15: "Centwoord",
    16: "Komma-s diverse", 17: "Politiewoord", 18: "Colawoord", 19: "Tropisch woord", 20: "Taxiwoord",
    21: "Chefwoord", 22: "Theewoord", 23: "Caféwoord", 24: "Cadeauwoord", 25: "Routewoord",
    26: "Garagewoord", 27: "Lollywoord", 28: "Tremawoord", 29: "Militairwoord", 30: "Koppelteken",
    31: "Trottoirwoord", 32: "Tussen-e of -en", 33: "Apostrofwoord", 34: "Latijns voorvoegsel",
    35: "Samenstelling", 36: "Ei-plaat", 37: "Au-plaat"
};

const groupCategories = {
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 35, 36, 37],
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 35, 36, 37],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 35, 36, 37],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]
};

// ===================================================================================
// APP LOGICA
// ===================================================================================
let currentWorksheetWords = [];
let currentGroup = null;

document.addEventListener('DOMContentLoaded', () => {
    const groupButtonsContainer = document.getElementById('group-buttons');
    const categorySelection = document.getElementById('category-selection');
    const categoryList = document.getElementById('category-list');
    const generateBtnContainer = document.getElementById('generate-button-container');
    const generateBtn = document.getElementById('generate-btn');
    const worksheetOutput = document.getElementById('worksheet-output');
    const selectAllBtn = document.getElementById('select-all-btn');

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

    ['4', '5', '6', '7/8'].forEach(group => {
        const btn = document.createElement('button');
        btn.textContent = `Groep ${group}`;
        btn.className = 'group-btn font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 bg-gray-200 text-gray-700';
        btn.dataset.group = group === '7/8' ? '7' : group;
        groupButtonsContainer.appendChild(btn);
    });

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
            worksheetOutput.innerHTML = ''; 
        }
    });

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

    selectAllBtn.addEventListener('click', () => {
        const checkboxes = categoryList.querySelectorAll('input[type="checkbox"]');
        const allSelected = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allSelected);
    });
    
    generateBtn.addEventListener('click', async () => {
        const selectedCatIds = Array.from(categoryList.querySelectorAll('input:checked')).map(cb => parseInt(cb.dataset.catId));
        
        if (selectedCatIds.length === 0) {
            showNotification('Kies alsjeblieft minstens één categorie.', true);
            return;
        }
        await generateWorksheetWithAI(selectedCatIds);
    });

    async function generateWorksheetWithAI(selectedCatIds) {
        const generateButton = document.getElementById('generate-btn');
        generateButton.disabled = true;
        generateButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Woorden worden gemaakt...`;

        try {
            const geselecteerdeRegels = spellingRegels.filter(regel => selectedCatIds.includes(regel.id));
            const groupDisplay = currentGroup === '7' ? '7 of 8' : currentGroup;

            const userQuery = `Genereer 12 unieke woorden voor een kind in groep ${groupDisplay} op basis van de volgende spellingcategorieën: ${JSON.stringify(geselecteerdeRegels, null, 2)}.`;
            
            const systemPrompt = `Je bent een behulpzame onderwijsassistent gespecialiseerd in de Nederlandse taal voor basisschoolkinderen. Je taak is het genereren van woorden voor een spellingwerkblad volgens de 'Staal' methode. Je krijgt een lijst met geselecteerde spellingcategorieën, inclusief hun naam en de specifieke regel. Genereer op basis van deze selectie 12 unieke Nederlandse woorden. Zorg ervoor dat de woorden passen bij de opgegeven categorie en regel. Voor elk woord, bedenk een korte, eenvoudige Nederlandse zin die geschikt is voor een kind. In de zin moet het woord voorkomen. Lever het resultaat alleen als een perfect gestructureerd JSON-object terug. Gebruik het volgende formaat: \`{ "woordenlijst": [ { "woord": "voorbeeldwoord", "zin": "Dit is een zin met het [voorbeeldwoord].", "categorie": ID }, ... ] }\`. Gebruik geen moeilijke of ongepaste woorden. De zinnen moeten natuurlijk en begrijpelijk zijn. Plaats het gegenereerde woord in de zin tussen vierkante haken [].`;

            const jsonResponse = await callGeminiAPI(userQuery, systemPrompt);
            const resultObject = JSON.parse(jsonResponse);
            const worksheetWords = resultObject.woordenlijst;

            if (!worksheetWords || worksheetWords.length === 0) {
                throw new Error("De AI kon geen woorden genereren.");
            }

            renderWorksheet(worksheetWords, selectedCatIds);

        } catch (error) {
            console.error("Fout bij genereren van AI werkblad:", error);
            showNotification(`Oeps, er ging iets mis: ${error.message}`, true);
        } finally {
            generateButton.disabled = false;
            generateButton.innerHTML = `<i class="fas fa-magic mr-2"></i> Maak Werkblad`;
        }
    }

    async function callGeminiAPI(userQuery, systemPrompt) {
        // De URL van onze eigen veilige Netlify Function
        const functionUrl = '/.netlify/functions/generate-words';

        try {
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                 // CORRECTIE: De 'keys' moeten overeenkomen met wat de Netlify Function verwacht ('query' en 'prompt')
                body: JSON.stringify({ query: userQuery, prompt: systemPrompt }),
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => response.text());
                throw new Error(errorResult.error || errorResult || 'Er is een onbekende fout opgetreden bij de server.');
            }

            const resultText = await response.text();
            return JSON.parse(resultText);

        } catch (error) {
            console.error("Fout bij het aanroepen van de Netlify Function:", error);
            throw error;
        }
    }

    function renderWorksheet(words, selectedCatIds) {
        const selectedCatText = selectedCatIds.map(id => `${id}: ${categories[id]}`).join(', ');
        const groupDisplay = currentGroup === '7' ? '7/8' : currentGroup;

        let studentSheetHTML = `
            <h2 class="text-2xl font-bold mb-1">Spellingwerkblad Groep ${groupDisplay}</h2>
            <p class="text-sm text-gray-500 mb-6">Categorieën: ${selectedCatText}</p>
            <div style="display: grid; grid-template-columns: 20px 1fr 80px; align-items: end; row-gap: 20px;">
                <span class="font-bold text-gray-500"></span>
                <span class="font-bold text-gray-500 ml-2">Schrijf het woord op</span>
                <span class="font-bold text-gray-500 text-center">Categorie</span>
                ${words.map((item, index) => `
                   <div class="font-semibold">${index + 1}.</div>
                   <div class="flex items-center gap-3">
                       <button onclick="speak('${item.zin.replace(/\[|\]/g, '')}')" class="no-print text-blue-500 hover:text-blue-700 text-xl"><i class="fas fa-volume-up"></i></button>
                       <div class="w-full border-b-2 border-dotted border-gray-400 pb-1"></div>
                   </div>
                   <div class="border-b-2 border-dotted border-gray-400 h-8 text-center">${item.categorie}</div>
                `).join('')}
            </div>
        `;
        
        let answerSheetHTML = `
            <h2 class="text-2xl font-bold mb-1">Antwoordenblad Groep ${groupDisplay}</h2>
            <p class="text-sm text-gray-500 mb-6">Categorieën: ${selectedCatText}</p>
            <table class="w-full">
                <thead><tr class="border-b"><th class="text-left py-2">Nr.</th><th class="text-left py-2">Woord</th><th class="text-left py-2">Categorie</th><th class="text-left py-2">Zin</th></tr></thead>
                <tbody>
                    ${words.map((item, index) => `
                        <tr class="border-b">
                            <td class="py-2">${index + 1}.</td>
                            <td class="py-2 font-semibold">${item.woord}</td>
                            <td class="py-2">${item.categorie}</td>
                            <td class="py-2 text-sm">${item.zin.replace(/\[|\]/g, '')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        worksheetOutput.innerHTML = `
            <div class="printable-area bg-white p-6 md:p-10 rounded-2xl shadow-lg max-w-4xl mx-auto">
                <div class="no-print mb-6 flex justify-end items-center gap-4">
                     <div class="flex items-center">
                         <input type="checkbox" id="include-answers" checked class="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"/>
                         <label for="include-answers" class="ml-2 block text-sm text-gray-900">Antwoordenblad toevoegen</label>
                     </div>
                    <button onclick="printWorksheet()" class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105">
                        <i class="fas fa-print mr-2"></i> Printen
                    </button>
                    <button id="generate-story-btn" onclick="generateStory()" class="bg-purple-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105">
                        ✨ Maak een Verhaal
                    </button>
                </div>
                
                <div class="prose max-w-none">${studentSheetHTML}</div>
                <div id="answer-sheet" class="prose max-w-none page-break mt-12">${answerSheetHTML}</div>

                <div id="story-container" class="prose max-w-none mt-12 no-print"></div>
            </div>
        `;
        currentWorksheetWords = words;
    }

    window.generateStory = async function() {
        const storyBtn = document.getElementById('generate-story-btn');
        const storyContainer = document.getElementById('story-container');
        if (!storyBtn || !storyContainer) return;

        storyBtn.disabled = true;
        storyBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Verhaal wordt gemaakt...`;
        storyContainer.innerHTML = `<h3 class="text-2xl font-bold mb-4">✨ Jouw unieke verhaal!</h3><div id="story-output" class="p-4 bg-purple-50 rounded-lg border border-purple-200 min-h-[100px]"><p>Een momentje, de woorden-elfjes zijn druk aan het schrijven...</p></div>`;

        try {
            const wordList = currentWorksheetWords.map(item => item.woord);
            if (wordList.length === 0) throw new Error("Geen woorden om een verhaal te maken.");
            
            const groupDisplay = currentGroup === '7' ? '7 of 8' : currentGroup;
            const userQueryForStory = `Schrijf een heel kort, grappig en eenvoudig verhaaltje in het Nederlands voor een kind in groep ${groupDisplay}. Het verhaal moet de volgende woorden bevatten: ${wordList.join(', ')}. Maak de woorden uit de lijst dikgedrukt in de tekst door ze te omringen met **. Zorg ervoor dat het verhaal logisch en makkelijk te lezen is.`;
            const systemPromptForStory = `Je bent een creatieve kinderboekenschrijver. Schrijf een kort, positief en grappig verhaal.`;
            
            const storyText = await callGeminiAPI(userQueryForStory, systemPromptForStory);
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

    window.speak = function(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'nl-NL';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } else {
            showNotification("Sorry, je browser ondersteunt de voorleesfunctie niet.", true);
        }
    }

    window.printWorksheet = function() {
        const includeAnswers = document.getElementById('include-answers').checked;
        document.body.classList.toggle('print-answers', includeAnswers);
        window.print();
    }
});

