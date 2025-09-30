type GenerateOpts = {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
};

type GeminiPart = { text?: string };
type GeminiContent = { parts?: GeminiPart[] };
type GeminiCandidate = { content?: GeminiContent };
type GeminiResponse = { candidates?: GeminiCandidate[] };

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-1.5-pro";
const API_KEY = process.env.GEMINI_API_KEY;

export async function generateWithGemini({
  system,
  user,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  maxOutputTokens = 2048,
}: GenerateOpts): Promise<string> {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const payload = {
    contents: [{ role: "user", parts: [{ text: `${system}\n\n===\n\n${user}` }] }],
    generationConfig: { temperature, maxOutputTokens },
  };

  const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = (data.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("");

  return sanitizePlainText(text);
}

export function sanitizePlainText(input: string): string {
  return String(input)
    .replace(/[*_`>#-]{2,}/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
