import BlockPalette from './BlockPalette';
import CollectionTree from './CollectionTree';
import SavedFlows from './SavedFlows';
import { useUIStore } from '../../store/uiStore';

const Sidebar: React.FC = () => {
    const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

    if (!isSidebarOpen) return null;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Palette</h2>
            </div>
            <div className="sidebar-content">
                <BlockPalette />
                <div className="divider" />
                <SavedFlows />
                <div className="divider" />
                <CollectionTree />
            </div>
        </aside>
    );
};

export default Sidebar;
