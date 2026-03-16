import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import { useExecutionStore } from '../../store/executionStore';

const IfConditionNode = ({ data, id }: NodeProps) => {
    const [editing, setEditing] = useState(false);
    const updateNodeData = useFlowStore(s => s.updateNodeData);
    const currentBlockId = useExecutionStore(s => s.currentBlockId);
    const isExecuting = currentBlockId === id;
    const label = (data.label as string) || 'IF Condition';
    const condition = (data.condition as string) || '';

    return (
        <m.div
            className={`custom-node if-condition-node ${isExecuting ? 'node-executing' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Handle type="target" position={Position.Left} id="left" className="node-handle-left" />
            <Handle type="target" position={Position.Top} id="top" className="node-handle-top" />
            <div className="node-header" onClick={() => setEditing(e => !e)}>
                <span className="node-icon"><GitBranch size={14} /></span>
                <span className="node-title">{label}</span>
            </div>
            {editing ? (
                <div className="node-inline-editor nodrag" onClick={e => e.stopPropagation()}>
                    <div className="inline-field">
                        <label className="inline-label">Name</label>
                        <input className="inline-input nodrag" value={label} onChange={e => updateNodeData(id, { label: e.target.value })} />
                    </div>
                    <div className="inline-field">
                        <label className="inline-label">Condition (JSONPath)</label>
                        <input className="inline-input nodrag" value={condition} onChange={e => updateNodeData(id, { condition: e.target.value })} placeholder="$.blockId.body.status == 'ok'" />
                    </div>
                </div>
            ) : (
                <div className="node-content">{condition || 'Click to set condition'}</div>
            )}
            {/* Branching outputs: True goes right, False goes bottom */}
            <div className="if-outputs">
                <div className="if-output true">
                    True
                    <Handle type="source" position={Position.Right} id="true" className="node-handle-right" />
                </div>
                <div className="if-output false">
                    False
                    <Handle type="source" position={Position.Bottom} id="false" className="node-handle-bottom" />
                </div>
            </div>
        </m.div>
    );
};

export default memo(IfConditionNode);
