import { useState } from 'react';
import { Agent } from '@/lib/types';
import AgentCard from './AgentCard';
import AgentSelectionModal from './AgentSelectionModal';

type AgentAssignerProps = {
    agents: Agent[];
    assignedAgents: string[];
    onAssignmentChange: (agentIds: string[], isAssigned: boolean) => void;
    disabled?: boolean;
};

export default function AgentAssigner({ agents, assignedAgents, onAssignmentChange, disabled = false }: AgentAssignerProps) {
    const [showModal, setShowModal] = useState(false);

    const assignedAgentDetails = agents.filter(agent => assignedAgents.includes(agent.uuid));
    const availableAgents = agents.filter(agent => !assignedAgents.includes(agent.uuid));

    const handleAddAgents = (agentIds: string[]) => {
        if (disabled) return;
        onAssignmentChange(agentIds, true);
    };

    const handleRemoveAgent = (agentId: string) => {
        if (disabled) return;
        onAssignmentChange([agentId], false);
    };

    return (
        <div 
            className="border-end d-flex flex-column" 
            style={{ 
                minWidth: '180px', 
                maxWidth: '220px',
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto'
            }}
        >
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
                <div className="d-flex flex-column gap-3">
                    {assignedAgentDetails.map((agent) => (
                        <AgentCard key={agent.uuid} agent={agent} onRemove={handleRemoveAgent} />
                    ))}
                    <div className="card" onClick={() => !disabled && setShowModal(true)} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
                        <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
                            <span style={{ fontSize: '2rem' }}>+</span>
                        </div>
                        <div className="card-footer text-center p-1">
                            <small className="text-muted text-center">Add</small>
                        </div>
                    </div>
                </div>
            </div>
            <AgentSelectionModal
                show={showModal}
                onClose={() => setShowModal(false)}
                agents={availableAgents}
                onAgentSelect={handleAddAgents}
            />
        </div>
    );
}
