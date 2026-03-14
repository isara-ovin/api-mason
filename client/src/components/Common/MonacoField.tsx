import React, { useRef, useEffect, useMemo } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useCollectionStore } from '../../store/collectionStore';
import { useFlowStore } from '../../store/flowStore';

interface MonacoFieldProps {
    value: string;
    onChange: (val: string) => void;
    language?: 'json' | 'plaintext';
    height?: string;
    className?: string;
}

const MonacoField: React.FC<MonacoFieldProps> = ({
    value, onChange, language = 'json', height = '120px', className = ''
}) => {
    const monaco = useMonaco();
    const editorRef = useRef<any>(null);
    const decorationsColRef = useRef<any>(null);

    const { environments, selectedEnvironmentId } = useCollectionStore();
    const { nodes } = useFlowStore();

    // Rebuild the variable list directly for Monaco completions and decorations
    const allVars = useMemo(() => {
        const envVars = environments
            .find(e => e.id === selectedEnvironmentId)?.variables
            .filter(v => v.enabled)
            .map(v => ({ name: v.key, value: v.value, source: 'env' })) || [];

        const extractVars = nodes
            .filter(n => n.type === 'extract')
            .flatMap(n => (n.data.extractions as any[] || []).map(row => ({
                name: row.variableName || '',
                value: `from: ${row.path}`,
                source: 'runtime'
            })))
            .filter(v => v.name);

        return [...envVars, ...extractVars];
    }, [environments, selectedEnvironmentId, nodes]);

    // Keep the latest variables in a ref for the autocomplete provider to access seamlessly
    const varsRef = useRef(allVars);
    useEffect(() => {
        varsRef.current = allVars;
        updateDecorations(); // update chips if env changes
    }, [allVars]);

    // Format the value on mount if it's valid JSON
    useEffect(() => {
        if (language === 'json' && editorRef.current) {
            // Give monaco a tick to load syntax
            setTimeout(() => {
                editorRef.current?.getAction('editor.action.formatDocument')?.run();
            }, 100);
        }
    }, [language]);

    // Register a custom completion provider globally exactly once per language
    useEffect(() => {
        if (!monaco) return;

        const provider = monaco.languages.registerCompletionItemProvider(language, {
            triggerCharacters: ['{'],
            provideCompletionItems: (model, position) => {
                // Check if user just typed `{{`
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });

                const match = textUntilPosition.match(/\{\{([^}]*)$/);
                if (!match) return { suggestions: [] };

                const suggestions = varsRef.current.map(v => ({
                    label: v.name,
                    kind: monaco.languages.CompletionItemKind.Variable,
                    detail: v.source,
                    documentation: String(v.value),
                    insertText: `${v.name}}}`, // user already typed {{, so we insert the name and closing }}
                    range: new monaco.Range(
                        position.lineNumber,
                        position.column - match[1].length,
                        position.lineNumber,
                        position.column
                    )
                }));

                return { suggestions };
            }
        });

        return () => provider.dispose();
    }, [monaco, language]);

    // Update inline decorations (chips) for {{VAR}}
    const updateDecorations = () => {
        if (!editorRef.current || !monaco) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        const text = model.getValue();
        const matches = [...text.matchAll(/\{\{([^{}]+)\}\}/g)];
        const varMap = Object.fromEntries(varsRef.current.map(v => [v.name, v.value]));

        const decorations = matches.map(match => {
            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + match[0].length);
            const varName = match[1].trim();
            const isResolved = varMap[varName] !== undefined;

            return {
                range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
                options: {
                    inlineClassName: isResolved ? 'monaco-chip-resolved' : 'monaco-chip-unresolved',
                    hoverMessage: { value: isResolved ? `✓ ${varName} = "${varMap[varName]}"` : `⚠ {{${varName}}} not found in environment` }
                }
            };
        });

        if (decorationsColRef.current) {
            decorationsColRef.current.set(decorations);
        } else {
            decorationsColRef.current = editorRef.current.createDecorationsCollection(decorations);
        }
    };

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;

        // Setup formatter immediately
        if (language === 'json') {
            setTimeout(() => editor.getAction('editor.action.formatDocument')?.run(), 50);
        }

        updateDecorations();
    };

    return (
        <div className={`monaco-editor-wrapper nodrag ${className}`}>
            <Editor
                height={height}
                language={language}
                theme="vs-dark" // We can build a custom API Mason theme if needed
                value={value}
                onChange={(val) => {
                    onChange(val || '');
                    updateDecorations();
                }}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    lineNumbers: 'off',
                    folding: false,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    tabSize: 2,
                    formatOnPaste: true,
                    padding: { top: 8, bottom: 8 },
                    scrollbar: {
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6
                    },
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true
                }}
            />
        </div>
    );
};

export default MonacoField;
