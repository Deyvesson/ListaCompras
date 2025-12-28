// Lógica de serviço da API Gemini
// Este arquivo é JavaScript puro (ES Module) e pode ser importado pelo navegador

export const categorizeGroceryItems = async (itemNames) => {
  // Acessa a variável global definida no index.html
  const apiKey = window.process?.env?.API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.warn("API Key is missing or default. Skipping AI categorization.");
    // Removido o alert para não interromper o fluxo de digitação rápida
    return {};
  }

  if (itemNames.length === 0) return {};

  try {
    // Utilizando o modelo solicitado: gemma-3-27b-it
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;
    
    const systemInstruction = `
      Categorize the following grocery items into standard categories (e.g., Hortifruti, Laticínios, Carnes, Limpeza, Padaria, Bebidas, Mercearia, Higiene, Outros).
      
      Return JSON only.
      Format: { "items": [{ "name": "Item Name", "category": "Category Name" }] }
    `;
    
    const userPrompt = `Items: ${itemNames.join(', ')}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "model",
            parts: [{ text: systemInstruction }]
          },
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) return {};
    
    // Clean potential markdown blocks
    const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    
    const mapping = {};
    
    if (parsed.items && Array.isArray(parsed.items)) {
        parsed.items.forEach((item) => {
            if (item.name && item.category) {
                mapping[item.name] = item.category;
            }
        });
    }

    return mapping;
  } catch (error) {
    console.error("Failed to categorize items:", error);
    // Retorna vazio em vez de alertar para não atrapalhar a UX de adição rápida
    return {};
  }
};