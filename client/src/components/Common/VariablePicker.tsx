import React, { useState, useRef, useEffect } from 'react';
import { useCollectionStore } from '../../store/collectionStore';
import { useFlowStore } from '../../store/flowStore';

interface VariablePickerProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    className?: string;
}

/**
 * A textarea/input wrapper that shows a {{variable}} autocomplete popup
 * when the user types `{{`. Lists variables from:
 *  - the active environment (env vars)
 *  - upstream Extract nodes in the flow graph
 */
const VariablePicker: React.FC<VariablePickerProps> = ({
    value, onChange, placeholder, multiline = false, rows = 2, className = ''
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const { environments, selectedEnvironmentId } = useCollectionStore();
    const { nodes } = useFlowStore();

    // Build the variable suggestion list
    const envVars = environments
        .find(e => e.id === selectedEnvironmentId)?.variables
        .filter(v => v.enabled)
        .map(v => ({ name: v.key, source: 'env' as const, value: v.value })) || [];

    const extractVars: { name: string; source: 'extract'; value: string }[] = nodes
        .filter(n => n.type === 'extract')
        .flatMap(n => {
            const extractions = (n.data.extractions as any[]) || [];
            return extractions.map(row => ({
                name: row.variableName || '',
                source: 'extract' as const,
                value: `from: ${row.path || 'JSONPath'}`,
            }));
        })
        .filter(v => v.name);

    const allVars = [...envVars, ...extractVars];
    const filtered = query
        ? allVars.filter(v => v.name.toLowerCase().includes(query.toLowerCase()))
        : allVars;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        onChange(val);

        // Detect if we just opened {{
        const cursorPos = e.target.selectionStart || 0;
        const before = val.slice(0, cursorPos);
        const doubleBrace = before.lastIndexOf('{{');
        if (doubleBrace !== -1 && !before.slice(doubleBrace).includes('}}')) {
            setQuery(before.slice(doubleBrace + 2));
            setShowPicker(true);
        } else {
            setShowPicker(false);
        }
    };

    const insertVariable = (varName: string) => {
        const input = inputRef.current;
        if (!input) return;

        const cursorPos = input.selectionStart || 0;
        const before = value.slice(0, cursorPos);
        const doubleBrace = before.lastIndexOf('{{');
        const newVal = value.slice(0, doubleBrace) + `{{${varName}}}` + value.slice(cursorPos);
        onChange(newVal);
        setShowPicker(false);

        // Re-focus after state update
        setTimeout(() => { input.focus(); }, 10);
    };

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!inputRef.current?.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const sharedProps = {
        ref: inputRef as any,
        value,
        onChange: handleChange,
        placeholder,
        className: `inline-input nodrag nopan ${className}`,
        style: { position: 'relative' as const },
        onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation()
    };

    return (
        <div style={{ position: 'relative' }} className="var-picker-container">
            {/* The transparent actual input for typing */}
            {multiline ? (
                <textarea {...sharedProps} rows={rows} className={`inline-textarea nodrag var-picker-transparent ${className}`} />
            ) : (
                <input {...sharedProps} className={`inline-input nodrag var-picker-transparent nopan ${className}`} />
            )}

            {/* The fake visual underlay displaying the text + chips */}
            <div className={`var-picker-visual ${multiline ? 'multiline' : 'singleline'} ${className}`}>
                {value ? (
                    value.split(/(\{\{[^{}]+\}\})/g).map((part, i) => {
                        const match = part.match(/^\{\{([^{}]+)\}\}$/);
                        if (!match) return <span key={i} className="var-literal">{part}</span>;

                        const varName = match[1].trim();
                        // See if it exists in any of our env or upstream extract sources
                        const isResolved = allVars.some(v => v.name === varName);

                        return (
                            <span
                                key={i}
                                className={`url-var-chip ${isResolved ? 'resolved' : 'unresolved'}`}
                            >
                                {`{{${varName}}}`}
                            </span>
                        );
                    })
                ) : (
                    <span className="var-placeholder">{placeholder}</span>
                )}
            </div>

            {showPicker && (filtered.length > 0 || allVars.length === 0) && (
                <div className="var-picker-dropdown nodrag">
                    {filtered.length === 0 && (
                        <div className="var-picker-empty">No matching variables</div>
                    )}
                    {filtered.map(v => (
                        <div
                            key={v.name}
                            className="var-picker-item"
                            onMouseDown={(e) => { e.preventDefault(); insertVariable(v.name); }}
                        >
                            <span className={`var-source-badge ${v.source}`}>{v.source}</span>
                            <span className="var-name">{'{{' + v.name + '}}'}</span>
                            <span className="var-value">{v.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VariablePicker;
