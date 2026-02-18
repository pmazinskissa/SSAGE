export interface QuestionOption {
    id: string;
    text: string;
}
export interface MatchingPair {
    id: string;
    left: string;
    right: string;
}
export interface FillInBlankSegment {
    type: 'text' | 'blank';
    value: string;
    accept?: string[];
}
interface BaseQuestion {
    id: string;
    question: string;
    explanation: string;
    lesson_link?: string;
    lesson_link_label?: string;
}
export interface MultipleChoiceSingleQuestion extends BaseQuestion {
    type: 'multiple-choice-single';
    options: QuestionOption[];
    correct_option: string;
}
export interface MultipleChoiceMultiQuestion extends BaseQuestion {
    type: 'multiple-choice-multi';
    options: QuestionOption[];
    correct_options: string[];
}
export interface TrueFalseQuestion extends BaseQuestion {
    type: 'true-false';
    correct_answer: boolean;
}
export interface MatchingQuestion extends BaseQuestion {
    type: 'matching';
    pairs: MatchingPair[];
}
export interface DragToRankQuestion extends BaseQuestion {
    type: 'drag-to-rank';
    items: QuestionOption[];
    correct_order: string[];
}
export interface FillInBlankQuestion extends BaseQuestion {
    type: 'fill-in-blank';
    segments: FillInBlankSegment[];
}
export type KnowledgeCheckQuestion = MultipleChoiceSingleQuestion | MultipleChoiceMultiQuestion | TrueFalseQuestion | MatchingQuestion | DragToRankQuestion | FillInBlankQuestion;
export interface KnowledgeCheckConfig {
    title: string;
    description: string;
    questions: KnowledgeCheckQuestion[];
}
export interface QuestionResult {
    questionId: string;
    correct: boolean;
    lesson_link?: string;
    lesson_link_label?: string;
}
export interface KnowledgeCheckResult {
    total: number;
    correct: number;
    score: number;
    results: QuestionResult[];
}
export {};
//# sourceMappingURL=knowledge-check.d.ts.map