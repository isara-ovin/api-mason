import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import { Repeat } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import { useExecutionStore } from '../../store/executionStore';

const PollingNode = ({ data, id }: NodeProps) => {
    const [editing, setEditing] = useState(false);
    const updateNodeData = useFlowStore(s => s.updateNodeData);
    const currentBlockId = useExecutionStore(s => s.currentBlockId);
    const isExecuting = currentBlockId === id;
    const label = (data.label as string) || 'Polling';
    const interval = (data.interval as string) || '5000';
    const condition = (data.condition as string) || '';

    return (
        <m.div
            className={`custom-node polling-node ${isExecuting ? 'node-executing' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Handle type="target" position={Position.Left} id="left" className="node-handle-left" />
            <Handle type="target" position={Position.Top} id="top" className="node-handle-top" />
            <div className="node-header" onClick={() => setEditing(e => !e)}>
                <span className="node-icon"><Repeat size={14} /></span>
                <span className="node-title">{label}</span>
            </div>
            {editing ? (
                <div className="node-inline-editor nodrag" onClick={e => e.stopPropagation()}>
                    <div className="inline-field">
                        <label className="inline-label">Name</label>
                        <input className="inline-input nodrag" value={label} onChange={e => updateNodeData(id, { label: e.target.value })} />
                    </div>
                    <div className="inline-field">
                        <label className="inline-label">Interval (ms)</label>
                        <input className="inline-input nodrag" type="number" value={interval} onChange={e => updateNodeData(id, { interval: e.target.value })} />
                    </div>
                    <div className="inline-field">
                        <label className="inline-label">Stop Condition (JSONPath)</label>
                        <input className="inline-input nodrag" value={condition} onChange={e => updateNodeData(id, { condition: e.target.value })} placeholder="$.status == 'done'" />
                    </div>
                </div>
            ) : (
                <div className="node-content">Every {interval}ms</div>
            )}
            <Handle type="source" position={Position.Right} id="right" className="node-handle-right" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="node-handle-bottom" />
        </m.div>
    );
};

export default memo(PollingNode);
