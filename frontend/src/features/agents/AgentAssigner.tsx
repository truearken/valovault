import { useState } from 'react';
import { Agent, Preset } from '@/lib/types';
import AgentCard from './AgentCard';
import AgentSelectionModal from './AgentSelectionModal';

type AgentAssignerProps = {
  agents: Agent[];
  selectedPreset: Preset;
  assignedAgents: string[]; // array of agent IDs
  onAssignmentChange: (agentId: string, isAssigned: boolean) => void;
};

export default function AgentAssigner({ agents, selectedPreset, assignedAgents, onAssignmentChange }: AgentAssignerProps) {
  const [showModal, setShowModal] = useState(false);

  const assignedAgentDetails = agents.filter(agent => assignedAgents.includes(agent.uuid));
  const availableAgents = agents.filter(agent => !assignedAgents.includes(agent.uuid));

  const handleAddAgent = (agentId: string) => {
    onAssignmentChange(agentId, true);
  };

  const handleRemoveAgent = (agentId: string) => {
    onAssignmentChange(agentId, false);
  };

  return (
    <div className="mt-4 p-3 border">
      <h5>Assign Agents for &quot;{selectedPreset.name}&quot;</h5>
      <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
        {assignedAgentDetails.map((agent) => (
          <div key={agent.uuid} className="col">
            <AgentCard agent={agent} onRemove={handleRemoveAgent} />
          </div>
        ))}
        <div className="col">
          <div className="card h-100" onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
            <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
              <span style={{ fontSize: '4rem' }}>+</span>
            </div>
            <div className="card-footer text-center p-1">
                <small className="text-muted text-center mt-1">Add Agent</small>
            </div>
          </div>
        </div>
      </div>
      <AgentSelectionModal
        show={showModal}
        onClose={() => setShowModal(false)}
        agents={availableAgents}
        onAgentSelect={handleAddAgent}
      />
    </div>
  );
}
