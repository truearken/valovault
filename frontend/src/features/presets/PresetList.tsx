import { Preset } from '@/lib/types';

type PresetListProps = {
  presets: Preset[];
  selectedPreset: Preset | null;
  onPresetSelect: (preset: Preset) => void;
  defaultPreset: Preset;
};

export default function PresetList({ presets, selectedPreset, onPresetSelect, defaultPreset }: PresetListProps) {
  const savedPresets = presets.filter(p => p.uuid !== 'default-preset');
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
            <button
              key={preset.uuid}
              type="button"
              className={`list-group-item list-group-item-action ${selectedPreset?.uuid === preset.uuid ? 'active' : ''}`}
              onClick={() => onPresetSelect(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
