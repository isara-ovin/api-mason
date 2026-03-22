import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import { useExecutionStore } from '../../store/executionStore';

const TransformNode = ({ data, id }: NodeProps) => {
    const editing = !!data.editing;
    const updateNodeData = useFlowStore(s => s.updateNodeData);
    const currentBlockId = useExecutionStore(s => s.currentBlockId);
    const isExecuting = currentBlockId === id;
    const label = (data.label as string) || 'Transform';
    const expression = (data.expression as string) || '';

    return (
        <m.div
            className={`custom-node transform-node ${isExecuting ? 'node-executing' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Handle type="target" position={Position.Left} id="left" className="node-handle-left" />
            <Handle type="target" position={Position.Top} id="top" className="node-handle-top" />
            <div className="node-header" onClick={() => updateNodeData(id, { editing: !editing })}>
                <span className="node-icon"><Wrench size={14} /></span>
                <span className="node-title">{label}</span>
            </div>
            {editing ? (
                <div className="node-inline-editor nodrag" onClick={e => e.stopPropagation()}>
                    <div className="inline-field">
                        <label className="inline-label">Name</label>
                        <input className="inline-input nodrag" value={label} onChange={e => updateNodeData(id, { label: e.target.value })} />
                    </div>
                    <div className="inline-field">
                        <label className="inline-label">JSONPath Expression</label>
                        <textarea className="inline-textarea nodrag" rows={2} value={expression} onChange={e => updateNodeData(id, { expression: e.target.value })} placeholder="$.blockId.body.data" />
                    </div>
                </div>
            ) : (
                <div className="node-content">{expression || 'Click to set transform'}</div>
            )}
            <Handle type="source" position={Position.Right} id="right" className="node-handle-right" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="node-handle-bottom" />
        </m.div>
    );
};

export default memo(TransformNode);
