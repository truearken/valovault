package presets

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"

	"github.com/truearken/valclient/valclient"
)

const PRESETS_FILE_NAME = "presets_v1.json"

type PresetV1 struct {
	Uuid       string                   `json:"uuid"`
	ParentUuid string                   `json:"parentUuid"`
	Disabled   bool                     `json:"disabled"`
	Name       string                   `json:"name"`
	Loadout    map[string]LoadoutItemV1 `json:"loadout"`
	Agents     []string                 `json:"agents"`
}

type LoadoutItemV1 struct {
	SkinID       string `json:"skinId"`
	SkinLevelID  string `json:"skinLevelId"`
	ChromaID     string `json:"chromaId"`
	CharmID      string `json:"charmID,omitempty"`
	CharmLevelID string `json:"charmLevelID,omitempty"`
}

func Get(val *valclient.ValClient) ([]*PresetV1, error) {
	data, err := GetRaw(val)
	if err != nil {
		return nil, err
	}

	presets := make([]*PresetV1, 0)
	if err := json.Unmarshal(data, &presets); err != nil {
		return nil, err
	}

	return presets, nil
}

func GetRaw(val *valclient.ValClient) ([]byte, error) {
	path, err := getPath(val)
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func SaveRaw(val *valclient.ValClient, bytes []byte) error {
	path, err := getPath(val)
	if err != nil {
		return err
	}

	if err := os.WriteFile(path, bytes, 0644); err != nil {
		return err
	}

	return nil
}

func Apply(val *valclient.ValClient, newLoadout map[string]LoadoutItemV1) error {
	loadout, err := val.GetPlayerLoadout()
	if err != nil {
		return err
	}

	ownedBuddies, err := val.GetOwnedItems(valclient.ITEM_TYPE_GUN_BUDDIES)
	if err != nil {
		return err
	}

	usedInstances := map[*string]bool{}
	for _, gun := range loadout.Guns {
		item, ok := newLoadout[gun.ID]
		if !ok {
			continue
		}
		gun.SkinID = item.SkinID
		gun.SkinLevelID = item.SkinLevelID
		gun.ChromaID = item.ChromaID
		gun.CharmID = ""
		gun.CharmLevelID = ""
		gun.CharmInstanceID = ""

		for _, buddy := range ownedBuddies.Entitlements {
			if buddy.ItemID != item.CharmLevelID {
				continue
			}
			if _, used := usedInstances[buddy.InstanceID]; used {
				continue
			}
			gun.CharmID = item.CharmID
			gun.CharmLevelID = item.CharmLevelID
			gun.CharmInstanceID = *buddy.InstanceID

			usedInstances[buddy.InstanceID] = true
			break
		}
	}

	if _, err := val.SetPlayerLoadout(&valclient.SetPlayerLoadoutRequest{
		Guns:              loadout.Guns,
		ActiveExpressions: loadout.ActiveExpressions,
		Identity:          loadout.Identity,
		Incognito:         loadout.Incognito,
	}); err != nil {
		return err
	}

	return nil
}

func getPath(val *valclient.ValClient) (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	presetDir := filepath.Join(configDir, "valovault", "presets", val.Player.Uuid)
	if err := os.MkdirAll(presetDir, 0755); err != nil {
		return "", err
	}

	if err := runMigration(configDir, presetDir); err != nil {
		return "", err
	}

	return filepath.Join(presetDir, PRESETS_FILE_NAME), nil
}

func runMigration(configDir, presetDir string) error {
	oldFilePath := filepath.Join(configDir, "valovault", "presets", PRESETS_FILE_NAME)
	if _, err := os.Stat(oldFilePath); err == nil {
		oldData, err := os.ReadFile(oldFilePath)
		if err != nil {
			return err
		}

		if err := os.WriteFile(filepath.Join(presetDir, PRESETS_FILE_NAME), oldData, 0644); err != nil {
			return err
		}
		if err := os.Remove(oldFilePath); err != nil {
			return err
		}
	} else if errors.Is(err, os.ErrNotExist) {
		return nil
	} else {
		return err
	}

	return nil
}
