import React, { useEffect, useState } from 'react';
import { useOrchestration } from '../../hooks/useOrchestration';
import toast from 'react-hot-toast';
import { FileText, Trash2 } from 'lucide-react';

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

    return (
        <div className="saved-flows">
            <h3 className="sidebar-section-title">Saved Flows</h3>
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
                            <button
                                className={`flow-delete-btn ${confirmId === flow.id ? 'confirming' : ''}`}
                                onClick={(e) => handleDelete(e, flow.id)}
                                title={confirmId === flow.id ? 'Click again to confirm' : 'Delete flow'}
                            >
                                <Trash2 size={11} />
                                {confirmId === flow.id && <span style={{ fontSize: '0.6rem', marginLeft: 2 }}>Sure?</span>}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedFlows;
