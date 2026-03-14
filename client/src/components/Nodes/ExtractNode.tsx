import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import { Braces, Plus, X, ChevronRight } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import { useExecutionStore } from '../../store/executionStore';
import VariablePicker from '../Common/VariablePicker';

interface ExtractionRow {
    id: string;
    path: string;
    variableName: string;
    targetType?: 'runtime' | 'env';
}

const ExtractNode = ({ data, id }: NodeProps) => {
    const [expanded, setExpanded] = useState(false);
    const updateNodeData = useFlowStore(s => s.updateNodeData);
    const currentBlockId = useExecutionStore(s => s.currentBlockId);
    const isExecuting = currentBlockId === id;

    const extractions: ExtractionRow[] = (data.extractions as ExtractionRow[]) || [];
    const label = (data.label as string) || 'Extract';

    const addRow = () => {
        const newRow: ExtractionRow = { id: Math.random().toString(36).substr(2, 8), path: '', variableName: '' };
        updateNodeData(id, { extractions: [...extractions, newRow] });
    };

    const updateRow = (rowId: string, patch: Partial<ExtractionRow>) => {
        updateNodeData(id, {
            extractions: extractions.map(r => r.id === rowId ? { ...r, ...patch } : r)
        });
    };

    const removeRow = (rowId: string) => {
        updateNodeData(id, { extractions: extractions.filter(r => r.id !== rowId) });
    };

    const varNames = extractions.filter(r => r.variableName).map(r => r.targetType === 'env' ? `{{${r.variableName}}}` : r.variableName).join(', ');

    return (
        <m.div
            className={`custom-node extract-node ${isExecuting ? 'node-executing' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Handle type="target" position={Position.Left} className="node-handle-left" />

            <div className="node-header" onClick={() => setExpanded(e => !e)}>
                <span className="node-icon"><Braces size={14} /></span>
                <span className="node-title" style={{ flex: 1 }}>{label}</span>
                <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
            </div>

            {!expanded && (
                <div className="node-content">
                    {extractions.length === 0
                        ? 'No extractions — click to add'
                        : `${extractions.length} extraction${extractions.length > 1 ? 's' : ''} → ${varNames}`
                    }
                </div>
            )}

            {expanded && (
                <div className="node-inline-editor nodrag" onClick={e => e.stopPropagation()}>
                    <div className="inline-field">
                        <label className="inline-label">Block Name</label>
                        <input
                            className="inline-input nodrag"
                            value={label}
                            onChange={e => updateNodeData(id, { label: e.target.value })}
                        />
                    </div>

                    {extractions.length > 0 && (
                        <div className="extraction-rows">
                            {extractions.map(row => (
                                <div key={row.id} className="extraction-row">
                                    <div className="inline-field" style={{ flex: 1 }}>
                                        <label className="inline-label">JSONPath</label>
                                        <input
                                            className="inline-input nodrag"
                                            value={row.path}
                                            onChange={e => updateRow(row.id, { path: e.target.value })}
                                            placeholder="$.body[0].id"
                                        />
                                    </div>
                                    <div className="extraction-arrow">→</div>
                                    <div className="inline-field" style={{ flex: 1 }}>
                                        <label className="inline-label">Variable name <span className="var-hint">type {'{{'} for env</span></label>
                                        <VariablePicker
                                            value={row.variableName}
                                            onChange={(val) => {
                                                const match = val.match(/\{\{([^{}]+)\}\}/);
                                                if (match) {
                                                    updateRow(row.id, { variableName: match[1].trim(), targetType: 'env' });
                                                } else {
                                                    updateRow(row.id, { variableName: val.replace(/\{\{|\}\}/g, ''), targetType: 'runtime' });
                                                }
                                            }}
                                            placeholder="postId"
                                            className={row.targetType === 'env' ? 'env-target' : ''}
                                        />
                                    </div>
                                    <button
                                        className="extraction-remove nodrag"
                                        onClick={() => removeRow(row.id)}
                                        title="Remove"
                                    >
                                        <X size={11} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button className="add-extraction-btn nodrag" onClick={addRow}>
                        <Plus size={11} /> Add extraction
                    </button>
                </div>
            )}

            <Handle type="source" position={Position.Right} className="node-handle-right" />
        </m.div>
    );
};

export default memo(ExtractNode);
