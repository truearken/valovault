package presets

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/truearken/valclient/valclient"
)

type PresetV1 struct {
	Uuid    string                   `json:"uuid"`
	Name    string                   `json:"name"`
	Loadout map[string]LoadoutItemV1 `json:"loadout"`
	Agents  []string                 `json:"agents"`
}

type LoadoutItemV1 struct {
	SkinID      string `json:"skinId"`
	SkinLevelID string `json:"skinLevelId"`
	ChromaID    string `json:"chromaId"`
}

func Get() ([]*PresetV1, error) {
	data, err := GetRaw()
	if err != nil {
		return nil, err
	}

	presets := make([]*PresetV1, 0)
	if err := json.Unmarshal(data, &presets); err != nil {
		return nil, err
	}

	return presets, nil
}

func GetRaw() ([]byte, error) {
	presetsPath, err := getPresetsPath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(presetsPath)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func SaveRaw(bytes []byte) error {
	presetsPath, err := getPresetsPath()
	if err != nil {
		return err
	}

	if err := os.WriteFile(presetsPath, bytes, 0644); err != nil {
		return err
	}

	return nil
}

func Apply(val *valclient.ValClient, newLoadout map[string]LoadoutItemV1) error {
	loadout, err := val.GetPlayerLoadout()
	if err != nil {
		return err
	}

	for _, gun := range loadout.Guns {
		item, ok := newLoadout[gun.ID]
		if !ok {
			continue
		}
		gun.SkinID = item.SkinID
		gun.SkinLevelID = item.SkinLevelID
		gun.ChromaID = item.ChromaID
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

func getPresetsPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	valovaultDir := filepath.Join(configDir, "valovault/presets")
	if err := os.MkdirAll(valovaultDir, 0755); err != nil {
		return "", err
	}
	return filepath.Join(valovaultDir, "presets_v1.json"), nil
}
