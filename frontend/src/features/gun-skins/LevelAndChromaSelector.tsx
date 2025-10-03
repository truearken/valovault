import { Skin, SkinLevel, Chroma } from '@/lib/types';
import { useEffect } from 'react';
import Image from 'next/image';

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

  useEffect(() => {
    if (show && ownedLevels.length === 1 && ownedChromas.length <= 1) {
      onSelect(skin.uuid, ownedLevels[0].uuid, ownedChromas.length === 1 ? ownedChromas[0].uuid : skin.chromas[0].uuid);
      onClose();
    }
  }, [show, ownedLevels, ownedChromas, onSelect, onClose, skin.uuid, skin.chromas]);

  const handleLevelClick = (level: SkinLevel) => {
    onSelect(skin.uuid, level.uuid, skin.chromas[0].uuid);
    onClose();
  };

  const handleChromaClick = (chroma: Chroma) => {
    const levelToSelect = ownedLevels.length === 1 ? ownedLevels[0] : skin.levels[skin.levels.length - 1];
    onSelect(skin.uuid, levelToSelect.uuid, chroma.uuid);
    onClose();
  };

  if (!show || (ownedLevels.length === 1 && ownedChromas.length <= 1)) {
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
            {ownedLevels.length > 1 && (
              <>
                <h6>Levels</h6>
                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                  {ownedLevels.map((level) => (
                    <div key={level.uuid} className="col" onClick={() => handleLevelClick(level)}>
                      <div className="card h-100">
                        <Image src={skin.chromas[0].fullRender} alt={level.displayName} className="card-img-top" style={{ height: '100px', objectFit: 'contain' }} />
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
                        <Image src={chroma.fullRender} alt={chroma.displayName} className="card-img-top" style={{ height: '100px', objectFit: 'contain' }} />
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
