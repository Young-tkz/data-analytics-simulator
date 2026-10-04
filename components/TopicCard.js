"use client";

export default function TopicCard({ topic, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: "20px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                cursor: "pointer",
                background: "#ffffff",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
                e.currentTarget.style.borderColor = "#bee3f8";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.borderColor = "#e2e8f0";
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, color: "#0070f3", fontSize: "1.1rem", fontWeight: "600" }}>
                    📖 Topic {topic.number}: {topic.title}
                </h4>
                <span style={{ fontSize: "1.2rem", color: "#a0aec0" }}>→</span>
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "0.85rem", color: "#718096" }}>
                <span>• {topic.subSections.length} Sub-concepts</span>
                <span>• {topic.mcqs.length} MCQs</span>
                <span>• {topic.qnsBank.length} Exam Questions</span>
            </div>
        </div>
    );
}