import axios from 'axios';
import jsonpath from 'jsonpath';

export interface ExtractionRow {
    path: string;         // JSONPath into the source block's response e.g. $.body[2].id
    variableName: string; // the name to store it under e.g. postId or AUTH0_TOKEN
    sourceBlockId?: string; // if omitted, uses the immediately preceding block
    targetType?: 'runtime' | 'env'; // 'runtime' = new var (default), 'env' = overwrite env var
}


export interface ExecutionContext {
    blocks: Record<string, any>;
    variables: Record<string, any>;   // runtime extracted vars (highest priority)
    environment: Record<string, any>; // from Postman env import
    globals: Record<string, any>;     // static globals (lowest priority)
}

export class FlowExecutor {
    private context: ExecutionContext;
    private onBlockStart?: (blockId: string) => void;
    private onBlockEnd?: (blockId: string, result: any) => void;
    private onLog?: (log: any) => void;
    private onVariable?: (key: string, value: any) => void;
    private previousBlockId: string | null = null;

    constructor(options: {
        environment?: Record<string, any>;
        onBlockStart?: (blockId: string) => void;
        onBlockEnd?: (blockId: string, result: any) => void;
        onLog?: (log: any) => void;
        onVariable?: (key: string, value: any) => void;
    }) {
        this.context = {
            blocks: {},
            variables: {},
            environment: options.environment || {},
            globals: {}
        };
        this.onBlockStart = options.onBlockStart;
        this.onBlockEnd = options.onBlockEnd;
        this.onLog = options.onLog;
        this.onVariable = options.onVariable;
    }

    async execute(nodes: any[], edges: any[]) {
        const startNode = nodes.find(n => n.type === 'start');
        if (!startNode) throw new Error('No start node found');

        let currentNode = startNode;
        this.previousBlockId = null;

        while (currentNode && currentNode.type !== 'end') {
            this.onBlockStart?.(currentNode.id);

            const result = await this.executeNode(currentNode, nodes);
            this.context.blocks[currentNode.id] = result;
            this.previousBlockId = currentNode.id;

            this.onBlockEnd?.(currentNode.id, result);

            currentNode = this.getNextNode(currentNode, result, nodes, edges);
        }

        if (currentNode?.type === 'end') {
            this.onBlockStart?.(currentNode.id);
            this.onBlockEnd?.(currentNode.id, { status: 'finished' });
        }

        return this.context;
    }

    private async executeNode(node: any, allNodes: any[]): Promise<any> {
        const { type, data } = node;

        switch (type) {
            case 'apiRequest':
                return this.handleApiRequest(data);

            case 'delay': {
                const ms = Number(data.duration) || 1000;
                await new Promise(resolve => setTimeout(resolve, ms));
                return { delayed: ms };
            }

            case 'ifCondition': {
                const conditionResult = this.evaluateCondition(data.condition);
                return { conditionMet: conditionResult };
            }

            case 'transform':
                return this.handleTransform(data.expression);

            case 'extract':
                return this.handleExtract(data, allNodes);

            case 'polling':
                // Simplified polling — runs the target URL up to maxAttempts times
                return this.handlePolling(data);

            default:
                return { status: 'skipped' };
        }
    }

    private getNextNode(currentNode: any, result: any, nodes: any[], edges: any[]) {
        if (currentNode.type === 'ifCondition') {
            const sourceHandle = result.conditionMet ? 'true' : 'false';
            const edge = edges.find(e => e.source === currentNode.id && e.sourceHandle === sourceHandle);
            return nodes.find(n => n.id === edge?.target);
        }

        const edge = edges.find(e => e.source === currentNode.id);
        return nodes.find(n => n.id === edge?.target);
    }

    private async handleApiRequest(data: any) {
        // Resolve ALL fields — URL, headers (values), and body
        const resolvedUrl = this.resolveVariables(data.url);
        const resolvedBody = this.resolveVariables(data.body);

        // Deep-resolve each header value
        const rawHeaders = data.headers || {};
        const resolvedHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(rawHeaders)) {
            resolvedHeaders[key] = this.resolveVariables(String(value));
        }

        try {
            const response = await axios({
                method: data.method || 'GET',
                url: resolvedUrl,
                data: resolvedBody,
                headers: resolvedHeaders,
                validateStatus: () => true // don't throw on 4xx/5xx
            });
            return {
                body: response.data,
                status: response.status,
                headers: response.headers
            };
        } catch (error: any) {
            return { error: error.message, status: error.response?.status };
        }
    }

    private handleExtract(data: any, allNodes: any[]): any {
        const extractions: ExtractionRow[] = data.extractions || [];
        const extracted: Record<string, any> = {};

        for (const row of extractions) {
            const sourceId = row.sourceBlockId || this.previousBlockId;
            if (!sourceId) continue;

            const sourceResult = this.context.blocks[sourceId];
            if (sourceResult === undefined) continue;

            try {
                const value = jsonpath.value(sourceResult, row.path);
                if (value !== undefined) {
                    const name = row.variableName;
                    if (row.targetType === 'env') {
                        // Overwrite the environment variable at runtime (simulates pm.environment.set)
                        this.context.environment[name] = value;
                    } else {
                        // Default: write to runtime variables (highest priority)
                        this.context.variables[name] = value;
                    }
                    extracted[name] = value;
                    this.onVariable?.(name, value);
                }
            } catch (err) {
                this.onLog?.({ blockId: data.id, message: `Extract failed for path ${row.path}: ${err}` });
            }
        }

        return { extracted };
    }

    private async handlePolling(data: any) {
        const maxAttempts = Number(data.maxAttempts) || 10;
        const intervalMs = Number(data.interval) || 5000;

        for (let i = 0; i < maxAttempts; i++) {
            const result = await this.handleApiRequest(data);
            const conditionMet = this.evaluateCondition(data.condition, result);
            if (conditionMet) return { ...result, attempts: i + 1, conditionMet: true };
            if (i < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
        }

        return { status: 'timeout', attempts: maxAttempts };
    }

    private evaluateCondition(condition: string, context?: any): boolean {
        if (!condition) return true;
        try {
            const resolved = this.resolveVariables(condition);
            // Only evaluate simple comparisons — avoid arbitrary code exec
            // eslint-disable-next-line no-new-func
            return new Function('ctx', `"use strict"; return !!(${resolved})`)(context || this.context);
        } catch {
            return false;
        }
    }

    private handleTransform(expression: string): any {
        if (!expression) return { transformed: null };
        try {
            const value = jsonpath.value(this.context.blocks, expression);
            return { transformed: value };
        } catch {
            return { transformed: null };
        }
    }

    /**
     * Resolves {{varName}} tokens using priority:
     *   1. runtime variables (from Extract blocks)
     *   2. environment variables (from Postman env import)
     *   3. globals
     * Leaves unresolved tokens as-is with the {{}} intact.
     */
    private resolveVariables(input: any): any {
        if (typeof input !== 'string') return input;

        return input.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
            const trimmed = key.trim();
            if (trimmed in this.context.variables) return String(this.context.variables[trimmed]);
            if (trimmed in this.context.environment) return String(this.context.environment[trimmed]);
            if (trimmed in this.context.globals) return String(this.context.globals[trimmed]);
            return `{{${trimmed}}}`;
        });
    }
}
