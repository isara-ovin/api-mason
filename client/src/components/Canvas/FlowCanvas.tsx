import React, { useRef, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '../../store/flowStore';
import { useUIStore } from '../../store/uiStore';
import { useCollectionStore } from '../../store/collectionStore';
import { nodeTypes } from '../Nodes/nodeTypes';
import { edgeTypes } from '../Edges/edgeTypes';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { v4 as uuidv4 } from 'uuid';

/** Replace {{KEY}} tokens with values from varMap; unmatched tokens are left as-is. */
export function resolveVarsPreview(text: string, varMap: Record<string, string>): string {
    if (!text || Object.keys(varMap).length === 0) return text;
    return text.replace(/\{\{([^{}]+)\}\}/g, (_, key) => varMap[key.trim()] ?? `{{${key}}}`);
}

const FlowCanvasInner: React.FC = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useFlowStore();
    const { screenToFlowPosition } = useReactFlow();
    const theme = useUIStore((state) => state.theme);
    const setSelectedBlock = useUIStore((state) => state.setSelectedBlock);
    const { environments, selectedEnvironmentId } = useCollectionStore();

    useKeyboardShortcuts('New Orchestration');

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            let position = { x: 100, y: 100 };
            try {
                position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            } catch { /* fallback position */ }

            // Build a variable map from the active environment
            const activeEnv = environments.find(e => e.id === selectedEnvironmentId);
            const varMap: Record<string, string> = {};
            if (activeEnv?.variables) {
                for (const v of activeEnv.variables) {
                    if (v.enabled !== false && v.key) varMap[v.key] = v.value ?? '';
                }
            }

            // Handle collection request drag-drop (pre-populated API Request node)
            const collectionData = event.dataTransfer.getData('application/reactflow-collection-request');
            if (collectionData) {
                try {
                    const request = JSON.parse(collectionData);
                    // Keep {{VAR}} syntax in node data — resolved at execution time & shown as chips
                    const newNode = {
                        id: uuidv4(),
                        type: 'apiRequest',
                        position,
                        data: {
                            label: request.name,
                            method: request.method,
                            url: request.url,
                            headers: request.headers,
                            body: request.body,
                        },
                    };
                    addNode(newNode);
                    setTimeout(() => setSelectedBlock(newNode.id), 50);
                } catch (err) {
                    console.error('Failed to parse collection request data', err);
                }
                return;
            }

            // Handle generic tool block drag-drop
            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) {
                console.warn('Drop event failed: no type data found.');
                return;
            }

            const newNode = {
                id: uuidv4(),
                type,
                position,
                data: { label: `${type} node` },
            };

            addNode(newNode);
            setTimeout(() => setSelectedBlock(newNode.id), 50);
        },
        [screenToFlowPosition, addNode, setSelectedBlock, environments, selectedEnvironmentId]
    );

    return (
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => setSelectedBlock(node.id)}
                onPaneClick={() => setSelectedBlock(null)}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{ type: 'animated' }}
                colorMode={theme}
                fitView
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color={theme === 'dark' ? '#334155' : '#cbd5e1'}
                />
                <Controls />
                <MiniMap
                    nodeColor={theme === 'dark' ? '#334155' : '#e2e8f0'}
                    maskColor={theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(248, 250, 252, 0.7)'}
                    style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff' }}
                />
            </ReactFlow>
        </div>
    );
};

const FlowCanvas: React.FC = () => (
    <ReactFlowProvider>
        <FlowCanvasInner />
    </ReactFlowProvider>
);

export default FlowCanvas;
