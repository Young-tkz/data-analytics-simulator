import { NextResponse } from "next/server";
import { generateExplanation } from "../../../lib/ai";
import { generateRealWorldExample } from "../../../lib/realWorldAi";

export async function POST(req) {
    try {
        const body = await req.json();
        const { type, ...data } = body;

        if (type === "explain") {
            const explanation = await generateExplanation(data);
            return NextResponse.json({ explanation });
        }

        if (type === "realworld") {
            const example = await generateRealWorldExample(data);
            return NextResponse.json({ example });
        }

        return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
    } catch (error) {
        console.error("API AI Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}