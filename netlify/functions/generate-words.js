// Importeren van de node-fetch bibliotheek, die we in package.json hebben gespecificeerd.
const fetch = require('node-fetch');

// Dit is de 'handler' functie. Netlify roept deze functie aan wanneer de endpoint wordt benaderd.
exports.handler = async (event) => {
  // We staan alleen POST-requests toe.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Haal de Gemini API-sleutel op uit de environment variables die we in Netlify hebben ingesteld.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is niet geconfigureerd in Netlify.');
    }

    // Haal de prompt en de query uit de body van het request dat vanuit script.js wordt gestuurd.
    const body = JSON.parse(event.body);
    const systemPrompt = body.prompt;
    const userQuery = body.query;

    if (!systemPrompt || !userQuery) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Prompt of query ontbreekt in de request body.' }) };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    // Stel de payload samen voor de Gemini API.
    const payload = {
      contents: [{
        parts: [{ text: userQuery }]
      }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    };

    // Roep de Gemini API aan met de payload.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Controleer of de API-aanroep succesvol was.
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`Gemini API request mislukt met status ${response.status}`);
    }

    const data = await response.json();
    
    // Stuur het antwoord van de Gemini API terug naar de browser (naar script.js).
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

  } catch (error) {
    // Als er iets misgaat, log de fout en stuur een 500-error terug.
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

