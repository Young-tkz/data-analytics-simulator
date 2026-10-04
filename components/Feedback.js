"use client";

export default function Feedback({ isCorrect, correctAnswer, explanation, aiExplanation, loadingExplanation, fetchDeeperExplanation }) {
    return (
        <div
            style={{
                marginTop: "25px",
                padding: "20px",
                borderRadius: "12px",
                background: isCorrect ? "#f0fff4" : "#fff5f5",
                border: `1px solid ${isCorrect ? "#9ae6b4" : "#feb2b2"}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
        >
            {isCorrect ? (
                <h3 style={{ margin: "0 0 10px 0", color: "#2f855a", fontSize: "1.1rem" }}>✓ Correct Answer!</h3>
            ) : (
                <div style={{ marginBottom: "10px" }}>
                    <h3 style={{ margin: "0 0 5px 0", color: "#c53030", fontSize: "1.1rem" }}>✗ Incorrect</h3>
                    <p style={{ margin: 0, color: "#742a2a", fontSize: "0.95rem" }}>
                        Correct option: <strong>{correctAnswer}</strong>
                    </p>
                </div>
            )}

            <div style={{ marginTop: "12px", fontSize: "0.95rem", color: "#2d3748", lineHeight: "1.5" }}>
                <strong>Explanation:</strong>
                <p style={{ margin: "4px 0 0 0" }}>{explanation}</p>
            </div>

            {/* AI Explanation Section */}
            <div style={{ marginTop: "16px" }}>
                {!aiExplanation ? (
                    <button
                        onClick={fetchDeeperExplanation}
                        disabled={loadingExplanation}
                        style={{
                            padding: "9px 18px",
                            background: loadingExplanation ? "#cbd5e0" : "linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: loadingExplanation ? "default" : "pointer",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            boxShadow: "0 2px 6px rgba(128, 90, 213, 0.3)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        {loadingExplanation ? "🤖 Generating Groq AI Insight..." : "🤖 Get Deeper AI Explanation"}
                    </button>
                ) : (
                    <div style={{ padding: "14px", background: "#faf5ff", border: "1px solid #e9d8fd", borderRadius: "8px" }}>
                        <strong style={{ color: "#553c9a", fontSize: "0.9rem" }}>🤖 Deeper AI Insight (Groq):</strong>
                        <p style={{ margin: "6px 0 0 0", color: "#2d3748", fontSize: "0.95rem", lineHeight: "1.5" }}>
                            {aiExplanation}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}