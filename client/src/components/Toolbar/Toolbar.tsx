import React, { useEffect } from 'react';
import { useExecution } from '../../hooks/useExecution';
import { useOrchestration } from '../../hooks/useOrchestration';
import { useExecutionStore } from '../../store/executionStore';
import { useCollectionStore } from '../../store/collectionStore';
import { useUIStore } from '../../store/uiStore';
import { useFlowStore } from '../../store/flowStore';
import { Play, Loader2, Save, FileJson, FileEdit, ChevronDown, Leaf, FilePlus2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Toolbar: React.FC = () => {
    const { runFlow } = useExecution();
    const { saveOrchestration, newOrchestration } = useOrchestration();
    const status = useExecutionStore((state) => state.status);
    const { toggleEnvPanel } = useUIStore();
    const { orchestrationName, setOrchestrationName } = useFlowStore();

    const { environments, selectedEnvironmentId, setEnvironments, setSelectedEnvironment, addEnvironment } = useCollectionStore();

    // Fetch environments on mount
    useEffect(() => {
        fetch('/api/environments')
            .then(r => r.json())
            .then((list: any[]) => {
                // list comes back without variables array — we need to fetch each
                Promise.all(
                    list.map(async (env) => {
                        const res = await fetch(`/api/environments/${env.id}`);
                        if (!res.ok) return { ...env, variables: [] };
                        return res.json();
                    })
                ).then(full => setEnvironments(full));
            })
            .catch(() => { }); // No envs imported yet — that's fine
    }, [setEnvironments]);

    const handleCollectionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                JSON.parse(json);

                const response = await fetch('/api/collections/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ json })
                });

                if (!response.ok) throw new Error('Failed to import collection');
                toast.success('Collection imported!');
                setTimeout(() => window.location.reload(), 800);
            } catch (error: any) {
                toast.error(`Import failed: ${error.message}`);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleEnvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                JSON.parse(json);

                const response = await fetch('/api/environments/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ json })
                });

                if (!response.ok) throw new Error('Failed to import environment');
                const { id, name: envName } = await response.json();

                // Fetch the full env with variables
                const envRes = await fetch(`/api/environments/${id}`);
                const fullEnv = envRes.ok ? await envRes.json() : { id, name: envName, variables: [] };

                addEnvironment(fullEnv);
                setSelectedEnvironment(id);
                toast.success(`Environment "${envName}" imported & activated!`);
            } catch (error: any) {
                toast.error(`Env import failed: ${error.message}`);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const selectedEnv = environments.find(e => e.id === selectedEnvironmentId);

    return (
        <div className="toolbar">
            <div className="toolbar-left">
                {/* Import Collection */}
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }} title="Import Postman Collection JSON">
                    <FileJson size={16} /> Import Collection
                    <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleCollectionUpload} />
                </label>

                {/* Import Environment */}
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }} title="Import Postman Environment JSON">
                    <Leaf size={16} /> Import Env
                    <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleEnvUpload} />
                </label>

                {/* Environment Selector */}
                {environments.length > 0 && (
                    <div className="env-selector" title="Active environment for this run">
                        <ChevronDown size={13} style={{ opacity: 0.5 }} />
                        <select
                            className="env-select"
                            value={selectedEnvironmentId || ''}
                            onChange={e => setSelectedEnvironment(e.target.value || null)}
                        >
                            <option value="">No environment</option>
                            {environments.map(env => (
                                <option key={env.id} value={env.id}>{env.name}</option>
                            ))}
                        </select>
                        {selectedEnv && (
                            <span
                                className="env-var-count"
                                onClick={toggleEnvPanel}
                                style={{ cursor: 'pointer' }}
                                title="Manage variables"
                            >
                                {selectedEnv.variables?.length || 0} vars
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flow-name-container">
                <FileEdit size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                    className="canvas-title-input"
                    value={orchestrationName}
                    onChange={(e) => setOrchestrationName(e.target.value)}
                    placeholder="Orchestration Name"
                />
                <button
                    className="btn btn-ghost new-orch-btn"
                    onClick={() => { newOrchestration(); setOrchestrationName('New Orchestration'); }}
                    title="Clear canvas and start a new orchestration"
                >
                    <FilePlus2 size={14} /> New
                </button>
            </div>

            <div className="toolbar-right">
                <button className="btn btn-secondary" onClick={() => saveOrchestration()} title="Save">
                    <Save size={14} /> Save
                </button>
                <button className="btn btn-primary" onClick={runFlow} disabled={status === 'running'} title="Run Flow">
                    {status === 'running' ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
                    {status === 'running' ? 'Running...' : 'Execute Flow'}
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
