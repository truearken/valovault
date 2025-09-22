import { Preset } from '@/lib/types';

type PresetListProps = {
  presets: Preset[];
  selectedPreset: Preset | null;
  onPresetSelect: (preset: Preset) => void;
};

export default function PresetList({ presets, selectedPreset, onPresetSelect }: PresetListProps) {
  return (
    <div>
      <h5>Saved Presets</h5>
      {presets.length === 0 ? (
        <p>No presets saved yet.</p>
      ) : (
        <div className="list-group">
          {presets.map((preset) => (
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
