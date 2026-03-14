import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useFlowStore } from '../../store/flowStore';

const ConfigPanel: React.FC = () => {
  const { selectedBlockId } = useUIStore();
  const { nodes, setNodes } = useFlowStore();

  const selectedNode = nodes.find(n => n.id === selectedBlockId);

  if (!selectedNode) return null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodes(nodes.map(n => n.id === selectedBlockId ? {
      ...n,
      data: { ...n.data, label: e.target.value }
    } : n));
  };

  return (
    <div className="config-panel">
      <div className="panel-header">
        <h3>Block Configuration</h3>
      </div>
      <div className="panel-body">
        <div className="config-field">
          <label>Label</label>
          <input
            type="text"
            value={(selectedNode.data.label as string) || ''}
            onChange={handleLabelChange}
          />
        </div>

        {selectedNode.type === 'apiRequest' && (
          <div className="config-section">
            <label>API Details</label>
            <div className="config-field">
              <label>Method</label>
              <select defaultValue="GET">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>
            <div className="config-field">
              <label>URL</label>
              <input type="text" placeholder="https://api.example.com" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;
