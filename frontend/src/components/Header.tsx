import { useState } from 'react';

type HeaderProps = {
  isCreatingPreset: boolean;
  onNewPreset: () => void;
  onSavePreset: (name: string) => void;
  onCancel: () => void;
};

export default function Header({ isCreatingPreset, onNewPreset, onSavePreset, onCancel }: HeaderProps) {
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
          {!isCreatingPreset ? (
            <button className="btn btn-primary" onClick={onNewPreset}>
              New Preset
            </button>
          ) : (
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
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
