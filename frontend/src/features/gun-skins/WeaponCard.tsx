import { LoadoutItem, Weapon } from '@/lib/types';


type WeaponCardProps = {
    weapon: Weapon;
    onClick: () => void;
    onEditClick: () => void;
    ownedLevelIDs: string[];
    ownedChromaIDs: string[];
    selectedItem: LoadoutItem;
};

export default function WeaponCard({ weapon, onClick, onEditClick, ownedLevelIDs, ownedChromaIDs, selectedItem }: WeaponCardProps) {
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

    return (
        <div className="card h-100 card-hover" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
                <img src={displayIcon} alt={displayName} className="img-fluid" style={{ height: '100px', objectFit: 'contain' }} />
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center p-1">
                <small className="text-muted text-center mt-1">{displayName}</small>
                {canEdit && (
                    <button className="btn btn-sm btn-secondary py-0" onClick={handleEditClick}>
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
}
