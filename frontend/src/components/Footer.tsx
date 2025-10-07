"use client";

type FooterProps = {
  onSave: () => void;
  onCancel: () => void;
  onSaveAsNew: () => void;
  onApply: () => void;
  showSaveButton: boolean;
};

export default function Footer({ onSave, onCancel, onSaveAsNew, onApply, showSaveButton }: FooterProps) {
  return (
    <footer className="footer mt-auto py-4 fixed-bottom" style={{ backgroundColor: 'rgba(248, 249, 250, 0.9)' }}>
      <div className="container text-center">
        {showSaveButton && <button className="btn btn-primary btn-lg me-2" onClick={onSave}>
          Save
        </button>}
        <button className="btn btn-success btn-lg me-2" onClick={onApply}>
          Apply & Save
        </button>
        <button className="btn btn-secondary btn-lg me-2" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-info btn-lg" onClick={onSaveAsNew}>
          Save as New
        </button>
      </div>
    </footer>
  );
}
