import { LoadoutItemV1, Weapon } from '@/lib/types';


type WeaponCardProps = {
    weapon: Weapon;
    onClick: () => void;
    onEditClick: () => void;
    onBuddyEditClick: () => void;
    ownedLevelIDs: string[];
    ownedChromaIDs: string[];
    selectedItem: LoadoutItemV1;
};

export default function WeaponCard({ weapon, onClick, onEditClick, onBuddyEditClick, ownedLevelIDs, ownedChromaIDs, selectedItem }: WeaponCardProps) {
    const skin = weapon.skins.find(w => w.uuid === selectedItem.skinId)!;
    const isDefaultSkin = skin.uuid === weapon.defaultSkinUuid;
    const ownedLevels = skin.levels.filter(level => ownedLevelIDs.includes(level.uuid));
    const ownedChromas = skin.chromas.filter(chroma => ownedChromaIDs.includes(chroma.uuid));
    const canEdit = !isDefaultSkin && !(ownedLevels.length === 1 && ownedChromas.length === 0);

    const chroma = skin.chromas.find(c => c.uuid === selectedItem.chromaId)!;
    const level = skin.levels.find(l => l.uuid === selectedItem.skinLevelId)!;

    const displayIcon = chroma.fullRender;
    let displayName = chroma.displayName || level.displayName || skin.displayName;
    if (skin.chromas.indexOf(chroma) === 0) {
        displayName = level.displayName || skin.displayName;
    }

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        onEditClick();
    };

    const handleBuddyEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onBuddyEditClick();
    };

    return (
        <div className="card h-100 card-hover" onClick={onClick} style={{ cursor: 'pointer' }} title={displayName}>
            <div className="card-body d-flex flex-column justify-content-center align-items-center p-2 position-relative">
                {weapon.category !== 'EEquippableCategory::Melee' && (
                    <button 
                        className="btn btn-sm btn-dark py-0 px-2"
                        style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', zIndex: 1 }}
                        onClick={handleBuddyEditClick}
                        title="Select Buddy"
                    >
                        B
                    </button>
                )}
                <img src={displayIcon} alt={displayName} className="img-fluid" style={{ height: '100px', objectFit: 'contain' }} />
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center p-1" style={{ gap: '0.5rem' }}>
                <small className="text-muted text-truncate" style={{ minWidth: 0 }}>{displayName}</small>
                {canEdit && (
                    <button className="btn btn-sm btn-secondary py-0" onClick={handleEditClick}>
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
}
