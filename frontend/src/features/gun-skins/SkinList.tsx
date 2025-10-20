import { useState } from 'react';
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
    const [searchTerm, setSearchTerm] = useState('');

    const ownedSkins = weapon.skins
        .filter(skin => {
            const hasOwnedLevel = skin.levels.some(level => ownedLevelIDs.includes(level.uuid));
            const hasOwnedChroma = skin.chromas.some(chroma => ownedChromaIDs.includes(chroma.uuid));
            return (hasOwnedLevel || hasOwnedChroma);
        });

    const filteredSkins = ownedSkins.filter(skin =>
        skin.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!show) {
        return null;
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBackdropClick}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Skins for {weapon.displayName}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {ownedSkins.length === 0 ? (
                            <p>You don&apos;t own any skins for this weapon.</p>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search skins..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden', padding: '1rem' }}>
                                    {filteredSkins.length === 0 ? (
                                        <p>No skins found matching your search.</p>
                                    ) : (
                                        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                                            {filteredSkins.map((skin) => (
                                                <div key={skin.uuid} className="col" onClick={() => onSkinSelect(skin)}>
                                                    <div className="card h-100 card-hover">
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
