import { useState } from 'react';

type HeaderProps = {
  isCreatingPreset: boolean;
  isEditing: boolean;
  onNewPreset: () => void;
  onSavePreset: (name: string) => void;
  onCancelPresetCreation: () => void;
};

export default function Header({ isCreatingPreset, isEditing, onNewPreset, onSavePreset, onCancelPresetCreation }: HeaderProps) {
  const [presetName, setPresetName] = useState('');

  const handleSave = () => {
    onSavePreset(presetName);
    setPresetName('');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">ValoVault</span>
        <div className="ms-auto">
          {!isCreatingPreset && !isEditing && (
            <button className="btn btn-primary" onClick={onNewPreset}>
              New Preset
            </button>
          )}
          {isCreatingPreset && (
            <>
              <input 
                type="text" 
                className="form-control w-auto d-inline-block me-2" 
                placeholder="Preset Name" 
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <button className="btn btn-success me-2" onClick={handleSave}>
                Save Preset
              </button>
              <button className="btn btn-secondary" onClick={onCancelPresetCreation}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
