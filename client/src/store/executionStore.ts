import { create } from 'zustand';

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

interface ExecutionLog {
    id: string;
    blockId: string;
    blockName?: string;
    timestamp: Date;
    status: 'success' | 'error' | 'pending';
    message: string;
    data?: any;
}

interface ExecutionState {
    status: ExecutionStatus;
    logs: ExecutionLog[];
    context: Record<string, any>;
    currentBlockId: string | null;
    variables: Record<string, any>;

    setStatus: (status: ExecutionStatus) => void;
    addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void;
    updateContext: (key: string, value: any) => void;
    resetExecution: () => void;
    setCurrentBlock: (id: string | null) => void;
    setVariable: (key: string, value: any) => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
    status: 'idle',
    logs: [],
    context: {},
    currentBlockId: null,
    variables: {},

    setStatus: (status) => set({ status }),

    addLog: (log) => set((state) => ({
        logs: [
            ...state.logs,
            {
                ...log,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
            }
        ]
    })),

    updateContext: (key, value) => set((state) => ({
        context: { ...state.context, [key]: value }
    })),

    resetExecution: () => set({
        status: 'idle',
        logs: [],
        context: {},
        currentBlockId: null,
        variables: {},
    }),

    setCurrentBlock: (id) => set({ currentBlockId: id }),

    setVariable: (key, value) => set((state) => ({
        variables: { ...state.variables, [key]: value }
    })),
}));
