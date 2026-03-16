import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

const StartNode = ({ id }: NodeProps) => {
    const currentBlockId = useExecutionStore(s => s.currentBlockId);
    const isExecuting = currentBlockId === id;

    return (
        <m.div
            className={`custom-node start-node ${isExecuting ? 'node-executing' : ''}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            <div className="node-header">
                <span className="node-icon"><Rocket size={16} /></span>
                <span className="node-title">Start</span>
            </div>
            <Handle type="source" position={Position.Right} id="right" className="node-handle-right" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="node-handle-bottom" />
        </m.div>
    );
};

export default memo(StartNode);
