import { useCallback } from 'react';
import { useExecutionStore } from '../store/executionStore';
import { useFlowStore } from '../store/flowStore';
import { useCollectionStore } from '../store/collectionStore';

export function useExecution() {
    const { setStatus, addLog, resetExecution, setCurrentBlock, setVariable } = useExecutionStore();
    const { nodes, edges } = useFlowStore();
    const { selectedEnvironmentId, environments } = useCollectionStore();

    const getBlockName = useCallback((blockId: string): string => {
        const node = nodes.find(n => n.id === blockId);
        if (!node) return blockId === 'system' ? 'System' : blockId;
        return (node.data.label as string) || node.type || blockId;
    }, [nodes]);

    const handleExecutionEvent = useCallback((event: any) => {
        switch (event.type) {
            case 'status':
                setStatus(event.status);
                if (event.status === 'completed') {
                    addLog({ status: 'success', blockId: 'system', blockName: 'System', message: 'Flow completed successfully' });
                }
                break;
            case 'blockStart': {
                const name = getBlockName(event.blockId);
                setCurrentBlock(event.blockId);
                addLog({ status: 'pending', blockId: event.blockId, blockName: name, message: `Executing ${name}` });
                break;
            }
            case 'blockEnd': {
                const name = getBlockName(event.blockId);
                addLog({ status: 'success', blockId: event.blockId, blockName: name, message: `${name} finished`, data: event.result });
                break;
            }
            case 'variable':
                setVariable(event.key, event.value);
                addLog({ status: 'success', blockId: 'system', blockName: 'System', message: `Variable set: {{${event.key}}} = ${JSON.stringify(event.value)}` });
                break;
            case 'log':
                addLog({
                    status: 'pending',
                    blockId: event.log.blockId,
                    blockName: getBlockName(event.log.blockId),
                    message: event.log.message
                });
                break;
        }
    }, [setStatus, addLog, setCurrentBlock, setVariable, getBlockName]);

    const runFlow = useCallback(async () => {
        resetExecution();
        setStatus('running');
        addLog({ status: 'pending', blockId: 'system', blockName: 'System', message: 'Starting flow execution...' });

        const environment = environments.find(e => e.id === selectedEnvironmentId)?.variables
            .filter(v => v.enabled)
            .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}) || {};

        try {
            const response = await fetch('http://localhost:3001/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges, environment }),
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const segments = chunk.split('\n\n');

                for (const segment of segments) {
                    if (segment.startsWith('data: ')) {
                        try {
                            const eventStr = segment.substring(6).trim();
                            if (eventStr) {
                                const event = JSON.parse(eventStr);
                                handleExecutionEvent(event);
                            }
                        } catch (e) {
                            console.error('Failed to parse SSE event:', segment);
                        }
                    }
                }
            }
        } catch (error: any) {
            setStatus('failed');
            addLog({ status: 'error', blockId: 'system', blockName: 'System', message: `Execution failed: ${error.message}` });
        }
    }, [nodes, edges, selectedEnvironmentId, environments, resetExecution, setStatus, addLog, handleExecutionEvent]);

    return { runFlow };
}
