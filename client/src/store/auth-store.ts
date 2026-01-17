import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type FinalReport } from './interview-store';

export interface UserProfile {
    nickname: string;
    createdAt: string;
}

export interface HistoryEntry {
    id: string;
    trackId: string;
    roleId: string;
    companyName?: string;
    score: number;
    report: FinalReport;
    createdAt: string;
}

interface AuthState {
    user: UserProfile | null;
    history: HistoryEntry[];

    // Actions
    setProfile: (nickname: string) => void;
    addHistory: (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => void;
    clearData: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            history: [],

            setProfile: (nickname) => set({
                user: {
                    nickname,
                    createdAt: new Date().toISOString(),
                },
            }),

            addHistory: (entry) => set((state) => ({
                history: [
                    {
                        ...entry,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                    },
                    ...state.history,
                ],
            })),

            clearData: () => set({ user: null, history: [] }),
        }),
        {
            name: 'hrprep-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
