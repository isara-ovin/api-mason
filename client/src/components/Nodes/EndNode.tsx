import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import { Flag } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

const EndNode = ({ id }: NodeProps) => {
    const currentBlockId = useExecutionStore(s => s.currentBlockId);
    const isExecuting = currentBlockId === id;

    return (
        <m.div
            className={`custom-node end-node ${isExecuting ? 'node-executing' : ''}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            <Handle type="target" position={Position.Left} id="left" className="node-handle-left" />
            <Handle type="target" position={Position.Top} id="top" className="node-handle-top" />
            <div className="node-header">
                <span className="node-icon"><Flag size={16} /></span>
                <span className="node-title">End</span>
            </div>
        </m.div>
    );
};

export default memo(EndNode);
