import {create} from "zustand";

interface NoteState {
  aiResponses: Array<{ id: number; text: string; isUser: boolean }>;
  setAiResponse: (newResponse: { id: number; text: string; isUser: boolean }) => void;
  approvedAI: { id: number; text: string; isUser: boolean; noteId?: string } | null;
  setApprovedAI: (ai: { id: number; text: string; isUser: boolean; noteId?: string } | null) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  aiResponses: [],
  setAiResponse: (newResponse) =>
    set((state) => ({ aiResponses: [...state.aiResponses, newResponse] })),
  approvedAI: null,
  setApprovedAI: (ai) => set({ approvedAI: ai }),
  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
}));
