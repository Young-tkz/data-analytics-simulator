"use client";

import { useState } from "react";
import UnitCard from "../components/UnitCard";
import TopicCard from "../components/TopicCard";
import Question from "../components/Question";
import Feedback from "../components/Feedback";

export default function Quiz({ units }) {
    const [unitIndex, setUnitIndex] = useState(0);
    const [topicIndex, setTopicIndex] = useState(null);

    // Modes: "lesson" | "mcqs" | "qnsbank" | "complete"
    const [mode, setMode] = useState("lesson");
    const [subIndex, setSubIndex] = useState(0);

    // Real-World Contextualizer State
    const [activeCompany, setActiveCompany] = useState(null);
    const [companyExample, setCompanyExample] = useState(null);
    const [loadingCompanyExample, setLoadingCompanyExample] = useState(false);

    // MCQ & Score State
    const [mcqIndex, setMcqIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);

    // AI Explanation State
    const [aiExplanation, setAiExplanation] = useState(null);
    const [loadingExplanation, setLoadingExplanation] = useState(false);

    // Question Bank State
    const [qnsBankIndex, setQnsBankIndex] = useState(0);
    const [showBankAnswer, setShowBankAnswer] = useState(false);

    // Money Clink & Crowd Aww / Game Buzzer Sound Effects
    function playSound(type) {
        if (typeof window === "undefined") return;

        try {
            if (type === "correct") {
                // Money / Coin Cha-Ching Sound
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
                audio.volume = 0.4;
                audio.play().catch(() => playSyntheticMoneySound());
            } else if (type === "wrong") {
                // Disappointed Crowd / Game Buzzer Sound
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3");
                audio.volume = 0.4;
                audio.play().catch(() => playSyntheticBuzzerSound());
            } else if (type === "click") {
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
                audio.volume = 0.25;
                audio.play().catch(() => {});
            }
        } catch (e) {
            // Audio context unsupported
        }
    }

    function playSyntheticMoneySound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.frequency.setValueAtTime(987.77, ctx.currentTime);
            osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

            osc1.start();
            osc2.start(ctx.currentTime + 0.08);
            osc1.stop(ctx.currentTime + 0.35);
            osc2.stop(ctx.currentTime + 0.35);
        } catch (e) {}
    }

    function playSyntheticBuzzerSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.setValueAtTime(110, ctx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {}
    }

    if (!units || units.length === 0) {
        return <main style={{ padding: "20px", fontFamily: "sans-serif" }}>No units found.</main>;
    }

    const currentUnit = units[unitIndex];
    const currentTopic = topicIndex !== null ? currentUnit?.topics?.[topicIndex] : null;

    const subSections = currentTopic?.subSections || (currentTopic?.content ? [currentTopic.content] : []);
    const currentSubContent = subSections[subIndex] || currentTopic?.content;

    const topicMCQs = currentTopic?.mcqs || [];
    const topicQnsBank = currentTopic?.qnsBank || [];

    const currentMCQ = topicMCQs[mcqIndex];
    const currentQnsBank = topicQnsBank[qnsBankIndex];

    const totalAnswered = correctCount + wrongCount;
    const scorePercentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    function selectTopic(idx) {
        playSound("click");
        setTopicIndex(idx);
        setSubIndex(0);
        setMode("lesson");
        setMcqIndex(0);
        setQnsBankIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setAiExplanation(null);
        setShowBankAnswer(false);
        setCorrectCount(0);
        setWrongCount(0);
        setActiveCompany(null);
        setCompanyExample(null);
    }

    function handleNextSubSection() {
        playSound("click");
        setActiveCompany(null);
        setCompanyExample(null);

        if (subIndex < subSections.length - 1) {
            setSubIndex(subIndex + 1);
        } else {
            if (topicMCQs.length > 0) {
                setMode("mcqs");
                setMcqIndex(0);
            } else if (topicQnsBank.length > 0) {
                setMode("qnsbank");
                setQnsBankIndex(0);
            } else {
                setMode("complete");
            }
        }
    }

    async function fetchRealWorldExample(companyName) {
        if (loadingCompanyExample) return;
        playSound("click");

        setActiveCompany(companyName);
        setLoadingCompanyExample(true);
        setCompanyExample(null);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "realworld",
                    conceptTitle: currentTopic?.title || "Data Analytics",
                    conceptContent: currentSubContent || "",
                    company: companyName
                })
            });

            const data = await res.json();
            setCompanyExample(data?.example || "Unable to fetch example right now.");
        } catch (e) {
            console.error("Failed to fetch real-world example:", e);
            setCompanyExample("Could not connect to AI service.");
        } finally {
            setLoadingCompanyExample(false);
        }
    }

    function handleSelectMCQAnswer(letter) {
        if (showResult) return;
        setSelectedAnswer(letter);
        setShowResult(true);

        if (letter === currentMCQ.answer) {
            playSound("correct");
            setCorrectCount((prev) => prev + 1);
        } else {
            playSound("wrong");
            setWrongCount((prev) => prev + 1);
        }
    }

    async function fetchDeeperExplanation() {
        if (!currentMCQ || loadingExplanation) return;
        playSound("click");

        setLoadingExplanation(true);
        setAiExplanation(null);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "explain",
                    question: currentMCQ.question,
                    options: currentMCQ.options,
                    studentAnswer: selectedAnswer,
                    correctAnswer: currentMCQ.answer,
                    baseExplanation: currentMCQ.explanation
                })
            });

            const data = await res.json();
            setAiExplanation(data?.explanation || currentMCQ.explanation);
        } catch (e) {
            console.error("Failed to fetch deeper explanation:", e);
            setAiExplanation("Unable to generate deeper AI explanation at this moment.");
        } finally {
            setLoadingExplanation(false);
        }
    }

    function handleNextMCQ() {
        playSound("click");
        setSelectedAnswer(null);
        setShowResult(false);
        setAiExplanation(null);

        if (mcqIndex < topicMCQs.length - 1) {
            setMcqIndex(mcqIndex + 1);
        } else {
            if (topicQnsBank.length > 0) {
                setMode("qnsbank");
                setQnsBankIndex(0);
            } else {
                setMode("complete");
            }
        }
    }

    function handleNextQnsBank() {
        playSound("click");
        setShowBankAnswer(false);
        if (qnsBankIndex < topicQnsBank.length - 1) {
            setQnsBankIndex(qnsBankIndex + 1);
        } else {
            setMode("complete");
        }
    }

    return (
        <main className="quiz-container">
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .quiz-container {
                    max-width: 850px;
                    margin: 30px auto;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 0 16px;
                }

                .unit-header-nav {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }

                .company-chip-grid {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 12px;
                }

                .action-btn-primary {
                    width: 100%;
                    max-width: 320px;
                    padding: 14px 24px;
                    background: #0070f3;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 1rem;
                    box-shadow: 0 4px 12px rgba(0,112,243,0.2);
                    transition: transform 0.15s ease;
                }

                .action-btn-primary:active {
                    transform: scale(0.98);
                }

                @media (max-width: 600px) {
                    .quiz-container {
                        margin: 15px auto;
                        padding: 0 12px;
                    }
                    .unit-header-title {
                        font-size: 1.4rem !important;
                    }
                    .scoreboard-bar {
                        flex-direction: column;
                        gap: 6px !important;
                    }
                    .action-btn-primary {
                        max-width: 100%;
                    }
                }
            `}</style>

            {/* HEADER & UNIT NAVIGATION */}
            <header style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "24px" }}>
                <div className="unit-header-nav">
                    {units.map((u, i) => (
                        <UnitCard
                            key={u.unit}
                            unit={u}
                            isSelected={unitIndex === i}
                            onClick={() => {
                                playSound("click");
                                setUnitIndex(i);
                                setTopicIndex(null);
                            }}
                        />
                    ))}
                </div>
                <h1 className="unit-header-title" style={{ margin: 0, fontSize: "1.75rem", color: "#1a202c", fontWeight: "800", letterSpacing: "-0.02em" }}>
                    Unit {currentUnit.unit}: {currentUnit.title}
                </h1>
            </header>

            {/* SCREEN 1: TOPIC SELECTION GRID */}
            {topicIndex === null && (
                <section style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <h3 style={{ color: "#4a5568", fontSize: "1.1rem", marginBottom: "16px", fontWeight: "600" }}>
                        Select a Topic to Start:
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {currentUnit.topics.map((t, idx) => (
                            <TopicCard key={t.number} topic={t} onClick={() => selectTopic(idx)} />
                        ))}
                    </div>
                </section>
            )}

            {/* STEP 1: LESSON FLOW + REAL-WORLD CONTEXTUALIZER */}
            {topicIndex !== null && mode === "lesson" && (
                <section style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <span style={{ fontWeight: "700", color: "#0070f3", fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Part {subIndex + 1} of {Math.max(1, subSections.length)} — {currentTopic.title}
                        </span>
                        <button
                            onClick={() => { playSound("click"); setTopicIndex(null); }}
                            style={{ cursor: "pointer", padding: "6px 12px", border: "1px solid #cbd5e0", borderRadius: "6px", background: "#fff", color: "#4a5568", fontSize: "0.85rem" }}
                        >
                            ← Topics Menu
                        </button>
                    </div>

                    {/* PROGRESS BAR */}
                    <div style={{ width: "100%", height: "6px", background: "#edf2f7", borderRadius: "3px", marginBottom: "20px", overflow: "hidden" }}>
                        <div style={{ width: `${((subIndex + 1) / subSections.length) * 100}%`, height: "100%", background: "#0070f3", transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                    </div>

                    {/* SUB-CONCEPT CONTENT */}
                    <div style={{ whiteSpace: "pre-wrap", padding: "20px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", lineHeight: "1.7", fontSize: "1rem", color: "#2d3748", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        {currentSubContent}
                    </div>

                    {/* REAL-WORLD CONTEXTUALIZER CARD */}
                    <div style={{ marginTop: "18px", padding: "16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#4a5568", fontSize: "0.95rem" }}>
                            🌐 See How It's Applied in Real Life:
                        </h4>

                        <div className="company-chip-grid">
                            {["📺 YouTube", "📦 Amazon", "🎬 Netflix", "📈 Forex / Crypto"].map((comp) => (
                                <button
                                    key={comp}
                                    onClick={() => fetchRealWorldExample(comp)}
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "20px",
                                        border: activeCompany === comp ? "1px solid #3182ce" : "1px solid #cbd5e0",
                                        background: activeCompany === comp ? "#ebf8ff" : "#ffffff",
                                        color: activeCompany === comp ? "#2b6cb0" : "#4a5568",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "0.85rem",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    {comp}
                                </button>
                            ))}
                        </div>

                        {loadingCompanyExample ? (
                            <p style={{ margin: 0, color: "#805ad5", fontSize: "0.9rem" }}>🤖 Asking AI how {activeCompany} uses this...</p>
                        ) : companyExample ? (
                            <div style={{ background: "#ffffff", padding: "12px 16px", borderLeft: "4px solid #805ad5", borderRadius: "6px", animation: "fadeIn 0.25s ease-out" }}>
                                <p style={{ margin: 0, color: "#2d3748", fontSize: "0.95rem", lineHeight: "1.5" }}>{companyExample}</p>
                                <button
                                    onClick={() => fetchRealWorldExample(activeCompany)}
                                    style={{ marginTop: "8px", border: "none", background: "none", color: "#805ad5", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                                >
                                    🔄 Give Me Another Example
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        <button
                            onClick={handleNextSubSection}
                            className="action-btn-primary"
                        >
                            {subIndex < subSections.length - 1 ? `Next Concept (${subIndex + 2}/${subSections.length}) →` : "Start Topic MCQs →"}
                        </button>
                    </div>
                </section>
            )}

            {/* STEP 2: TOPIC MCQs */}
            {topicIndex !== null && mode === "mcqs" && (
                <section style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontWeight: "700", color: "#2b6cb0", fontSize: "0.9rem" }}>
                            Topic {currentTopic.number} MCQs ({mcqIndex + 1} of {topicMCQs.length})
                        </span>
                        <button onClick={() => { playSound("click"); setTopicIndex(null); }} style={{ cursor: "pointer", border: "none", background: "none", color: "#718096" }}>
                            Topics Menu
                        </button>
                    </div>

                    {/* PROGRESS BAR */}
                    <div style={{ width: "100%", height: "6px", background: "#edf2f7", borderRadius: "3px", marginBottom: "14px", overflow: "hidden" }}>
                        <div style={{ width: `${((mcqIndex + (showResult ? 1 : 0)) / topicMCQs.length) * 100}%`, height: "100%", background: "#38a169", transition: "width 0.4s ease" }} />
                    </div>

                    {/* SCOREBOARD */}
                    <div className="scoreboard-bar" style={{ display: "flex", gap: "16px", background: "#ffffff", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px", fontSize: "0.9rem", color: "#4a5568" }}>
                        <div><strong>Score:</strong> {correctCount}/{topicMCQs.length} ({scorePercentage}%)</div>
                        <div style={{ color: "#38a169" }}><strong>Correct:</strong> {correctCount} 💸</div>
                        <div style={{ color: "#e53e3e" }}><strong>Wrong:</strong> {wrongCount} 🎺</div>
                    </div>

                    {!currentMCQ ? (
                        <div style={{ marginTop: "20px" }}>
                            <p>No MCQs mapped to Topic {currentTopic.number}.</p>
                            <button onClick={() => setMode("qnsbank")} className="action-btn-primary">Go to Question Bank →</button>
                        </div>
                    ) : (
                        <div>
                            <Question
                                question={currentMCQ.question}
                                options={currentMCQ.options}
                                selectedAnswer={selectedAnswer}
                                showResult={showResult}
                                onSelectAnswer={handleSelectMCQAnswer}
                            />

                            {showResult && (
                                <>
                                    <Feedback
                                        isCorrect={selectedAnswer === currentMCQ.answer}
                                        correctAnswer={currentMCQ.answer}
                                        explanation={currentMCQ.explanation}
                                        aiExplanation={aiExplanation}
                                        loadingExplanation={loadingExplanation}
                                        fetchDeeperExplanation={fetchDeeperExplanation}
                                    />

                                    <div style={{ marginTop: "20px" }}>
                                        <button
                                            onClick={handleNextMCQ}
                                            className="action-btn-primary"
                                            style={{ background: "#2b6cb0" }}
                                        >
                                            {mcqIndex < topicMCQs.length - 1 ? "Next Question →" : "Continue to Question Bank →"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* STEP 3: QUESTION BANK */}
            {topicIndex !== null && mode === "qnsbank" && (
                <section style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <span style={{ fontWeight: "700", color: "#805ad5", fontSize: "0.9rem" }}>
                            Topic {currentTopic.number} Exam Questions ({qnsBankIndex + 1} of {topicQnsBank.length})
                        </span>
                        <button onClick={() => { playSound("click"); setTopicIndex(null); }} style={{ cursor: "pointer", border: "none", background: "none", color: "#718096" }}>
                            Topics Menu
                        </button>
                    </div>

                    {!currentQnsBank ? (
                        <div style={{ marginTop: "20px" }}>
                            <p>No exam questions for Topic {currentTopic.number}.</p>
                            <button onClick={() => setMode("complete")} className="action-btn-primary">Finish Topic</button>
                        </div>
                    ) : (
                        <div style={{ marginTop: "10px", border: "1px solid #e9d8fd", borderRadius: "12px", padding: "20px", background: "#faf5ff" }}>
                            <h2 style={{ fontSize: "1.15rem", color: "#44337a", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                                {currentQnsBank.question}
                            </h2>

                            {!showBankAnswer ? (
                                <button
                                    onClick={() => { playSound("click"); setShowBankAnswer(true); }}
                                    style={{ padding: "12px 22px", background: "#6b46c1", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}
                                >
                                    Reveal Model Answer
                                </button>
                            ) : (
                                <div style={{ marginTop: "18px", borderTop: "1px solid #e9d8fd", paddingTop: "18px", animation: "fadeIn 0.3s ease" }}>
                                    <h4 style={{ margin: "0 0 8px 0", color: "#553c9a" }}>Model Answer:</h4>
                                    <div style={{ whiteSpace: "pre-wrap", color: "#2d3748", lineHeight: "1.6", fontSize: "0.98rem" }}>
                                        {currentQnsBank.answer}
                                    </div>

                                    <div style={{ marginTop: "20px" }}>
                                        <button
                                            onClick={handleNextQnsBank}
                                            className="action-btn-primary"
                                            style={{ background: "#2b6cb0" }}
                                        >
                                            {qnsBankIndex < topicQnsBank.length - 1 ? "Next Question →" : "Complete Topic →"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* STEP 4: TOPIC COMPLETE SUMMARY */}
            {topicIndex !== null && mode === "complete" && (
                <section style={{ padding: "28px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                    <h2 style={{ color: "#0070f3", marginTop: 0, fontSize: "1.5rem" }}>🏆 Topic Completed!</h2>
                    <p style={{ color: "#4a5568", marginBottom: "20px", fontSize: "1rem" }}>
                        You completed all sub-concepts, MCQs, and exam questions for <strong>Topic {currentTopic.number}: {currentTopic.title}</strong>.
                    </p>

                    <div style={{ background: "#f7fafc", border: "1px solid #edf2f7", borderRadius: "12px", padding: "18px", marginBottom: "24px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#2d3748" }}>Quiz Performance</h4>
                        <div style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                            Score: {correctCount} / {topicMCQs.length} ({scorePercentage}%)
                        </div>
                        <div style={{ display: "flex", gap: "16px", fontSize: "0.9rem", marginBottom: "14px" }}>
                            <span style={{ color: "#38a169" }}>Correct: {correctCount} 💸</span>
                            <span style={{ color: "#e53e3e" }}>Wrong: {wrongCount} 🎺</span>
                        </div>

                        <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                            <div style={{ width: `${scorePercentage}%`, height: "100%", background: scorePercentage >= 70 ? "#38a169" : "#dd6b20", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                        </div>
                    </div>

                    <button
                        onClick={() => { playSound("click"); setTopicIndex(null); }}
                        className="action-btn-primary"
                    >
                        Return to Topics Menu
                    </button>
                </section>
            )}
        </main>
    );
}