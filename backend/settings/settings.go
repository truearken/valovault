package settings

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
)

type Settings struct {
	AutoSelectAgent bool `json:"autoSelectAgent"`
}

func (s *Settings) Marshal() ([]byte, error) {
	return json.Marshal(s)
}

var DefaultSettings = &Settings{
	AutoSelectAgent: true,
}

func Get() (*Settings, error) {
	data, err := GetRaw()
	if err != nil {
	}

	settings := new(Settings)
	if err := json.Unmarshal(data, settings); err != nil {
		return nil, err
	}

	return settings, nil
}

func GetRaw() ([]byte, error) {
	path, err := getPath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return DefaultSettings.Marshal()
		}
		return nil, err
	}

	if bytes.Equal(data, []byte("{}")) {
		return DefaultSettings.Marshal()
	}

	return data, nil
}

func SaveRaw(bytes []byte) error {
	path, err := getPath()
	if err != nil {
		return err
	}

	if err := os.WriteFile(path, bytes, 0644); err != nil {
		return err
	}

	return nil
}

func getPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	valovaultDir := filepath.Join(configDir, "valovault/settings")
	if err := os.MkdirAll(valovaultDir, 0755); err != nil {
		return "", err
	}
	return filepath.Join(valovaultDir, "settings_v1.json"), nil
}
