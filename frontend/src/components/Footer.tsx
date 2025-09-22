"use client";

type FooterProps = {
  onSave: () => void;
  onCancel: () => void;
};

export default function Footer({ onSave, onCancel }: FooterProps) {
  return (
    <footer className="footer mt-auto py-3 bg-light fixed-bottom">
      <div className="container text-center">
        <button className="btn btn-primary me-2" onClick={onSave}>
          Save
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </footer>
  );
}