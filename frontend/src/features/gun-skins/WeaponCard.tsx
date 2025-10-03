import { LoadoutItem, Weapon } from '@/lib/types';


type WeaponCardProps = {
    weapon: Weapon;
    onClick: () => void;
    selectedItem: LoadoutItem;
};

export default function WeaponCard({ weapon, onClick, selectedItem }: WeaponCardProps) {
    const skin = weapon.skins.find(w => w.uuid === selectedItem.skinId)!;

    const chroma = skin.chromas.find(c => c.uuid === selectedItem.chromaId)!;
    const level = skin.levels.find(l => l.uuid === selectedItem.skinLevelId)!;

    const displayIcon = chroma.fullRender;
    let displayName = chroma.displayName || level.displayName || skin.displayName;
    if (skin.chromas.indexOf(chroma) === 0) {
        displayName = level.displayName || skin.displayName;
    }

    return (
        <div className="card h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
                <img src={displayIcon} alt={displayName} className="img-fluid" style={{ height: '100px', objectFit: 'contain' }} />
            </div>
            <div className="card-footer text-center p-1">
                <small className="text-muted text-center mt-1">{displayName}</small>
            </div>
        </div>
    );
}
