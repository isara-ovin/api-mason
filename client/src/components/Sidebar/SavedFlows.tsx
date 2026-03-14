import React, { useEffect, useState } from 'react';
import { useOrchestration } from '../../hooks/useOrchestration';
import toast from 'react-hot-toast';
import { FileText, Trash2, Download, Upload } from 'lucide-react';

const SavedFlows: React.FC = () => {
    const { loadOrchestration } = useOrchestration();
    const [flows, setFlows] = useState<{ id: string, name: string }[]>([]);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const fetchFlows = () => {
        fetch('http://localhost:3001/api/orchestrations')
            .then(res => res.json())
            .then(setFlows)
            .catch(() => toast.error('Failed to fetch saved flows'));
    };

    useEffect(() => {
        fetchFlows();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirmId !== id) {
            setConfirmId(id);
            setTimeout(() => setConfirmId(null), 2500);
            return;
        }
        try {
            const res = await fetch(`http://localhost:3001/api/orchestrations/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Flow deleted');
            setFlows(prev => prev.filter(f => f.id !== id));
            setConfirmId(null);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleExport = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:3001/api/orchestrations/${id}`);
            if (!res.ok) throw new Error('Failed to fetch flow for export');
            const data = await res.json();

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name.replace(/\s+/g, '_')}_flow.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`Exported ${name}`);
        } catch (err: any) {
            toast.error(`Export failed: ${err.message}`);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                const data = JSON.parse(content);

                if (!data.name || !data.flow_data) {
                    throw new Error('Invalid flow file format');
                }

                const res = await fetch('http://localhost:3001/api/orchestrations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: `${data.name} (Imported)`,
                        flow_data: data.flow_data
                    })
                });

                if (!res.ok) throw new Error('Failed to save imported flow');
                toast.success('Flow imported successfully');
                fetchFlows();
            } catch (err: any) {
                toast.error(`Import failed: ${err.message}`);
            }
        };
        reader.readAsText(file);
        // Reset input so the same file can be imported again if needed
        e.target.value = '';
    };

    return (
        <div className="saved-flows">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="sidebar-section-title">Saved Flows</h3>
                <div>
                    <input type="file" id="import-flow-input" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                    <button
                        onClick={() => document.getElementById('import-flow-input')?.click()}
                        title="Import flow from JSON"
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <Upload size={14} />
                    </button>
                </div>
            </div>
            {flows.length === 0 ? (
                <div className="empty-state">No saved flows yet</div>
            ) : (
                <div className="flows-list">
                    {flows.map(flow => (
                        <div
                            key={flow.id}
                            className="flow-item"
                            onClick={() => loadOrchestration(flow.id)}
                        >
                            <span className="flow-icon"><FileText size={14} /></span>
                            <span className="flow-name-label">{flow.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                    className="flow-export-btn"
                                    onClick={(e) => handleExport(e, flow.id, flow.name)}
                                    title="Export flow"
                                >
                                    <Download size={11} />
                                </button>
                                <button
                                    className={`flow-delete-btn ${confirmId === flow.id ? 'confirming' : ''}`}
                                    onClick={(e) => handleDelete(e, flow.id)}
                                    title={confirmId === flow.id ? 'Click again to confirm' : 'Delete flow'}
                                >
                                    <Trash2 size={11} />
                                    {confirmId === flow.id && <span style={{ fontSize: '0.6rem', marginLeft: 2 }}>Sure?</span>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedFlows;
