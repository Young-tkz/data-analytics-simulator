"use client";

export default function UnitCard({ unit, isSelected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "10px 18px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "0.95rem",
                background: isSelected ? "linear-gradient(135deg, #0070f3 0%, #0051a8 100%)" : "#ffffff",
                color: isSelected ? "#ffffff" : "#4a5568",
                border: isSelected ? "1px solid #0070f3" : "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: isSelected ? "0 4px 12px rgba(0, 112, 243, 0.25)" : "0 1px 3px rgba(0,0,0,0.05)",
                transform: isSelected ? "translateY(-1px)" : "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
        >
            UNIT {unit.unit}
        </button>
    );
}