"use client";

interface UpdateModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    currentVersion: string;
    newVersion: string;
}

export default function UpdateModal({ show, onClose, onConfirm, currentVersion, newVersion }: UpdateModalProps) {
    if (!show) {
        return null;
    }

    const changelogUrl = `https://github.com/truearken/valovault/releases/tag/v${newVersion}`;

    return (
        <div className="modal" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Available</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p className="mb-3">
                            A new version of ValoVault is available!
                        </p>
                        <p className="mb-3">
                            <strong>v{currentVersion}</strong> → <strong>v{newVersion}</strong>
                        </p>
                        <p className="mb-0">
                            <a href={changelogUrl} target="_blank" rel="noopener noreferrer">
                                View changelog on GitHub
                            </a>
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={onConfirm}>Update Now</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Later</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
