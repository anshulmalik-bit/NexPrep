import { ContentJudgeOutput } from './quinn-content-judge.js';
/**
 * Instant, zero-latency judge using heuristics.
 * Used for immediate feedback while the LLM processes in the background.
 */
export declare function judgeContentHeuristic(transcript: string): ContentJudgeOutput;
