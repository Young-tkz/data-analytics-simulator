import fs from "fs";
import path from "path";

function readFile(filename) {
    const filePath = path.join(process.cwd(), "data", filename);
    return fs.readFileSync(filePath, "utf-8");
}

function parseTopics(text) {
    const lines = text.split(/\r?\n/);
    const topics = [];
    let currentTopic = null;
    let content = [];

    for (const line of lines) {
        const match = line.match(/^TOPIC\s+(\d+)\s+[—-]\s+(.+)$/i);

        if (match) {
            if (currentTopic) {
                const fullContent = content.join("\n").trim();
                topics.push({
                    number: currentTopic.number,
                    title: currentTopic.title,
                    content: fullContent,
                    subSections: parseSubSections(fullContent),
                    mcqs: [],
                    qnsBank: []
                });
            }

            currentTopic = {
                number: Number(match[1]),
                title: match[2].trim(),
            };

            content = [];
            continue;
        }

        if (currentTopic) {
            if (!line.startsWith("===") && !line.startsWith("---")) {
                content.push(line);
            }
        }
    }

    if (currentTopic) {
        const fullContent = content.join("\n").trim();
        topics.push({
            number: currentTopic.number,
            title: currentTopic.title,
            content: fullContent,
            subSections: parseSubSections(fullContent),
            mcqs: [],
            qnsBank: []
        });
    }

    return topics;
}

/**
 * Splits raw topic content into bite-sized sub-sections
 * based on major headings or double line breaks.
 */
function parseSubSections(fullContent) {
    if (!fullContent) return [];

    const sections = fullContent
        .split(/\n\s*\n/)
        .map((sec) => sec.trim())
        .filter((sec) => sec.length > 20);

    return sections.length > 0 ? sections : [fullContent];
}

function parseMCQs(text) {
    const questions = [];
    const blocks = text.split(/\n(?=Q\d+\.)/);

    for (const block of blocks) {
        const match = block.match(
            /Q(\d+)\.\s*(.*?)\r?\nA\.\s*(.*?)\r?\nB\.\s*(.*?)\r?\nC\.\s*(.*?)\r?\nD\.\s*(.*?)\r?\nAnswer:\s*([A-D])/s
        );

        if (!match) continue;

        const options = {
            A: match[3].trim(),
            B: match[4].trim(),
            C: match[5].trim(),
            D: match[6].trim(),
        };
        const answer = match[7].trim();

        questions.push({
            id: Number(match[1]),
            question: match[2].trim(),
            options,
            answer,
            explanation: `Option ${answer} ("${options[answer]}") aligns directly with core topic definitions.`
        });
    }

    return questions;
}

function parseQuestionBank(text) {
    const questions = [];
    const blocks = text.split(/\n(?=Q\d+\.)/);

    for (const block of blocks) {
        const match = block.match(
            /Q(\d+)\.\s*(.*?)\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\nQ\d+\.|$)/
        );

        if (!match) continue;

        questions.push({
            id: Number(match[1]),
            question: match[2].trim(),
            answer: match[3].trim(),
        });
    }

    return questions;
}

function classifyQuestion(questionText) {
    const q = questionText.toLowerCase();

    // Unit 2 Topics
    if (q.includes("statistic") || q.includes("descriptive") || q.includes("mean") || q.includes("median") || q.includes("mode") || q.includes("dispersion") || q.includes("chart") || q.includes("plot") || q.includes("univariate") || q.includes("bivariate")) {
        return { unit: 2, topic: 1 };
    }
    if (q.includes("outlier") || q.includes("z-score") || q.includes("iqr") || q.includes("standardiz") || q.includes("normaliz")) {
        return { unit: 2, topic: 2 };
    }
    if (q.includes("pattern") || q.includes("trend") || q.includes("association") || q.includes("sequential") || q.includes("cluster") || q.includes("upward") || q.includes("seasonal")) {
        return { unit: 2, topic: 3 };
    }
    if (q.includes("population") || q.includes("sample") || q.includes("hypothesis") || q.includes("probability") || q.includes("correlation") || q.includes("nominal") || q.includes("ordinal") || q.includes("interval") || q.includes("ratio")) {
        return { unit: 2, topic: 4 };
    }

    // Unit 1 Topics
    if (q.includes("preprocess") || q.includes("primary") || q.includes("secondary") || q.includes("collection") || q.includes("survey") || q.includes("interview") || q.includes("missing") || q.includes("duplicate") || q.includes("integration") || q.includes("cleaning")) {
        return { unit: 1, topic: 2 };
    }
    if (q.includes("tool") || q.includes("python") || q.includes(" r ") || q.includes("pandas") || q.includes("hadoop") || q.includes("spark") || q.includes("excel") || q.includes("sql") || q.includes("tableau") || q.includes("power bi") || q.includes("cloud") || q.includes("sas")) {
        return { unit: 1, topic: 3 };
    }

    // Default Unit 1 Topic 1
    return { unit: 1, topic: 1 };
}

export function getAllContent() {
    const units = [
        { unit: 1, title: "Foundations & Tools", topics: parseTopics(readFile("unit1.txt")) },
        { unit: 2, title: "Exploratory Data Analysis", topics: parseTopics(readFile("unit2.txt")) }
    ];

    const rawMCQs = parseMCQs(readFile("mcq.txt"));
    const rawQnsBank = parseQuestionBank(readFile("qnsbank.txt"));

    // Categorize MCQs into their designated topics
    for (const mcq of rawMCQs) {
        const target = classifyQuestion(mcq.question + " " + JSON.stringify(mcq.options));
        const unitObj = units.find((u) => u.unit === target.unit) || units[0];
        const topicObj = unitObj.topics.find((t) => t.number === target.topic) || unitObj.topics[0];
        if (topicObj) topicObj.mcqs.push(mcq);
    }

    // Categorize Question Bank items into their designated topics
    for (const qns of rawQnsBank) {
        const target = classifyQuestion(qns.question + " " + qns.answer);
        const unitObj = units.find((u) => u.unit === target.unit) || units[0];
        const topicObj = unitObj.topics.find((t) => t.number === target.topic) || unitObj.topics[0];
        if (topicObj) topicObj.qnsBank.push(qns);
    }

    // Safety check: ensure every topic has items to practice with
    let mcqCursor = 0;
    let qnsCursor = 0;

    for (const unit of units) {
        for (const topic of unit.topics) {
            if (topic.mcqs.length === 0 && rawMCQs.length > 0) {
                topic.mcqs = rawMCQs.slice(mcqCursor, mcqCursor + 3);
                mcqCursor = (mcqCursor + 3) % rawMCQs.length;
            }
            if (topic.qnsBank.length === 0 && rawQnsBank.length > 0) {
                topic.qnsBank = rawQnsBank.slice(qnsCursor, qnsCursor + 2);
                qnsCursor = (qnsCursor + 2) % rawQnsBank.length;
            }
        }
    }

    return { units };
}