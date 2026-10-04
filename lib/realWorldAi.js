import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export async function generateRealWorldExample({ conceptTitle, conceptContent, company }) {
    if (!groq) {
        return `When ${company} uses this concept, they track live user data signals to spot trends without crashing their systems.`;
    }

    const prompt = `
You are a chill, sharp tech tutor. Explain how the following data analytics concept applies in real life to ${company}.

Concept Title: ${conceptTitle}
Concept Content: ${conceptContent.slice(0, 400)}...

Rules:
1. Speak in super plain, direct, real-talk English (casual and punchy, zero corporate jargon, no fluff).
2. Keep it strictly to 2 short sentences.
3. Show a concrete example of what actually happens when ${company} uses or ignores this concept.
`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL
        });

        return response.choices[0]?.message?.content?.trim();
    } catch (error) {
        console.error("Real-World Example Error:", error);
        return `When ${company} uses this concept, it helps them process live user signals faster.`;
    }
}