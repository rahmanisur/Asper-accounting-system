import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for AI invoice generation
app.post("/api/gemini/generate-invoice", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "A valid prompt is required." });
    return;
  }

  const currentDate = new Date().toISOString().split("T")[0];

  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are an expert bookkeeping AI assistant. 
Extract structured invoice details from the user's natural language request. 
The current date is ${currentDate}. If dates are relative (e.g., "by today", "next month", "due in 30 days"), calculate them relative to this current date.
Always assign a reasonable, random 5-6 digit invoice number (e.g. "INV-10294") if none is specified.
If fields like clientCompany, notes, clientEmail, taxRate, or discount are not mentioned, provide logical fallbacks or use default values (e.g. 0 for rates/discounts).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["clientName", "clientEmail", "invoiceNumber", "issueDate", "dueDate", "items"],
          properties: {
            clientName: {
              type: Type.STRING,
              description: "The name of the client.",
            },
            clientEmail: {
              type: Type.STRING,
              description: "The email of the client. Make up one if not provided based on their name.",
            },
            clientCompany: {
              type: Type.STRING,
              description: "The client company name, if applicable or inferred.",
            },
            invoiceNumber: {
              type: Type.STRING,
              description: "The serial invoice identifier (e.g. INV-23849).",
            },
            issueDate: {
              type: Type.STRING,
              description: "In YYYY-MM-DD format. Default to today's date if not specified.",
            },
            dueDate: {
              type: Type.STRING,
              description: "In YYYY-MM-DD format. Default to 30 days from issue if not specified.",
            },
            items: {
              type: Type.ARRAY,
              description: "List of billable items extracted from prompt.",
              items: {
                type: Type.OBJECT,
                required: ["description", "quantity", "unitPrice"],
                properties: {
                  description: {
                    type: Type.STRING,
                    description: "Details of work done or product sold.",
                  },
                  quantity: {
                    type: Type.NUMBER,
                    description: "Number of units, hours, or items.",
                  },
                  unitPrice: {
                    type: Type.NUMBER,
                    description: "The cost per single unit/hour.",
                  },
                },
              },
            },
            taxRate: {
              type: Type.NUMBER,
              description: "The tax rate as an integer percentage, e.g. 10. Default to 0 if not stated.",
            },
            discount: {
              type: Type.NUMBER,
              description: "Dollar discount on the overall total. Default to 0 if not stated.",
            },
            notes: {
              type: Type.STRING,
              description: "Optional notes, terms, thank you message or additional information extracted.",
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No structured output received from Gemini.");
    }

    const payload = JSON.parse(text);
    res.json(payload);
  } catch (error: any) {
    console.error("Gemini invocation error:", error);
    res.status(500).json({
      error: "Failed to generate invoice with AI.",
      details: error.message || String(error),
    });
  }
});

// Configure Vite middleware / static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
