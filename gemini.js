// Lógica de serviço para chamada da Azure Function (proxy de IA)
// Este arquivo é JavaScript puro (ES Module) e pode ser importado pelo navegador

export const categorizeGroceryItems = async (itemNames) => {
  const functionUrl = window.appConfig?.aiFunctionUrl;

  if (!functionUrl || functionUrl.includes('YOUR_FUNCTION_APP')) {
    console.warn("AI function URL is missing or default. Skipping AI categorization.");
    return {};
  }

  if (itemNames.length === 0) return {};

  try {
    const systemInstruction = `
      Categorize the following grocery items into standard categories (e.g., Hortifruti, Laticínios, Carnes, Limpeza, Padaria, Bebidas, Mercearia, Higiene, Outros).
      
      Return JSON only.
      Format: { "items": [{ "name": "Item Name", "category": "Category Name" }] }
    `;
    
    const userPrompt = `Items: ${itemNames.join(', ')}`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction,
        userPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.resultText;

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