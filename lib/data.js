import {
    getUnitTopics,
    getMCQs,
    getQuestionBank,
} from "./parser";

export function getQuizData() {
    return {
        unit1: getUnitTopics(1),
        unit2: getUnitTopics(2),
        mcqs: getMCQs(),
        questionBank: getQuestionBank(),
    };
}