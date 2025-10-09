type SettingsCardProps = {
    autoSelectAgent: boolean;
    onAutoSelectAgentChange: (value: boolean) => void;
};

export default function SettingsCard({ autoSelectAgent, onAutoSelectAgentChange }: SettingsCardProps) {
    return (
        <div className="p-3 border bg-light mb-3">
            <h2 className="mb-3">Settings</h2>
            <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" role="switch" id="autoSelectAgentSwitch" checked={autoSelectAgent} onChange={(e) => onAutoSelectAgentChange(e.target.checked)} />
                <label className="form-check-label" htmlFor="autoSelectAgentSwitch">Auto-select agent-specific loadout</label>
            </div>
        </div>
    );
}
