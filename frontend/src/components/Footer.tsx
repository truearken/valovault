"use client";

type FooterProps = {
  onSave: () => void;
  onCancel: () => void;
  onSaveAsNew: () => void;
};

export default function Footer({ onSave, onCancel, onSaveAsNew }: FooterProps) {
  return (
    <footer className="footer mt-auto py-3 bg-light fixed-bottom">
      <div className="container text-center">
        <button className="btn btn-primary me-2" onClick={onSave}>
          Save
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