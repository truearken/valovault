import { Agent } from '@/lib/types';

type AgentSelectionModalProps = {
    show: boolean;
    onClose: () => void;
    agents: Agent[];
    onAgentSelect: (agentId: string) => void;
};

export default function AgentSelectionModal({ show, onClose, agents, onAgentSelect }: AgentSelectionModalProps) {
    if (!show) {
        return null;
    }

    const handleAgentClick = (agentId: string) => {
        onAgentSelect(agentId);
        onClose();
    };

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Select an Agent</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                            {agents.map((agent) => (
                                <div key={agent.uuid} className="col" onClick={() => handleAgentClick(agent.uuid)}>
                                    <div className="card h-100" style={{ cursor: 'pointer' }}>
                                        <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
                                            <img src={agent.displayIcon} alt={agent.displayName} className="img-fluid rounded-circle" style={{ height: '80px', width: '80px', objectFit: 'cover' }} />
                                        </div>
                                        <div className="card-footer text-center p-1">
                                            <small className="text-muted text-center mt-1">{agent.displayName}</small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
