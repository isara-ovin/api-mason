import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useExecution } from './useExecution';
import { useOrchestration } from './useOrchestration';
import { useExecutionStore } from '../store/executionStore';

export const useKeyboardShortcuts = (currentFlowName: string) => {
    const { deleteElements, getNodes } = useReactFlow();
    const { runFlow } = useExecution();
    const { saveOrchestration } = useOrchestration();
    const status = useExecutionStore((state) => state.status);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if focus is in an input or textarea
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            // Save: Cmd/Ctrl + S
            if ((event.metaKey || event.ctrlKey) && event.key === 's') {
                event.preventDefault();
                saveOrchestration();
            }

            // Execute: Cmd/Ctrl + Enter
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                if (status !== 'running') {
                    runFlow();
                }
            }

            // Delete: Backspace or Delete (Handled partially by React Flow, but we ensure selected nodes are dropped)
            if (event.key === 'Backspace' || event.key === 'Delete') {
                const selectedNodes = getNodes().filter((n) => n.selected);
                if (selectedNodes.length > 0) {
                    deleteElements({ nodes: selectedNodes });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteElements, getNodes, runFlow, saveOrchestration, status, currentFlowName]);
};
