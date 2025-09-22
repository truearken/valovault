import { Weapon } from '@/lib/types';

type WeaponCardProps = {
  weapon: Weapon;
  onClick: () => void;
};

export default function WeaponCard({ weapon, onClick }: WeaponCardProps) {
  return (
    <div className="card h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-body d-flex justify-content-center align-items-center p-2">
        <img src={weapon.displayIcon} alt={weapon.displayName} className="img-fluid" style={{ maxHeight: '40px' }} />
      </div>
      <div className="card-footer text-center p-1">
        <small className="text-muted">{weapon.displayName}</small>
      </div>
    </div>
  );
}
