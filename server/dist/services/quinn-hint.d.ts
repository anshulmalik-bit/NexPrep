import { QuinnMode } from './quinn-core.js';
interface HintInput {
    question: string;
    quinnMode: QuinnMode;
    role: string;
}
interface HintOutput {
    hint: string;
}
export declare function generateHint(input: HintInput): Promise<HintOutput>;
export {};
