import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CollectionRequest {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
}

interface CollectionFolder {
    id: string;
    name: string;
    items: (CollectionRequest | CollectionFolder)[];
}

interface Collection {
    id: string;
    name: string;
    parsed_data?: {
        items: (CollectionRequest | CollectionFolder)[];
    };
}

function isFolder(item: CollectionRequest | CollectionFolder): item is CollectionFolder {
    return 'items' in item;
}

const HTTP_BADGE_COLORS: Record<string, string> = {
    GET: '#10b981',
    POST: '#f59e0b',
    PUT: '#3b82f6',
    PATCH: '#8b5cf6',
    DELETE: '#ef4444',
    HEAD: '#6b7280',
    OPTIONS: '#6b7280',
};

const RequestRow: React.FC<{ request: CollectionRequest }> = ({ request }) => {
    const onDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/reactflow-collection-request', JSON.stringify({
            name: request.name,
            method: request.method.toUpperCase(),
            url: request.url,
            headers: request.headers || {},
            body: request.body || '',
        }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const method = (request.method || 'GET').toUpperCase();
    const color = HTTP_BADGE_COLORS[method] || '#6b7280';

    return (
        <div
            className="collection-request-row"
            draggable
            onDragStart={onDragStart}
            title={`Drag to canvas: ${method} ${request.url}`}
        >
            <span className="http-badge" style={{ color, borderColor: `${color}44`, background: `${color}18` }}>
                {method}
            </span>
            <span className="request-name">{request.name}</span>
        </div>
    );
};

const FolderNode: React.FC<{ folder: CollectionFolder; depth?: number }> = ({ folder, depth = 0 }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="collection-folder-node">
            <div
                className="collection-folder-row"
                style={{ paddingLeft: `${8 + depth * 12}px` }}
                onClick={() => setOpen(o => !o)}
            >
                {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {open ? <FolderOpen size={13} className="folder-icon" /> : <Folder size={13} className="folder-icon" />}
                <span className="folder-name">{folder.name}</span>
            </div>
            {open && (
                <div className="folder-children">
                    {folder.items.map((item: CollectionRequest | CollectionFolder) =>
                        isFolder(item) ? (
                            <FolderNode key={item.id} folder={item} depth={depth + 1} />
                        ) : (
                            <div key={item.id} style={{ paddingLeft: `${20 + (depth + 1) * 12}px` }}>
                                <RequestRow request={item as CollectionRequest} />
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

const CollectionSection: React.FC<{
    collection: Collection;
    onDelete: (id: string) => void;
}> = ({ collection, onDelete }) => {
    const [open, setOpen] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const items = collection.parsed_data?.items || [];

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirming) {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 2500); // auto-cancel after 2.5s
            return;
        }
        try {
            const res = await fetch(`/api/collections/${collection.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success(`Deleted "${collection.name}"`);
            onDelete(collection.id);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="collection-section">
            <div className="collection-header">
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 4, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
                    {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span className="collection-name">{collection.name}</span>
                </div>
                <button
                    className={`collection-delete-btn ${confirming ? 'confirming' : ''}`}
                    onClick={handleDelete}
                    title={confirming ? 'Click again to confirm delete' : 'Delete collection'}
                >
                    <Trash2 size={11} />
                    {confirming && <span style={{ fontSize: '0.6rem', marginLeft: 2 }}>Sure?</span>}
                </button>
            </div>
            {open && (
                <div className="collection-items">
                    {items.map((item: CollectionRequest | CollectionFolder) =>
                        isFolder(item) ? (
                            <FolderNode key={item.id} folder={item} />
                        ) : (
                            <div key={item.id} style={{ paddingLeft: '8px' }}>
                                <RequestRow request={item as CollectionRequest} />
                            </div>
                        )
                    )}
                    {items.length === 0 && (
                        <div className="empty-state" style={{ margin: '4px 8px' }}>No requests found</div>
                    )}
                </div>
            )}
        </div>
    );
};

const CollectionTree: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const listRes = await fetch('/api/collections');
                const list: { id: string; name: string }[] = await listRes.json();

                const detailed = await Promise.all(
                    list.map(async (col) => {
                        const res = await fetch(`/api/collections/${col.id}`);
                        return res.json() as Promise<Collection>;
                    })
                );
                setCollections(detailed);
            } catch (err) {
                console.error('Failed to fetch collections:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    const handleDelete = (id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="collection-tree mt-4">
            <h3 className="sidebar-section-title">Collections</h3>
            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : collections.length === 0 ? (
                <div className="empty-state">No collections imported yet.</div>
            ) : (
                collections.map(col => (
                    <CollectionSection key={col.id} collection={col} onDelete={handleDelete} />
                ))
            )}
        </div>
    );
};

export default CollectionTree;
