import React, { useState } from 'react';
import { useCollectionStore } from '../../store/collectionStore';
import { useUIStore } from '../../store/uiStore';
import { X, Plus, Trash2, Save, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const EnvVariablesPanel: React.FC = () => {
    const { isEnvPanelOpen, setEnvPanelOpen } = useUIStore();
    const { environments, selectedEnvironmentId, updateEnvironment } = useCollectionStore();

    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    if (!isEnvPanelOpen) return null;

    const activeEnv = environments.find(e => e.id === selectedEnvironmentId);

    if (!activeEnv) {
        return (
            <div className="env-variables-panel">
                <div className="panel-header">
                    <h3>Environment Variables</h3>
                    <button className="btn btn-ghost" onClick={() => setEnvPanelOpen(false)} title="Close">
                        <X size={16} />
                    </button>
                </div>
                <div className="panel-body empty-state">
                    Please select or create an environment to manage variables.
                </div>
            </div>
        );
    }

    const handleAddVariable = () => {
        const newVar = { key: '', value: '', enabled: true };
        updateEnvironment(activeEnv.id, {
            variables: [...activeEnv.variables, newVar]
        });
    };

    const handleUpdateVariable = (index: number, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
        const newVars = [...activeEnv.variables];
        newVars[index] = { ...newVars[index], [field]: val };
        updateEnvironment(activeEnv.id, { variables: newVars });
    };

    const handleDeleteVariable = (index: number) => {
        const newVars = [...activeEnv.variables];
        newVars.splice(index, 1);
        updateEnvironment(activeEnv.id, { variables: newVars });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:3001/api/environments/${activeEnv.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: activeEnv.name,
                    variables: activeEnv.variables
                })
            });

            if (!response.ok) throw new Error('Failed to update environment');
            toast.success('Environment variables saved!');
        } catch (error: any) {
            toast.error(`Save failed: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const filteredVariables = activeEnv.variables
        .map((v, i) => ({ ...v, _originalIndex: i }))
        .filter(v =>
            v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.value && v.value.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    return (
        <div className="env-variables-panel">
            <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', marginRight: '8px' }}>
                    <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />
                    <input
                        type="text"
                        placeholder={`Search ${activeEnv.name}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', width: '100%' }}
                    />
                </div>
                <button className="btn btn-ghost" onClick={() => setEnvPanelOpen(false)} title="Close">
                    <X size={16} />
                </button>
            </div>

            <div className="panel-body">
                <div className="env-vars-list">
                    {filteredVariables.length === 0 && (
                        <div className="empty-state">No variables found.</div>
                    )}
                    {filteredVariables.map((v) => (
                        <div key={v._originalIndex} className={`env-var-row ${!v.enabled ? 'disabled' : ''}`}>
                            <input
                                type="checkbox"
                                checked={v.enabled}
                                onChange={(e) => handleUpdateVariable(v._originalIndex, 'enabled', e.target.checked)}
                                title="Toggle Environment Variable"
                            />
                            <input
                                type="text"
                                placeholder="Key"
                                className="env-var-input key"
                                value={v.key}
                                onChange={(e) => handleUpdateVariable(v._originalIndex, 'key', e.target.value)}
                            />
                            <span className="equals">=</span>
                            <input
                                type="text"
                                placeholder="Value"
                                className="env-var-input value"
                                value={v.value}
                                onChange={(e) => handleUpdateVariable(v._originalIndex, 'value', e.target.value)}
                            />
                            <button className="btn-icon" onClick={() => handleDeleteVariable(v._originalIndex)} title="Delete Variable">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="panel-footer">
                <button className="btn btn-secondary flex-1" onClick={handleAddVariable}>
                    <Plus size={16} /> Add
                </button>
                <button className="btn btn-primary flex-1" onClick={handleSave} disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
};

export default EnvVariablesPanel;
