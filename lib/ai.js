// lib/ai.js
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

/**
 * Generates an on-demand deeper conceptual explanation for a specific MCQ.
 */
export async function generateExplanation({ question, options, studentAnswer, correctAnswer, baseExplanation }) {
    if (!groq) {
        return baseExplanation;
    }

    const prompt = `
You are a sharp, patient data analytics tutor.
Explain why an answer choice is correct or incorrect to give the student a deeper conceptual understanding.

Question: ${question}
Options: ${JSON.stringify(options)}
Student's Selected Choice: ${studentAnswer}
Correct Answer: ${correctAnswer}
Base Explanation: ${baseExplanation}

Provide a concise, 2-3 sentence deeper explanation. Focus on WHY the correct answer is right conceptually, and briefly clarify any misconception if an incorrect option was selected.
`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL
        });

        return response.choices[0]?.message?.content?.trim();
    } catch (error) {
        console.error("Groq Explanation Error:", error);
        return baseExplanation;
    }
}
