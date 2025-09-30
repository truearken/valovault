type ErrorModalProps = {
    show: boolean;
    onClose: () => void;
    message: string;
};

export default function ErrorModal({ show, onClose, message }: ErrorModalProps) {
    if (!show) {
        return null;
    }

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Error</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}