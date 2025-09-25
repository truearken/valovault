import { Weapon } from '@/lib/types';

type WeaponCardProps = {
  weapon: Weapon;
  onClick: () => void;
  selectedId?: string;
};

export default function WeaponCard({ weapon, onClick, selectedId }: WeaponCardProps) {
  let selectedSkin = null;
  let displayIcon = weapon.displayIcon;
  let displayName = weapon.displayName;

  if (selectedId) {
    for (const skin of weapon.skins) {
      const chroma = skin.chromas.find(c => c.uuid === selectedId);
      if (chroma) {
        selectedSkin = skin;
        displayIcon = chroma.displayIcon || skin.displayIcon;
        displayName = chroma.displayName;
        break;
      }

      const level = skin.levels.find(l => l.uuid === selectedId);
      if (level) {
        selectedSkin = skin;
        displayIcon = level.displayIcon || skin.displayIcon;
        displayName = skin.displayName;
        break;
      }
    }
  }

  return (
    <div className="card h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
        <img src={displayIcon} alt={displayName} className="img-fluid" style={{ height: '100px', objectFit: 'contain' }} />
      </div>
      <div className="card-footer text-center p-1">
        <small className="text-muted text-center mt-1">{displayName}</small>
      </div>
    </div>
  );
}
