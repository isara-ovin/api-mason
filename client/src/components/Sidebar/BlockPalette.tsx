import React from 'react';
import {
    Rocket, Globe, GitBranch, Clock, Repeat, Wrench, Flag, Braces
} from 'lucide-react';

const TOOLS = [
    { type: 'start', label: 'Start', icon: Rocket },
    { type: 'apiRequest', label: 'API Request', icon: Globe },
    { type: 'ifCondition', label: 'IF Condition', icon: GitBranch },
    { type: 'delay', label: 'Delay', icon: Clock },
    { type: 'polling', label: 'Polling', icon: Repeat },
    { type: 'transform', label: 'Transform', icon: Wrench },
    { type: 'extract', label: 'Extract', icon: Braces },
    { type: 'end', label: 'End', icon: Flag },
];

const BlockPalette: React.FC = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="block-palette">
            <h3 className="sidebar-section-title">Tools</h3>
            <div className="tools-list">
                {TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <div
                            key={tool.type}
                            className="tool-item"
                            onDragStart={(event) => onDragStart(event, tool.type)}
                            draggable
                        >
                            <span className="tool-icon"><Icon size={14} strokeWidth={1.5} /></span>
                            <span className="tool-label">{tool.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BlockPalette;
