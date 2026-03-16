import { useCallback } from 'react';
import { useFlowStore } from '../store/flowStore';
import { useExecutionStore } from '../store/executionStore';
import toast from 'react-hot-toast';

export function useOrchestration() {
    const { nodes, edges, setNodes, setEdges, orchestrationId, orchestrationName, setOrchestrationId, setOrchestrationName } = useFlowStore();
    const { resetExecution } = useExecutionStore();

    const saveOrchestration = useCallback(async () => {
        try {
            const url = '/api/orchestrations' + (orchestrationId ? `/${orchestrationId}` : '');
            const response = await fetch(url, {
                method: orchestrationId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: orchestrationName,
                    flow_data: { nodes, edges }
                }),
            });

            if (!response.ok) throw new Error('Failed to save orchestration');

            const result = await response.json();
            if (!orchestrationId && result.id) {
                setOrchestrationId(result.id);
            }
            toast.success(`"${orchestrationName}" saved!`);
            window.dispatchEvent(new Event('flow-saved'));
            return result;
        } catch (error: any) {
            toast.error(`Save failed: ${error.message}`);
        }
    }, [nodes, edges, orchestrationId, orchestrationName, setOrchestrationId]);

    const loadOrchestration = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/orchestrations/${id}`);
            if (!response.ok) throw new Error('Failed to load orchestration');

            const data = await response.json();
            if (data.flow_data) {
                setNodes(data.flow_data.nodes || []);
                setEdges(data.flow_data.edges || []);
            }
            setOrchestrationId(data.id);
            setOrchestrationName(data.name);
            resetExecution();
            toast.success(`Loaded "${data.name}"`);
        } catch (error: any) {
            toast.error(`Load failed: ${error.message}`);
        }
    }, [setNodes, setEdges, resetExecution, setOrchestrationId, setOrchestrationName]);

    const newOrchestration = useCallback(() => {
        setNodes([]);
        setEdges([]);
        setOrchestrationId(null);
        setOrchestrationName('New Orchestration');
        resetExecution();
        toast.success('New orchestration started');
    }, [setNodes, setEdges, resetExecution, setOrchestrationId, setOrchestrationName]);

    return { saveOrchestration, loadOrchestration, newOrchestration };
}
