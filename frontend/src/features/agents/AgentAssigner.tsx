import { Agent, Preset } from '@/lib/types';

type AgentAssignerProps = {
  agents: Agent[];
  selectedPreset: Preset;
  assignedAgents: string[]; // array of agent IDs
  onAssignmentChange: (agentId: string, isAssigned: boolean) => void;
};

export default function AgentAssigner({ agents, selectedPreset, assignedAgents, onAssignmentChange }: AgentAssignerProps) {
  return (
    <div className="mt-4 p-3 border bg-light">
      <h5>Assign Agents for "{selectedPreset.name}"</h5>
      <div className="row">
        {agents.map((agent) => (
          <div key={agent.uuid} className="col-md-6">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`agent-check-${agent.uuid}`}
                checked={assignedAgents.includes(agent.uuid)}
                onChange={(e) => onAssignmentChange(agent.uuid, e.target.checked)}
              />
              <label className="form-check-label" htmlFor={`agent-check-${agent.uuid}`}>
                <img src={agent.displayIcon} alt={agent.displayName} width="30" className="me-2 rounded-circle" />
                {agent.displayName}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
