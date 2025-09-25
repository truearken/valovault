import { Skin, SkinLevel, Chroma } from '@/lib/types';

type LevelAndChromaSelectorProps = {
  skin: Skin;
  ownedLevelIDs: string[];
  ownedChromaIDs: string[];
  onSelect: (skinId: string, levelId: string, chromaId: string) => void;
  show: boolean;
  onClose: () => void;
};

export default function LevelAndChromaSelector({ skin, ownedLevelIDs, ownedChromaIDs, onSelect, show, onClose }: LevelAndChromaSelectorProps) {
  const ownedLevels = skin.levels.filter(level => ownedLevelIDs.includes(level.uuid));
  const ownedChromas = skin.chromas.filter(chroma => ownedChromaIDs.includes(chroma.uuid));

  const handleLevelClick = (level: SkinLevel) => {
    onSelect(skin.uuid, level.uuid, skin.chromas[0].uuid);
    onClose();
  };

  const handleChromaClick = (chroma: Chroma) => {
    onSelect(skin.uuid, skin.levels[skin.levels.length-1].uuid, chroma.uuid);
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
            <h5 className="modal-title">Levels and Chromas for {skin.displayName}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {ownedLevels.length > 0 && (
              <>
                <h6>Levels</h6>
                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                  {ownedLevels.map((level) => (
                    <div key={level.uuid} className="col" onClick={() => handleLevelClick(level)}>
                      <div className="card h-100">
                        <img src={level.displayIcon} alt={level.displayName} className="card-img-top" style={{ height: '100px', objectFit: 'contain' }} />
                        <div className="card-body p-2">
                          <p className="card-text text-center small">{level.displayName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <hr />
              </>
            )}
            {ownedChromas.length > 0 && (
              <>
                <h6>Chromas</h6>
                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                  {ownedChromas.map((chroma) => (
                    <div key={chroma.uuid} className="col" onClick={() => handleChromaClick(chroma)}>
                      <div className="card h-100">
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
          </div>
        </div>
      </div>
    </div>
  );
}
