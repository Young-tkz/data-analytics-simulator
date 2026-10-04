"use client";

export default function Question({ question, options, selectedAnswer, showResult, onSelectAnswer }) {
    return (
        <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
            <h2 style={{ fontSize: "1.25rem", lineHeight: "1.5", color: "#1a202c", marginBottom: "20px" }}>
                {question}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(options).map(([letter, text]) => {
                    let btnBg = "#ffffff";
                    let borderColor = "#e2e8f0";
                    let textColor = "#2d3748";

                    if (showResult) {
                        if (letter === question.answer || letter === options.correctAnswer) {
                            btnBg = "#f0fff4";
                            borderColor = "#38a169";
                            textColor = "#22543d";
                        } else if (selectedAnswer === letter) {
                            btnBg = "#fff5f5";
                            borderColor = "#e53e3e";
                            textColor = "#742a2a";
                        }
                    } else if (selectedAnswer === letter) {
                        btnBg = "#ebf8ff";
                        borderColor = "#3182ce";
                    }

                    return (
                        <button
                            key={letter}
                            onClick={() => onSelectAnswer(letter)}
                            disabled={showResult}
                            style={{
                                padding: "16px 20px",
                                textAlign: "left",
                                cursor: showResult ? "default" : "pointer",
                                background: btnBg,
                                color: textColor,
                                border: `2px solid ${borderColor}`,
                                borderRadius: "10px",
                                fontSize: "1rem",
                                fontWeight: "500",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <strong style={{ opacity: 0.8, marginRight: "8px" }}>{letter}.</strong> {text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}