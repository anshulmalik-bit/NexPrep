// Quinn Messages Helper for Frontend

export type QuinnModeType = 'SUPPORTIVE' | 'DIRECT';

export function getQuinnGreeting(mode: QuinnModeType): string {
    if (mode === 'SUPPORTIVE') {
        return "Hey there! 👋 I'm Quinn, your interview coach. Ready to practice for your role? Let's make this fun and productive!";
    }
    return "Quinn here. Let's get started with your interview practice.";
}

export function getQuinnCompletion(mode: QuinnModeType): string {
    if (mode === 'SUPPORTIVE') {
        return "Amazing work! 🎉 You've completed all the questions. I'm so proud of how you handled that!";
    }
    return "Interview complete. Not bad. Let's see the results.";
}

export function getQuinnFeedbackIntro(mode: QuinnModeType): string {
    if (mode === 'SUPPORTIVE') {
        return "Great effort! Here's what I noticed:";
    }
    return "Feedback:";
}

export function getQuinnHintIntro(mode: QuinnModeType): string {
    if (mode === 'SUPPORTIVE') {
        return "Here's a gentle nudge in the right direction:";
    }
    return "Hint:";
}
