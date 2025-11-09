"use client";

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Weapon, LoadoutItemV1, Skin } from '@/lib/types';
import WeaponCard from './WeaponCard';
import SkinList from './SkinList';
import LevelAndChromaSelector from './LevelAndChromaSelector';
import GunBuddySelectionModal from './GunBuddySelectionModal';

type WeaponGridProps = {
    onSkinSelectAction: (weaponId: string, skinId: string, levelId: string, chromaId: string) => void;
    onBuddySelectAction: (weaponId: string, charmID: string, charmLevelID: string) => void;
    currentLoadout: Record<string, LoadoutItemV1>;
    parent: Record<string, LoadoutItemV1> | undefined;
}

export default function WeaponGrid({ onSkinSelectAction, onBuddySelectAction, currentLoadout, parent }: WeaponGridProps) {
    const { weapons, ownedLevelIDs, ownedChromaIDs, loading } = useData();
    const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
    const [showSkinListModal, setShowSkinListModal] = useState(false);
    const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
    const [showLevelAndChromaModal, setShowLevelAndChromaModal] = useState(false);
    const [showBuddyModal, setShowBuddyModal] = useState(false);
    const [selectedWeaponForBuddy, setSelectedWeaponForBuddy] = useState<Weapon | null>(null);

    const handleWeaponClick = (weapon: Weapon) => {
        setSelectedWeapon(weapon);
        setShowSkinListModal(true);
    };

    const handleEditSkinClick = (weapon: Weapon, selectedItem: LoadoutItemV1) => {
        const skin = weapon.skins.find(s => s.uuid === selectedItem.skinId);
        if (skin) {
            setSelectedWeapon(weapon);
            setSelectedSkin(skin);
            setShowLevelAndChromaModal(true);
        }
    };

    const handleBuddyEditClick = (weapon: Weapon) => {
        setSelectedWeaponForBuddy(weapon);
        setShowBuddyModal(true);
    };

    const handleCloseBuddyModal = () => {
        setShowBuddyModal(false);
        setSelectedWeaponForBuddy(null);
    };

    const handleBuddySelect = (charmID: string, charmLevelID: string) => {
        if (selectedWeaponForBuddy) {
            onBuddySelectAction(selectedWeaponForBuddy.uuid, charmID, charmLevelID);
        }
        handleCloseBuddyModal();
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
        onSkinSelectAction(selectedWeapon!.uuid, skinId, levelId, chromaId);
        setShowLevelAndChromaModal(false);
    };

    const weaponCards = useMemo(() => {
        return weapons.map((weapon) => (
            <div key={weapon.uuid} className="col">
                <WeaponCard
                    weapon={weapon}
                    ownedLevelIDs={ownedLevelIDs}
                    ownedChromaIDs={ownedChromaIDs}
                    onClick={() => handleWeaponClick(weapon)}
                    onEditClick={() => handleEditSkinClick(weapon, currentLoadout[weapon.uuid])}
                    onBuddyEditClick={() => handleBuddyEditClick(weapon)}
                    selectedItem={currentLoadout[weapon.uuid]}
                    parentItem={parent ? parent[weapon.uuid] : undefined}
                />
            </div>
        ));
    }, [weapons, ownedLevelIDs, ownedChromaIDs, currentLoadout, parent]);

    if (loading) {
        return <div>Loading game data...</div>;
    }

    return (
        <div>
            <div className="row row-cols-2 row-cols-md-4 row-cols-lg-5 g-3">
                {!loading && weaponCards}
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

            {showBuddyModal && selectedWeaponForBuddy && (
                <GunBuddySelectionModal
                    onSelect={handleBuddySelect}
                    onClose={handleCloseBuddyModal}
                    weaponName={selectedWeaponForBuddy.displayName}
                    currentLoadout={currentLoadout}
                />
            )}
        </div>
    );
}
