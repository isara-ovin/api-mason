import { useCallback } from 'react';
import { useFlowStore } from '../store/flowStore';
import { useExecutionStore } from '../store/executionStore';
import toast from 'react-hot-toast';

export function useOrchestration() {
    const { nodes, edges, setNodes, setEdges } = useFlowStore();
    const { resetExecution } = useExecutionStore();

    const saveOrchestration = useCallback(async (name: string, id?: string) => {
        try {
            const response = await fetch('http://localhost:3001/api/orchestrations' + (id ? `/${id}` : ''), {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    flow_data: { nodes, edges }
                }),
            });

            if (!response.ok) throw new Error('Failed to save orchestration');

            const result = await response.json();
            toast.success(`"${name}" saved!`);
            return result;
        } catch (error: any) {
            toast.error(`Save failed: ${error.message}`);
        }
    }, [nodes, edges]);

    const loadOrchestration = useCallback(async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/orchestrations/${id}`);
            if (!response.ok) throw new Error('Failed to load orchestration');

            const data = await response.json();
            if (data.flow_data) {
                setNodes(data.flow_data.nodes || []);
                setEdges(data.flow_data.edges || []);
            }
            resetExecution();
            toast.success(`Loaded "${data.name}"`);
        } catch (error: any) {
            toast.error(`Load failed: ${error.message}`);
        }
    }, [setNodes, setEdges, resetExecution]);

    const newOrchestration = useCallback(() => {
        setNodes([]);
        setEdges([]);
        resetExecution();
        toast.success('New orchestration started');
    }, [setNodes, setEdges, resetExecution]);

    return { saveOrchestration, loadOrchestration, newOrchestration };
}
