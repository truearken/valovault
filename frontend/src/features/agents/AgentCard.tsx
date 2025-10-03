import { Agent } from '@/lib/types';
import Image from 'next/image';

type AgentCardProps = {
    agent: Agent;
    onRemove: (agentId: string) => void;
};

export default function AgentCard({ agent, onRemove }: AgentCardProps) {
    return (
        <div className="card h-100">
            <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
                <Image src={agent.displayIcon} alt={agent.displayName} className="img-fluid rounded-circle" style={{ height: '80px', width: '80px', objectFit: 'cover' }} />
            </div>
            <div className="card-footer text-center p-1">
                <small className="text-muted text-center mt-1">{agent.displayName}</small>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => onRemove(agent.uuid)} style={{ position: 'absolute', top: '5px', right: '5px' }}>
                X
            </button>
        </div>
    );
}
