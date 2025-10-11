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
    <footer className="footer mt-auto py-4 fixed-bottom">
      <div className="container text-center">
        {showSaveButton && <button className="btn btn-primary me-2" onClick={onSave}>
          Save
        </button>}
        <button className="btn btn-success me-2" onClick={onApply}>
          Apply & Save
        </button>
        <button className="btn btn-secondary me-2" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-info" onClick={onSaveAsNew}>
          Save as New
        </button>
      </div>
    </footer>
  );
}
