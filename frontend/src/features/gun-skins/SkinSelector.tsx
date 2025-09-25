import { Weapon, Skin, SkinLevel, Chroma } from '@/lib/types';

type SkinSelectorProps = {
  weapon: Weapon;
  ownedLevelIDs: string[];
  ownedChromaIDs: string[];
  selectedSkin: string | undefined;
  onSkinSelect: (weaponId: string, levelOrChromaId: string) => void;
  show: boolean;
  onClose: () => void;
};

interface DisplayableLevel {
  level: SkinLevel;
  skin: Skin;
}

interface DisplayableChroma {
  chroma: Chroma;
  skin: Skin;
}

export default function SkinSelector({ weapon, ownedLevelIDs, ownedChromaIDs, selectedSkin, onSkinSelect, show, onClose }: SkinSelectorProps) {
  const displayableLevels: DisplayableLevel[] = weapon.skins.flatMap(skin =>
    skin.levels
      .filter(level => ownedLevelIDs.includes(level.uuid) && !skin.displayName.includes('Standard') && level.displayIcon)
      .map(level => ({ level, skin }))
  );

  const displayableChromas: DisplayableChroma[] = weapon.skins.flatMap(skin =>
    skin.chromas
      .filter(chroma => ownedChromaIDs.includes(chroma.uuid) && !chroma.displayName.includes('Standard') && chroma.displayIcon)
      .map(chroma => ({ chroma, skin }))
  );

  const handleSkinClick = (levelOrChromaId: string) => {
    onSkinSelect(weapon.uuid, levelOrChromaId);
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
            {displayableLevels.length > 0 && (
              <>
                <h6>Levels</h6>
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
                <hr />
              </>
            )}
            {displayableChromas.length > 0 && (
              <>
                <h6>Chromas</h6>
                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                  {displayableChromas.map(({ chroma, skin }) => (
                    <div key={chroma.uuid} className="col" onClick={() => handleSkinClick(chroma.uuid)}>
                      <div className={`card h-100 ${selectedSkin === chroma.uuid ? 'border-primary' : ''}`}>
                        <img src={chroma.displayIcon} alt={chroma.displayName} className="card-img-top" style={{ height: '100px', objectFit: 'contain' }} />
                        <div className="card-body p-2">
                          <p className="card-text text-center small">{chroma.displayName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {displayableLevels.length === 0 && displayableChromas.length === 0 && (
              <p>You don't own any skins for this weapon.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
