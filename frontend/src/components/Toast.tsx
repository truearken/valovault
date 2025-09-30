import { useEffect } from 'react';

type ToastProps = {
    message: string;
    show: boolean;
    onClose: () => void;
};

export default function Toast({ message, show, onClose }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto-hide after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                    <strong className="me-auto">Success</strong>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <div className="toast-body">
                    {message}
                </div>
            </div>
        </div>
    );
}
