import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data");

export function getUnitTopics(unitNumber) {
    const filePath = path.join(dataPath, `unit${unitNumber}.txt`);

    const content = fs.readFileSync(filePath, "utf-8");

    const topicBlocks = content.split(/={10,}/);

    const topics = [];

    for (const block of topicBlocks) {
        const match = block.match(/TOPIC\s+\d+\s*[—-]\s*(.+)/i);

        if (!match) continue;

        const title = match[1].trim();

        const topicContent = block
            .replace(/TOPIC\s+\d+\s*[—-]\s*.+/i, "")
            .trim();

        topics.push({
            title,
            content: topicContent,
        });
    }

    return topics;
}


export function getMCQs() {
    const filePath = path.join(dataPath, "mcq.txt");

    const content = fs.readFileSync(filePath, "utf-8");

    const questions = [];

    const blocks = content.split(/\n(?=Q\d+\.)/);

    for (const block of blocks) {
        const questionMatch = block.match(
            /Q(\d+)\.\s*(.+?)(?=\nA\.)/s
        );

        if (!questionMatch) continue;

        const number = Number(questionMatch[1]);
        const question = questionMatch[2].trim();

        const options = {
            A: extractOption(block, "A"),
            B: extractOption(block, "B"),
            C: extractOption(block, "C"),
            D: extractOption(block, "D"),
        };

        const answerMatch = block.match(
            /Answer:\s*([A-D])/i
        );

        const answer = answerMatch
            ? answerMatch[1].toUpperCase()
            : null;

        questions.push({
            id: number,
            question,
            options,
            answer,
        });
    }

    return questions;
}


function extractOption(block, letter) {
    const regex = new RegExp(
        `\\n${letter}\\.\\s*(.+?)(?=\\n[A-D]\\. |\\nAnswer:|$)`,
        "s"
    );

    const match = block.match(regex);

    return match ? match[1].trim() : "";
}


export function getQuestionBank() {
    const filePath = path.join(dataPath, "qnsbank.txt");

    const content = fs.readFileSync(filePath, "utf-8");

    const questions = [];

    const matches = [
        ...content.matchAll(
            /Q(\d+)\.\s*(.+?)(?:\r?\n\r?\n)([\s\S]*?)(?=\r?\n\r?\nQ\d+\.|$)/g
        ),
    ];

    for (const match of matches) {
        questions.push({
            id: Number(match[1]),
            question: match[2].trim(),
            answer: match[3].trim(),
        });
    }

    return questions;
}