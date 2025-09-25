"use client";

import { useEffect, useState } from 'react';
import { getWeapons, getOwnedSkins } from '@/services/api';
import { Weapon } from '@/lib/types';
import WeaponCard from './WeaponCard';
import SkinSelector from './SkinSelector';

type WeaponGridProps = {
    onSkinSelect: (weaponId: string, levelId: string) => void;
    currentLoadout: Record<string, string>;
}

export default function WeaponGrid({ onSkinSelect, currentLoadout }: WeaponGridProps) {
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [ownedLevelIDs, setOwnedLevelIDs] = useState<string[]>([]);
    const [ownedChromaIDs, setOwnedChromaIDs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
    const [showSkinSelectorModal, setShowSkinSelectorModal] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [fetchedWeapons, fetchedOwnedSkins] = await Promise.all([
                getWeapons(),
                getOwnedSkins(),
            ]);

            setWeapons(fetchedWeapons);
            setOwnedLevelIDs(fetchedOwnedSkins.LevelIds);
            setOwnedChromaIDs(fetchedOwnedSkins.ChromaIds);
            setLoading(false);
        }
        loadData();
    }, []);

    const handleWeaponClick = (weapon: Weapon) => {
        setSelectedWeapon(weapon);
        setShowSkinSelectorModal(true);
    };

    const handleCloseSkinSelectorModal = () => {
        setShowSkinSelectorModal(false);
    };

    if (loading) {
        return <div>Loading game data...</div>;
    }

    return (
        <div>
            <div className="row row-cols-2 row-cols-md-4 row-cols-lg-5 g-3">
                {weapons.map((weapon) => (
                    <div key={weapon.uuid} className="col">
                        <WeaponCard weapon={weapon} onClick={() => handleWeaponClick(weapon)} selectedLevelId={currentLoadout[weapon.uuid]} />
                    </div>
                ))}
            </div>

            {selectedWeapon && (
                <SkinSelector
                    weapon={selectedWeapon}
                    ownedLevelIDs={ownedLevelIDs}
                    onSkinSelect={onSkinSelect}
                    selectedSkin={currentLoadout[selectedWeapon.uuid]}
                    show={showSkinSelectorModal}
                    onClose={handleCloseSkinSelectorModal}
                />
            )}
        </div>
    );
}
