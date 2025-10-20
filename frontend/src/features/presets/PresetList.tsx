import { Preset, Agent } from '@/lib/types';


type PresetListProps = {
    presets: Preset[];
    selectedPreset: Preset | null;
    onPresetSelect: (preset: Preset) => void;
    onPresetDelete: (presetId: string) => void;
    onPresetApply: (preset: Preset) => void;
    onPresetRename: (preset: Preset) => void;
    defaultPreset: Preset;
    agents: Agent[];
};

export default function PresetList({ presets, selectedPreset, onPresetSelect, onPresetDelete, onPresetApply, onPresetRename, defaultPreset, agents }: PresetListProps) {
    const savedPresets = Array.isArray(presets) ? presets.filter(p => p.uuid !== 'default-preset') : [];

    const getAgentIcons = (agentIds: string[] | undefined) => {
        if (!agentIds) return null;

        if (agentIds.length > 3) {
            const firstTwoAgents = agentIds.slice(0, 2);
            const icons = firstTwoAgents.map(agentId => {
                const agent = agents.find(a => a.uuid === agentId);
                return agent ? <img key={agent.uuid} src={agent.displayIcon} alt={agent.displayName} width="22" className="me-1 rounded-circle" /> : null;
            });
            icons.push(<span key="plus" className="me-1 rounded-circle border d-inline-flex align-items-center justify-content-center" style={{ width: 30, height: 22 }}>+{agentIds.length - 2}</span>);
            return icons;
        }

        return agentIds.map(agentId => {
            const agent = agents.find(a => a.uuid === agentId);
            return agent ? <img key={agent.uuid} src={agent.displayIcon} alt={agent.displayName} width="22" className="me-1 rounded-circle" /> : null;
        });
    };

    return (
        <div>
            <div className="list-group">
                <button
                    type="button"
                    className={`list-group-item list-group-item-action ${selectedPreset?.uuid === defaultPreset.uuid ? 'active' : ''}`}
                    onClick={() => onPresetSelect(defaultPreset)}>
                    {defaultPreset.name}
                </button>
            </div>
            <hr />
            <h5>Saved Presets</h5>
            {savedPresets.length === 0 ? (
                <p>No presets saved yet.</p>
            ) : (
                <div className="list-group">
                    {savedPresets.map((preset) => (
                        <div key={preset.uuid} className={`list-group-item d-block d-lg-flex justify-content-between align-items-center ${selectedPreset?.uuid === preset.uuid ? 'active' : ''}`}>
                            <div className="mb-2 mb-lg-0 me-lg-3 flex-grow-1 overflow-hidden">
                                <div className="text-truncate" onClick={() => onPresetSelect(preset)} style={{ cursor: 'pointer' }}>{preset.name}</div>
                                <div className="mt-1 d-none d-lg-flex">
                                    {getAgentIcons(preset.agents)}
                                </div>
                            </div>
                            <div className="d-flex flex-shrink-0 flex-wrap gap-2">
                                <button className="btn btn-primary btn-sm" onClick={() => onPresetApply(preset)}>Apply</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => onPresetRename(preset)}>Rename</button>
                                <button className="btn btn-danger btn-sm" onClick={() => onPresetDelete(preset.uuid)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}