// ===================================================================================
// MAIN.JS - De 'motor' van de applicatie
// Dit bestand bevat de interactieve logica, AI-communicatie en event listeners.
// ===================================================================================

let currentWorksheetData = {};
// ... bestaande code ...
document.addEventListener('DOMContentLoaded', () => {
    // Stijlen voor printen toevoegen (compacter)
    const style = document.createElement('style');
// ... bestaande code ...
    const generateBtnContainer = document.getElementById('generate-button-container');
    const generateBtn = document.getElementById('generate-btn');
    const historyListContainer = document.getElementById('history-list');
// ... bestaande code ...
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
// ... bestaande code ...
    // Event listener voor groep-knoppen
    groupButtonsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('group-btn')) {
// ... bestaande code ...
            displayCategories(currentGroup);
            categorySelection.classList.remove('hidden');
            generateBtnContainer.classList.remove('hidden');
            document.getElementById('worksheet-output').innerHTML = ''; // Maak vorig werkblad leeg
        }
    });

    // Categorieën weergeven op basis van groep
// ... bestaande code ...
    // --- Einde Geschiedenis Functies ---


    // Functies die globaal beschikbaar moeten zijn (voor knoppen in de HTML)
// ... bestaande code ...
    // Init
    // Stel de standaardkleuren in voor knoppen die niet door JS worden gegenereerd
    document.getElementById('generate-btn').style.backgroundColor = COLORS.orange;
// ... bestaande code ...
    document.getElementById('clear-history-btn').style.backgroundColor = COLORS.slate;
    document.querySelector('.text-blue-600').style.color = COLORS.blue;
    document.querySelector('.border-blue-600').style.borderColor = COLORS.blue;
    
});

