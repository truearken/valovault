import { Weapon } from '@/lib/types';

type WeaponCardProps = {
  weapon: Weapon;
  onClick: () => void;
  selectedLevelId?: string;
};

export default function WeaponCard({ weapon, onClick, selectedLevelId: selectedLevelId }: WeaponCardProps) {
  const selectedSkin = selectedLevelId ? weapon.skins.find(skin => skin.levels.some(level => level.uuid === selectedLevelId)) : null;
  const selectedLevel = selectedSkin?.levels.find(level => level.uuid === selectedLevelId);

  return (
    <div className="card h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
        <img src={selectedLevel?.displayIcon || weapon.displayIcon} alt={selectedSkin?.displayName || weapon.displayName} className="img-fluid" style={{ height: '100px', objectFit: 'contain' }} />
      </div>
      <div className="card-footer text-center p-1">
        <small className="text-muted text-center mt-1">{selectedSkin?.displayName || weapon.displayName}</small>
      </div>
    </div>
  );
}
