import { useState } from 'react';
import { GunBuddy } from '@/lib/types';

type GunBuddySelectionModalProps = {
    allBuddies: GunBuddy[];
    ownedBuddies: string[];
    onSelect: (charmID: string, charmLevelID: string) => void;
    onClose: () => void;
    weaponName: string;
};

export default function GunBuddySelectionModal({ allBuddies, ownedBuddies, onSelect, onClose, weaponName }: GunBuddySelectionModalProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const ownedBuddyDetails = allBuddies.filter(b => ownedBuddies.includes(b.levels[0].uuid));

    const filteredBuddies = ownedBuddyDetails.filter(b =>
        b.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <h5 className="modal-title">Gun buddies for {weaponName}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {ownedBuddies.length === 0 ? (
                            <p>You don&apos;t own any gun buddies.</p>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search gun buddies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden', padding: '1rem' }}>
                                    {filteredBuddies.length === 0 ? (
                                        <p>No buddies found matching your search.</p>
                                    ) : (
                                        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
                                            {filteredBuddies.map((buddy) => (
                                                <div key={buddy.uuid} className="col" onClick={() => onSelect(buddy.uuid, buddy.levels[0].uuid)}>
                                                    <div className="card h-100 card-hover">
                                                        <img src={buddy.levels[0].displayIcon} alt={buddy.displayName} className="card-img-top" style={{ height: '100px', objectFit: 'contain' }} />
                                                        <div className="card-body p-2">
                                                            <p className="card-text text-center small">{buddy.displayName}</p>
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
