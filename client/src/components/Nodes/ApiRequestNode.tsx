import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps, NodeResizer } from '@xyflow/react';
import { m } from 'framer-motion';
import { Globe, ChevronRight, ChevronLeft } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import { useExecutionStore } from '../../store/executionStore';
import { useCollectionStore } from '../../store/collectionStore';
import VariablePicker from '../Common/VariablePicker';
import MonacoField from '../Common/MonacoField';

const METHOD_COLORS: Record<string, string> = {
    GET: '#10b981',
    POST: '#f59e0b',
    PUT: '#3b82f6',
    PATCH: '#8b5cf6',
    DELETE: '#ef4444',
};

/**
 * Renders a URL string with {{VAR}} tokens displayed as styled chips.
 * - Resolved vars (found in active env) → green chip showing {{VAR}} with tooltip
 * - Unresolved vars → amber chip showing {{VAR}} with warning tooltip
 */
export const UrlPreview: React.FC<{
    url: string;
    varMap: Record<string, string>;
    compact?: boolean;
}> = ({ url, varMap, compact = false }) => {
    if (!url) return <span className="request-url-preview url-empty">No URL set</span>;

    const parts = url.split(/(\{\{[^{}]+\}\})/g);

    return (
        <span className={`request-url-preview url-rich ${compact ? 'url-compact' : ''}`}>
            {parts.map((part, i) => {
                const match = part.match(/^\{\{([^{}]+)\}\}$/);
                if (!match) return <span key={i} className="url-literal">{part}</span>;

                const varName = match[1].trim();
                const resolved = varMap[varName];
                const isResolved = resolved !== undefined;

                return (
                    <span
                        key={i}
                        className={`url-var-chip ${isResolved ? 'resolved' : 'unresolved'}`}
                        data-tooltip={isResolved ? `✓ ${varName} = "${resolved}"` : `⚠ {{${varName}}} not found in active environment`}
                    >
                        {`{{${varName}}}`}
                    </span>
                );
            })}
        </span>
    );
};

const ApiRequestNode = ({ data, id, selected }: NodeProps) => {
    const expanded = !!data.expanded;
    const updateNodeData = useFlowStore(s => s.updateNodeData);
    const updateNodeDimensions = useFlowStore(s => s.updateNodeDimensions);
    const currentBlockId = useExecutionStore(s => s.currentBlockId);
    const { environments, selectedEnvironmentId } = useCollectionStore();
    const isExecuting = currentBlockId === id;

    const method = ((data.method as string) || 'GET').toUpperCase();
    const url = (data.url as string) || '';
    const label = (data.label as string) || 'API Request';
    const body = (data.body as string) || '';
    const headers = (data.headers as Record<string, string>) || {};

    const methodColor = METHOD_COLORS[method] || '#6b7280';

    // Build varMap from active env for chip rendering
    const varMap: Record<string, string> = {};
    const activeEnv = environments.find(e => e.id === selectedEnvironmentId);
    if (activeEnv?.variables) {
        for (const v of activeEnv.variables) {
            if (v.enabled !== false && v.key) varMap[v.key] = v.value ?? '';
        }
    }

    const set = useCallback((patch: Record<string, unknown>) => {
        updateNodeData(id, patch);
    }, [id, updateNodeData]);

    const toggleExpanded = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        const newExpanded = !expanded;
        updateNodeDimensions(id, newExpanded);
        set({ expanded: newExpanded });
    }, [expanded, id, updateNodeDimensions, set]);

    const showBody = ['POST', 'PUT', 'PATCH'].includes(method);

    // Check if the URL has any {{VAR}} tokens to show in edit mode
    const hasVars = /\{\{[^{}]+\}\}/.test(url);

    return (
        <m.div
            className={`custom-node api-request-node ${expanded ? 'node-expanded' : ''} ${isExecuting ? 'node-executing' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Resizer — visible when node is selected AND expanded */}
            <NodeResizer
                isVisible={!!selected && expanded}
                minWidth={240}
                minHeight={70}
                handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
                lineStyle={{ borderColor: 'var(--accent-primary)' }}
            />

            <Handle type="target" position={Position.Left} id="left" className="node-handle-left" />
            <Handle type="target" position={Position.Top} id="top" className="node-handle-top" />

            <div className="node-header" onClick={toggleExpanded}>
                <span className="node-icon"><Globe size={14} /></span>
                <span className="node-title" style={{ flex: 1 }}>{label}</span>
                <span className="node-method-badge" style={{ color: methodColor }}>{method}</span>
                {expanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </div>

            {/* Collapsed view — chip-rich URL preview */}
            {!expanded && (
                <div className="node-content">
                    <UrlPreview url={url} varMap={varMap} />
                </div>
            )}

            {/* Expanded editor */}
            {expanded && (
                <div className="node-inline-editor nodrag" onClick={e => e.stopPropagation()}>
                    <div className="inline-field">
                        <label className="inline-label">Name</label>
                        <input
                            className="inline-input nodrag"
                            value={label}
                            onChange={e => set({ label: e.target.value })}
                            placeholder="Request name"
                        />
                    </div>
                    <div className="inline-field">
                        <label className="inline-label">Method</label>
                        <select className="inline-select nodrag" value={method} onChange={e => set({ method: e.target.value })}>
                            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="inline-field">
                        <label className="inline-label">
                            URL <span className="var-hint">type {'{{'} to insert variable</span>
                        </label>
                        {/* Live chip preview in edit mode */}
                        {hasVars && (
                            <div className="url-edit-preview nodrag">
                                <UrlPreview url={url} varMap={varMap} compact />
                            </div>
                        )}
                        <VariablePicker
                            value={url}
                            onChange={v => set({ url: v })}
                            placeholder="https://{{BASE_URL}}/path"
                        />
                    </div>
                    <div className="inline-field">
                        <label className="inline-label">Headers (JSON)</label>
                        <MonacoField
                            value={typeof headers === 'object' ? JSON.stringify(headers, null, 2) : String(headers)}
                            onChange={v => set({ headers: v })}
                            language="json"
                            height="80px"
                        />
                    </div>
                    {showBody && (
                        <div className="inline-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label className="inline-label" style={{ marginBottom: 0 }}>Body (raw content)</label>
                            </div>
                            <MonacoField
                                value={body}
                                onChange={v => set({ body: v })}
                                language="json"
                                height="150px"
                            />
                        </div>
                    )}
                </div>
            )}

            <Handle type="source" position={Position.Right} id="right" className="node-handle-right" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="node-handle-bottom" />
        </m.div>
    );
};

export default memo(ApiRequestNode);
