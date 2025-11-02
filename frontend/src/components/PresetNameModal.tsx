"use client";

import { useState, useEffect, useRef } from 'react';

type PresetNameModalProps = {
  show: boolean;
  onCloseAction: () => void;
  onSaveAction: (name: string) => void;
  initialName?: string;
};

export default function PresetNameModal({ show, onCloseAction: onClose, onSaveAction: onSave, initialName }: PresetNameModalProps) {
  const [presetName, setPresetName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      setPresetName(initialName || '');
      inputRef.current?.focus();
    }
  }, [show, initialName]);

  const handleSave = () => {
    onSave(presetName);
    setPresetName('');
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{initialName ? 'Rename Preset' : 'Save Preset As New'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input 
              ref={inputRef}
              type="text" 
              className="form-control" 
              placeholder="Preset Name" 
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
