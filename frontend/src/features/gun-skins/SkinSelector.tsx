import { Weapon } from '@/lib/types';

type SkinSelectorProps = {
  weapon: Weapon;
  ownedSkinIDs: string[];
  selectedSkin: string | undefined;
  onSkinSelect: (weaponId: string, skinId: string) => void;
  show: boolean;
  onClose: () => void;
};

export default function SkinSelector({ weapon, ownedSkinIDs, selectedSkin, onSkinSelect, show, onClose }: SkinSelectorProps) {
  // Filter skins to only include those that are owned
  const ownedSkins = weapon.skins.filter(skin => 
    skin.levels.some(level => ownedSkinIDs.includes(level.uuid))
  );

  const handleSkinClick = (skinId: string) => {
    onSkinSelect(weapon.uuid, skinId);
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
            {ownedSkins.length === 0 ? (
              <p>You don't own any skins for this weapon.</p>
            ) : (
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                {ownedSkins.map((skin) => (
                  // Filter out standard skins and skins without an icon
                  !skin.displayName.includes('Standard') && skin.displayIcon && (
                    <div key={skin.uuid} className="col" onClick={() => handleSkinClick(skin.uuid)}>
                      <div className={`card h-100 ${selectedSkin === skin.uuid ? 'border-primary' : ''}`}>
                        <img src={skin.displayIcon} alt={skin.displayName} className="card-img-top" style={{ height: '100px', objectFit: 'cover' }} />
                        <div className="card-body p-2">
                          <p className="card-text text-center small">{skin.displayName}</p>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
