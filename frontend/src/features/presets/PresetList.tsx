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
    autoSelectAgent: boolean;
    onAutoSelectAgentChange: (value: boolean) => void;
};

export default function PresetList({ presets, selectedPreset, onPresetSelect, onPresetDelete, onPresetApply, onPresetRename, defaultPreset, agents, autoSelectAgent, onAutoSelectAgentChange }: PresetListProps) {
    const savedPresets = Array.isArray(presets) ? presets.filter(p => p.uuid !== 'default-preset') : [];

    const getAgentIcons = (agentIds: string[] | undefined) => {
        if (!agentIds) return null;
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
            <h5>Settings</h5>
            <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" role="switch" id="autoSelectAgentSwitch" checked={autoSelectAgent} onChange={(e) => onAutoSelectAgentChange(e.target.checked)} />
                <label className="form-check-label" htmlFor="autoSelectAgentSwitch">Auto-select agent-specific loadout</label>
            </div>
            <hr />
            <h5>Saved Presets</h5>
            {savedPresets.length === 0 ? (
                <p>No presets saved yet.</p>
            ) : (
                <div className="list-group">
                    {savedPresets.map((preset) => (
                        <div key={preset.uuid} className={`list-group-item d-flex justify-content-between align-items-center ${selectedPreset?.uuid === preset.uuid ? 'active' : ''}`}>
                            <button
                                type="button"
                                className="list-group-item-action bg-transparent border-0 text-start flex-grow-1 p-0"
                                onClick={() => onPresetSelect(preset)}
                            >
                                {preset.name}
                                <div className="mt-1">
                                    {getAgentIcons(preset.agents)}
                                </div>
                            </button>
                            <button className="btn btn-primary btn-sm me-2" onClick={() => onPresetApply(preset)}>Apply</button>
                            <button className="btn btn-secondary btn-sm me-2" onClick={() => onPresetRename(preset)}>Rename</button>
                            <button className="btn btn-danger btn-sm" onClick={() => onPresetDelete(preset.uuid)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
