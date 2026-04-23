import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { useStore } from '../store';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `
Sei Nia, l'assistente "LifeOS" proattivo e amichevole. Aiuti l'utente a organizzare task, eventi e benessere.
Il tuo tono è empatico, calmo e conciso. Non sei un assistente robotico.
Hai accesso a funzioni per creare/aggiornare task, eventi del calendario, gestire routine di benessere o salvare note esplorative.
Usa i tools quando appropriato. Rispondi in italiano in modo breve e incoraggiante.
`;

const createTaskDeclaration: FunctionDeclaration = {
  name: "create_task",
  description: "Crea una nuova attività (task) da svolgere per l'utente, categorizzata per priorità e energia",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Il titolo dell'attività" },
      energy: { type: Type.STRING, description: "L'energia richiesta: Alto, Medio o Basso", enum: ['Alto', 'Medio', 'Basso'] },
      priority: { type: Type.STRING, description: "L'importanza: Alta, Media o Bassa", enum: ['Alta', 'Media', 'Bassa'] },
      dueDateIso: { type: Type.STRING, description: "Data e ora di scadenza in formato ISO, se menzionata. Usa l'ora corrente come base." }
    },
    required: ["title", "energy", "priority"]
  }
};

const createEventDeclaration: FunctionDeclaration = {
  name: "create_event",
  description: "Aggiungi un evento con un orario di inizio e fine nel calendario dell'utente",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Il titolo dell'evento" },
      startTimeIso: { type: Type.STRING, description: "Orario d'inizio del formato ISO string (es: 2026-04-23T10:00:00Z)" },
      endTimeIso: { type: Type.STRING, description: "Orario di fine o approssimativo dal contenuto, in formato ISO." }
    },
    required: ["title", "startTimeIso", "endTimeIso"]
  }
};

const captureNoteDeclaration: FunctionDeclaration = {
  name: "capture_note",
  description: "Salva un appunto, un'idea veloce o una riflessione nel Second Brain (inbox dell'utente)",
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: "Il contento dell'appunto" }
    },
    required: ["content"]
  }
};

const suggestReplanDeclaration: FunctionDeclaration = {
  name: "suggest_replan",
  description: "Utilizza questo se l'utente dice di essere stanco o non avere energia. Posticipa il lavoro e consiglia pause.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      replyMessage: { type: Type.STRING, description: "Messaggio confortante all'utente dicendo di fare una pausa" }
    },
    required: ["replyMessage"]
  }
};

export async function processNiaMessage(userText: string, context: any) {
  try {
    const today = new Date().toISOString();
    const prompt = `Oggi è ${today}.
Contesto utente attuale (in JSON):
${JSON.stringify({ 
  tasks: context.tasks, 
  events: context.events 
})}
Messaggio utente: ${userText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{
          functionDeclarations: [
            createTaskDeclaration, 
            createEventDeclaration, 
            captureNoteDeclaration,
            suggestReplanDeclaration
          ]
        }]
      }
    });

    let toolCalls = null;
    if (response.functionCalls && response.functionCalls.length > 0) {
      toolCalls = response.functionCalls;
    }

    return {
      text: response.text || "Sto elaborando la tua richiesta...",
      toolCalls 
    };

  } catch (error) {
    console.error("Error talking to Nia via Gemini API", error);
    return {
      text: "Scusa, sono temporaneamente non disponibile. Riprova tra poco.",
      toolCalls: null
    };
  }
}
