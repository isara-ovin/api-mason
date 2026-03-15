import { create } from 'zustand';
import {
    type Connection,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';

interface FlowState {
    nodes: Node[];
    edges: Edge[];

    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    updateNodeData: (id: string, data: Record<string, unknown>) => void;
    updateNodeDimensions: (id: string, isExpanded: boolean) => void;

    orchestrationId: string | null;
    orchestrationName: string;
    setOrchestrationId: (id: string | null) => void;
    setOrchestrationName: (name: string) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
    nodes: [],
    edges: [],

    orchestrationId: null,
    orchestrationName: 'New Orchestration',
    setOrchestrationId: (id) => set({ orchestrationId: id }),
    setOrchestrationName: (name) => set({ orchestrationName: name }),

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    onConnect: (connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },

    setNodes: (nodes: Node[]) => set({ nodes }),
    setEdges: (edges: Edge[]) => set({ edges }),

    addNode: (node: Node) => set((state) => ({
        nodes: [...state.nodes, node]
    })),

    updateNodeData: (id: string, data: Record<string, unknown>) => set((state) => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
    })),

    updateNodeDimensions: (id: string, isExpanded: boolean) => set((state) => ({
        nodes: state.nodes.map(n => {
            if (n.id === id) {
                if (!isExpanded) {
                    // Collapsing: Save current dimensions to data, then clear them from style to let DOM natural size take over
                    const { width, height, ...restStyle } = n.style || {};
                    const expandedWidth = width || n.width;
                    const expandedHeight = height || n.height;
                    return {
                        ...n,
                        width: undefined,
                        height: undefined,
                        style: restStyle,
                        data: {
                            ...n.data,
                            expandedWidth: expandedWidth,
                            expandedHeight: expandedHeight
                        }
                    };
                } else {
                    // Expanding: Restore saved dimensions from data back to style and node root
                    const ew = n.data.expandedWidth as number | undefined;
                    const eh = n.data.expandedHeight as number | undefined;
                    if (ew || eh) {
                        return {
                            ...n,
                            width: ew,
                            height: eh,
                            style: {
                                ...(n.style || {}),
                                width: ew,
                                height: eh
                            }
                        };
                    }
                }
            }
            return n;
        })
    })),
}));
