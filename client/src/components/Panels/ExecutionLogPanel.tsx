import React, { useRef, useEffect, useState } from 'react';
import { useExecutionStore } from '../../store/executionStore';
import { useCollectionStore } from '../../store/collectionStore';
import { Activity, Variable } from 'lucide-react';

const ExecutionLogPanel: React.FC = () => {
    const { logs, status, currentBlockId, variables } = useExecutionStore();
    const { environments, selectedEnvironmentId } = useCollectionStore();
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'logs' | 'variables'>('logs');

    // Auto-scroll to latest log
    useEffect(() => {
        if (activeTab === 'logs') {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, activeTab]);

    const envVars = environments.find(e => e.id === selectedEnvironmentId)?.variables || [];
    const runtimeVarEntries = Object.entries(variables);

    return (
        <div className="execution-panel">
            <div className="panel-header">
                <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                        className={`panel-tab ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        <Activity size={12} /> Execution Log
                    </button>
                    <button
                        className={`panel-tab ${activeTab === 'variables' ? 'active' : ''}`}
                        onClick={() => setActiveTab('variables')}
                    >
                        <Variable size={12} /> Variables
                        {runtimeVarEntries.length > 0 && (
                            <span className="tab-badge">{runtimeVarEntries.length}</span>
                        )}
                    </button>
                </div>
                <span className={`status-badge ${status}`}>{status.toUpperCase()}</span>
            </div>

            {activeTab === 'logs' && (
                <div className="logs-container">
                    {logs.length === 0 ? (
                        <div className="empty-logs">No execution data. Press 'Execute Flow' to start.</div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className={`log-entry ${log.status} ${log.blockId === currentBlockId ? 'active' : ''}`}
                            >
                                <span className="log-time">{log.timestamp.toLocaleTimeString()}</span>
                                <span className="log-block">[{log.blockName || log.blockId}]</span>
                                <span className="log-msg">{log.message}</span>
                                {log.data && (
                                    <details className="log-data">
                                        <summary>View Data</summary>
                                        <pre>{JSON.stringify(log.data, null, 2)}</pre>
                                    </details>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>
            )}

            {activeTab === 'variables' && (
                <div className="logs-container">
                    {envVars.length === 0 && runtimeVarEntries.length === 0 ? (
                        <div className="empty-logs">No variables. Import a Postman env or add an Extract block to your flow.</div>
                    ) : (
                        <>
                            {envVars.length > 0 && (
                                <div className="var-section">
                                    <div className="var-section-heading">Environment Variables</div>
                                    <table className="var-table">
                                        <tbody>
                                            {envVars.filter(v => v.enabled).map(v => (
                                                <tr key={v.key} className="var-row">
                                                    <td className="var-key">{'{{' + v.key + '}}'}</td>
                                                    <td className="var-val">{v.value || <em>empty</em>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {runtimeVarEntries.length > 0 && (
                                <div className="var-section">
                                    <div className="var-section-heading">Runtime Variables (from Extract blocks)</div>
                                    <table className="var-table">
                                        <tbody>
                                            {runtimeVarEntries.map(([key, val]) => (
                                                <tr key={key} className="var-row">
                                                    <td className="var-key">{'{{' + key + '}}'}</td>
                                                    <td className="var-val">{JSON.stringify(val)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExecutionLogPanel;
