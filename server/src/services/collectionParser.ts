import { v4 as uuidv4 } from 'uuid';

export interface ParsedRequest {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    description?: string;
}

export interface ParsedFolder {
    id: string;
    name: string;
    items: (ParsedRequest | ParsedFolder)[];
}

export interface ParsedCollection {
    id: string;
    name: string;
    items: (ParsedRequest | ParsedFolder)[];
}

/**
 * Parse a Postman Collection v2.0 / v2.1 JSON string directly.
 * Does NOT rely on the postman-collection SDK to avoid edge-case crashes.
 */
export function parsePostmanCollection(json: string): ParsedCollection {
    let collectionJson: any;
    try {
        collectionJson = JSON.parse(json);
    } catch {
        throw new Error('Invalid JSON: could not parse the file');
    }

    // Support both wrapped ({ info, item }) and bare array format
    const info = collectionJson.info || {};
    const name = info.name || collectionJson.name || 'Untitled Collection';
    const id = info._postman_id || collectionJson.id || uuidv4();

    const rawItems: any[] = collectionJson.item || collectionJson.items || [];

    return {
        id,
        name,
        items: parseItems(rawItems),
    };
}

function parseItems(items: any[]): (ParsedRequest | ParsedFolder)[] {
    if (!Array.isArray(items)) return [];

    return items
        .map(item => {
            if (!item) return null;
            // Folders have an `item` (or `items`) array
            if (Array.isArray(item.item) || Array.isArray(item.items)) {
                return {
                    id: item.id || item._postman_id || uuidv4(),
                    name: item.name || 'Folder',
                    items: parseItems(item.item || item.items || []),
                } as ParsedFolder;
            }

            // It's a request item
            return parseRequestItem(item);
        })
        .filter((i): i is ParsedRequest | ParsedFolder => i !== null);
}

function parseRequestItem(item: any): ParsedRequest | null {
    const req = item.request;
    if (!req) return null; // skip items with no request (e.g. docs-only items)

    const method = (req.method || 'GET').toUpperCase();
    const url = resolveUrl(req.url);
    if (!url) return null;

    return {
        id: item.id || item._postman_id || uuidv4(),
        name: item.name || 'Request',
        method,
        url,
        headers: resolveHeaders(req.header),
        body: resolveBody(req.body),
        description: resolveDescription(req.description),
    };
}

/**
 * Resolve the url field which can be:
 *  - A plain string: "https://example.com/path"
 *  - An object: { raw: "https://...", host: [], path: [] }
 */
function resolveUrl(url: any): string {
    if (!url) return '';
    if (typeof url === 'string') return url;
    if (url.raw) return url.raw;
    // Reconstruct from host + path arrays as fallback
    const host = Array.isArray(url.host) ? url.host.join('.') : '';
    const path = Array.isArray(url.path) ? url.path.join('/') : '';
    const protocol = url.protocol || 'https';
    if (host) return `${protocol}://${host}/${path}`;
    return '';
}

/**
 * Resolve the header field which can be:
 *  - An array of { key, value, disabled? } objects
 *  - Already a plain object
 */
function resolveHeaders(header: any): Record<string, string> {
    if (!header) return {};
    if (Array.isArray(header)) {
        return header.reduce((acc: Record<string, string>, h: any) => {
            if (h && h.key && !h.disabled) {
                acc[h.key] = h.value ?? '';
            }
            return acc;
        }, {});
    }
    if (typeof header === 'object') return header as Record<string, string>;
    return {};
}

/**
 * Resolve the body field — return a string representation.
 */
function resolveBody(body: any): string | undefined {
    if (!body) return undefined;
    if (body.mode === 'raw') {
        return body.raw || '';
    }
    if (body.mode === 'urlencoded' && Array.isArray(body.urlencoded)) {
        return body.urlencoded
            .filter((p: any) => !p.disabled)
            .map((p: any) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`)
            .join('&');
    }
    if (body.mode === 'formdata' && Array.isArray(body.formdata)) {
        return JSON.stringify(
            body.formdata
                .filter((p: any) => !p.disabled)
                .reduce((acc: any, p: any) => { acc[p.key] = p.value; return acc; }, {})
        );
    }
    if (body.mode === 'graphql') {
        return JSON.stringify(body.graphql || {});
    }
    return undefined;
}

function resolveDescription(desc: any): string | undefined {
    if (!desc) return undefined;
    if (typeof desc === 'string') return desc;
    if (desc.content) return desc.content;
    return undefined;
}
