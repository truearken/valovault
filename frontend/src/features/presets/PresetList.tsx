import { Preset } from '@/lib/types';

type PresetListProps = {
  presets: Preset[];
  selectedPreset: Preset | null;
  onPresetSelect: (preset: Preset) => void;
  onPresetDelete: (presetId: string) => void;
  onPresetApply: (preset: Preset) => void;
  defaultPreset: Preset;
};

export default function PresetList({ presets, selectedPreset, onPresetSelect, onPresetDelete, onPresetApply, defaultPreset }: PresetListProps) {
  const savedPresets = Array.isArray(presets) ? presets.filter(p => p.uuid !== 'default-preset') : [];
  return (
    <div>
      <div className="list-group">
        <button
          type="button"
          className={`list-group-item list-group-item-action ${selectedPreset?.uuid === defaultPreset.uuid ? 'active' : ''}`}
          onClick={() => onPresetSelect(defaultPreset)}
        >
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
            <div key={preset.uuid} className={`list-group-item d-flex justify-content-between align-items-center ${selectedPreset?.uuid === preset.uuid ? 'active' : ''}`}>
              <button
                type="button"
                className="list-group-item-action bg-transparent border-0 text-start flex-grow-1 p-0"
                onClick={() => onPresetSelect(preset)}
              >
                {preset.name}
              </button>
              <button className="btn btn-primary btn-sm me-2" onClick={() => onPresetApply(preset)}>Apply</button>
              <button className="btn btn-danger btn-sm" onClick={() => onPresetDelete(preset.uuid)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
