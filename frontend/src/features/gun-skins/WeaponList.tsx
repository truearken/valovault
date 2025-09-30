"use client";

import { useEffect, useState } from 'react';
import { getWeapons, getOwnedSkins } from '@/services/api';
import { Weapon, LoadoutItem, Skin } from '@/lib/types';
import WeaponCard from './WeaponCard';
import SkinList from './SkinList';
import LevelAndChromaSelector from './LevelAndChromaSelector';

type WeaponGridProps = {
    onSkinSelect: (weaponId: string, skinId: string, levelId: string, chromaId: string) => void;
    currentLoadout: Record<string, LoadoutItem>;
}

export default function WeaponGrid({ onSkinSelect, currentLoadout }: WeaponGridProps) {
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [ownedLevelIDs, setOwnedLevelIDs] = useState<string[]>([]);
    const [ownedChromaIDs, setOwnedChromaIDs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
    const [showSkinListModal, setShowSkinListModal] = useState(false);
    const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
    const [showLevelAndChromaModal, setShowLevelAndChromaModal] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [fetchedWeapons, fetchedOwnedSkins] = await Promise.all([
                getWeapons(),
                getOwnedSkins(),
            ]);

            setWeapons(fetchedWeapons);
            const ownedLevelIDs = fetchedOwnedSkins.LevelIds;
            const ownedChromaIDs = fetchedOwnedSkins.ChromaIds;
            for (const gun of fetchedWeapons) {
                const defaultSkin = gun.skins.find(s => s.uuid == gun.defaultSkinUuid)!;
                ownedLevelIDs.push(defaultSkin.levels[0].uuid)
                ownedChromaIDs.push(defaultSkin.chromas[0].uuid)
            }
            setOwnedLevelIDs(fetchedOwnedSkins.LevelIds);
            setOwnedChromaIDs(fetchedOwnedSkins.ChromaIds);
            setLoading(false);
        }
        loadData();
    }, []);

    const handleWeaponClick = (weapon: Weapon) => {
        setSelectedWeapon(weapon);
        setShowSkinListModal(true);
    };

    const handleCloseSkinListModal = () => {
        setShowSkinListModal(false);
    };

    const handleSkinSelectInList = (skin: Skin) => {
        setSelectedSkin(skin);
        setShowSkinListModal(false);
        setShowLevelAndChromaModal(true);
    };

    const handleCloseLevelAndChromaModal = () => {
        setShowLevelAndChromaModal(false);
    };

    const handleLevelAndChromaSelect = (skinId: string, levelId: string, chromaId: string) => {
        onSkinSelect(selectedWeapon!.uuid, skinId, levelId, chromaId);
        setShowLevelAndChromaModal(false);
    };

    if (loading) {
        return <div>Loading game data...</div>;
    }

    return (
        <div>
            <div className="row row-cols-2 row-cols-md-4 row-cols-lg-5 g-3">
                {weapons.map((weapon) => (
                    <div key={weapon.uuid} className="col">
                        <WeaponCard weapon={weapon} onClick={() => handleWeaponClick(weapon)} selectedItem={currentLoadout[weapon.uuid]} />
                    </div>
                ))}
            </div>

            {selectedWeapon && (
                <SkinList
                    weapon={selectedWeapon}
                    ownedLevelIDs={ownedLevelIDs}
                    ownedChromaIDs={ownedChromaIDs}
                    onSkinSelect={handleSkinSelectInList}
                    show={showSkinListModal}
                    onClose={handleCloseSkinListModal}
                />
            )}

            {selectedSkin && (
                <LevelAndChromaSelector
                    skin={selectedSkin}
                    ownedLevelIDs={ownedLevelIDs}
                    ownedChromaIDs={ownedChromaIDs}
                    onSelect={handleLevelAndChromaSelect}
                    show={showLevelAndChromaModal}
                    onClose={handleCloseLevelAndChromaModal}
                />
            )}
        </div>
    );
}
