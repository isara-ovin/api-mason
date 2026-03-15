import { create } from 'zustand';

export interface PostmanRequest {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
    description?: string;
}

export interface PostmanCollection {
    id: string;
    name: string;
    items: (PostmanRequest | { id: string; name: string; items: any[] })[];
}

export interface Environment {
    id: string;
    name: string;
    variables: { key: string; value: string; enabled: boolean }[];
}

interface CollectionState {
    collections: PostmanCollection[];
    environments: Environment[];
    selectedEnvironmentId: string | null;

    setCollections: (collections: PostmanCollection[]) => void;
    addCollection: (collection: PostmanCollection) => void;
    removeCollection: (id: string) => void;

    setEnvironments: (environments: Environment[]) => void;
    addEnvironment: (env: Environment) => void;
    updateEnvironment: (id: string, updates: Partial<Environment>) => void;
    removeEnvironment: (id: string) => void;
    setSelectedEnvironment: (id: string | null) => void;
}

export const useCollectionStore = create<CollectionState>((set) => ({
    collections: [],
    environments: [],
    selectedEnvironmentId: null,

    setCollections: (collections) => set({ collections }),
    addCollection: (collection) => set((state) => ({
        collections: [...state.collections.filter(c => c.id !== collection.id), collection]
    })),
    removeCollection: (id) => set((state) => ({
        collections: state.collections.filter(c => c.id !== id)
    })),

    setEnvironments: (environments) => set({ environments }),
    addEnvironment: (env) => set((state) => ({
        environments: [...state.environments.filter(e => e.id !== env.id), env]
    })),
    updateEnvironment: (id, updates) => set((state) => ({
        environments: state.environments.map(e => e.id === id ? { ...e, ...updates } : e)
    })),
    removeEnvironment: (id) => set((state) => ({
        environments: state.environments.filter(e => e.id !== id)
    })),
    setSelectedEnvironment: (id) => set({ selectedEnvironmentId: id }),
}));
