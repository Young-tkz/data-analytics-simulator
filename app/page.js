import Quiz from "./quiz";
import { getAllContent } from "../lib/content";

export default function Home() {
    const content = getAllContent();

    return <Quiz units={content.units} />;
}