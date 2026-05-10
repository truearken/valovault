import Image from 'next/image';
import { Agent } from '@/lib/types';


type AgentCardProps = {
    agent: Agent;
    onRemove: (agentId: string) => void;
};

export default function AgentCard({ agent, onRemove }: AgentCardProps) {
    return (
        <div className="card card-hover position-relative">
            <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
                <Image src={agent.displayIcon} alt={agent.displayName} className="img-fluid rounded-circle" width={60} height={60} style={{ objectFit: 'cover' }} unoptimized />
            </div>
            <div className="card-footer text-center p-1">
                <small className="text-muted text-center">{agent.displayName}</small>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => onRemove(agent.uuid)} style={{ position: 'absolute', top: '2px', right: '2px', padding: '0 5px', fontSize: '0.7rem' }}>
                X
            </button>
        </div>
    );
}
