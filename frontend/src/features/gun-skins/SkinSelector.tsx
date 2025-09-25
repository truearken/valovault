import { Weapon, Skin, SkinLevel } from '@/lib/types';

type SkinSelectorProps = {
  weapon: Weapon;
  ownedLevelIDs: string[];
  selectedSkin: string | undefined;
  onSkinSelect: (weaponId: string, levelId: string) => void;
  show: boolean;
  onClose: () => void;
};

interface DisplayableLevel {
  level: SkinLevel;
  skin: Skin;
}

export default function SkinSelector({ weapon, ownedLevelIDs, selectedSkin, onSkinSelect, show, onClose }: SkinSelectorProps) {
  const displayableLevels: DisplayableLevel[] = weapon.skins.flatMap(skin =>
    skin.levels
      .filter(level => ownedLevelIDs.includes(level.uuid) && !skin.displayName.includes('Standard') && level.displayIcon)
      .map(level => ({ level, skin }))
  );

  const handleSkinClick = (levelId: string) => {
    onSkinSelect(weapon.uuid, levelId);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Skins for {weapon.displayName}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {displayableLevels.length === 0 ? (
              <p>You don't own any skins for this weapon.</p>
            ) : (
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                {displayableLevels.map(({ level, skin }) => (
                  <div key={level.uuid} className="col" onClick={() => handleSkinClick(level.uuid)}>
                    <div className={`card h-100 ${selectedSkin === level.uuid ? 'border-primary' : ''}`}>
                      <img src={level.displayIcon} alt={skin.displayName} className="card-img-top" style={{ height: '100px', objectFit: 'contain' }} />
                      <div className="card-body p-2">
                        <p className="card-text text-center small">{skin.displayName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
