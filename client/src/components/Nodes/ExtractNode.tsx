import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import { Braces, Plus, X, ChevronRight } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import { useExecutionStore } from '../../store/executionStore';
import { useCollectionStore } from '../../store/collectionStore';
import VariablePicker from '../Common/VariablePicker';
import { UrlPreview } from './ApiRequestNode';

interface ExtractionRow {
    id: string;
    path: string;
    variableName: string;
    targetType?: 'runtime' | 'env';
}

const ExtractNode = ({ data, id }: NodeProps) => {
    const expanded = !!data.expanded;
    const updateNodeData = useFlowStore(s => s.updateNodeData);
    const { environments, selectedEnvironmentId } = useCollectionStore();
    const currentBlockId = useExecutionStore(s => s.currentBlockId);
    const isExecuting = currentBlockId === id;

    const extractions: ExtractionRow[] = (data.extractions as ExtractionRow[]) || [];
    const label = (data.label as string) || 'Extract';

    // Build varMap from active env for chip rendering
    const varMap: Record<string, string> = {};
    const activeEnv = environments.find(e => e.id === selectedEnvironmentId);
    if (activeEnv?.variables) {
        for (const v of activeEnv.variables) {
            if (v.enabled !== false && v.key) varMap[v.key] = v.value ?? '';
        }
    }

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

    const varUrl = extractions
        .filter(r => r.variableName)
        .map(r => r.targetType === 'env' ? `{{${r.variableName}}}` : r.variableName)
        .join(', ');

    return (
        <m.div
            className={`custom-node extract-node ${isExecuting ? 'node-executing' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Handle type="target" position={Position.Left} id="left" className="node-handle-left" />
            <Handle type="target" position={Position.Top} id="top" className="node-handle-top" />

            <div className="node-header" onClick={() => updateNodeData(id, { expanded: !expanded })}>
                <span className="node-icon"><Braces size={14} /></span>
                <span className="node-title" style={{ flex: 1 }}>{label}</span>
                <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
            </div>

            {!expanded && (
                <div className="node-content">
                    {extractions.length === 0
                        ? 'No extractions — click to add'
                        : <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ whiteSpace: 'nowrap' }}>{extractions.length} extraction{extractions.length > 1 ? 's' : ''} →</span>
                            <UrlPreview url={varUrl} varMap={varMap} compact />
                        </div>
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
                                                const isEnv = val.includes('{{');
                                                updateRow(row.id, { variableName: val, targetType: isEnv ? 'env' : 'runtime' });
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

            <Handle type="source" position={Position.Right} id="right" className="node-handle-right" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="node-handle-bottom" />
        </m.div>
    );
};

export default memo(ExtractNode);
