import { Weapon, Skin } from '@/lib/types';

type SkinListProps = {
  weapon: Weapon;
  ownedLevelIDs: string[];
  ownedChromaIDs: string[];
  onSkinSelect: (skin: Skin) => void;
  show: boolean;
  onClose: () => void;
};

export default function SkinList({ weapon, ownedLevelIDs, ownedChromaIDs, onSkinSelect, show, onClose }: SkinListProps) {
  const ownedSkins = weapon.skins.filter(skin => {
    const hasOwnedLevel = skin.levels.some(level => ownedLevelIDs.includes(level.uuid));
    const hasOwnedChroma = skin.chromas.some(chroma => ownedChromaIDs.includes(chroma.uuid));
    return (hasOwnedLevel || hasOwnedChroma);
  });

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
                  <div key={skin.uuid} className="col" onClick={() => onSkinSelect(skin)}>
                    <div className="card h-100">
                      <img src={skin.chromas[0].fullRender || skin.displayIcon} alt={skin.displayName} className="card-img-top" style={{ height: '100px', objectFit: 'contain' }} />
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
