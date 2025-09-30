package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/truearken/valclient/valclient"
)

var val *valclient.ValClient

func init() {
	c, err := valclient.NewClient()
	if err != nil {
		panic(err)
	}
	val = c
}

func GetPresets(w http.ResponseWriter, r *http.Request) {
	presetsPath, err := getPresetsPath()
	if err != nil {
		returnError(w, err)
		return
	}

	data, err := os.ReadFile(presetsPath)
	if err != nil {
		if os.IsNotExist(err) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("[]"))
			return
		}
		returnError(w, err)
		return
	}

	if len(data) == 0 {
		data = []byte("[]")
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func PostPresets(w http.ResponseWriter, r *http.Request) {
	presetsPath, err := getPresetsPath()
	if err != nil {
		returnError(w, err)
		return
	}

	body := new(bytes.Buffer)
	if _, err := io.Copy(body, r.Body); err != nil {
		returnError(w, err)
		return
	}

	if err := os.WriteFile(presetsPath, body.Bytes(), 0644); err != nil {
		returnError(w, err)
		return
	}

	returnAny(w, "success")
}

type OwnedSkinsResponse struct {
	LevelIds  []string
	ChromaIds []string
}

func GetOwnedSkins(w http.ResponseWriter, r *http.Request) {
	skins, err := val.GetOwnedItems(valclient.ITEM_TYPE_SKINS)
	if err != nil {
		returnError(w, err)
		return
	}

	chromas, err := val.GetOwnedItems(valclient.ITEM_TYPE_SKIN_VARIANTS)
	if err != nil {
		returnError(w, err)
		return
	}

	levelIds := make([]string, 0, len(skins.Entitlements))
	for _, skin := range skins.Entitlements {
		levelIds = append(levelIds, skin.ItemID)
	}

	chromaIds := make([]string, 0, len(chromas.Entitlements))
	for _, chroma := range chromas.Entitlements {
		chromaIds = append(chromaIds, chroma.ItemID)
	}

	returnAny(w, &OwnedSkinsResponse{LevelIds: levelIds, ChromaIds: chromaIds})
}

type LoadoutItem struct {
	SkinID      string `json:"skinId"`
	SkinLevelID string `json:"skinLevelId"`
	ChromaID    string `json:"chromaId"`
}

type PlayerLoadoutMessage struct {
	Loadout map[string]LoadoutItem
}

func GetPlayerLoadout(w http.ResponseWriter, r *http.Request) {
	loadout, err := val.GetPlayerLoadout()
	if err != nil {
		returnError(w, err)
		return
	}

	resp := new(PlayerLoadoutMessage)
	resp.Loadout = make(map[string]LoadoutItem)

	for _, g := range loadout.Guns {
		resp.Loadout[g.ID] = LoadoutItem{
			SkinID:      g.SkinID,
			SkinLevelID: g.SkinLevelID,
			ChromaID:    g.ChromaID,
		}
	}

	returnAny(w, resp)
}

func PostApplyLoadout(w http.ResponseWriter, r *http.Request) {
	var requestLoadout map[string]LoadoutItem
	if err := json.NewDecoder(r.Body).Decode(&requestLoadout); err != nil {
		returnError(w, err)
		return
	}

	loadout, err := val.GetPlayerLoadout()
	if err != nil {
		returnError(w, err)
		return
	}

	for _, gun := range loadout.Guns {
		item, ok := requestLoadout[gun.ID]
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
		returnError(w, err)
		return
	}

	returnAny(w, nil)
}

func returnError(w http.ResponseWriter, err error) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3001")
	w.WriteHeader(http.StatusInternalServerError)
	msg := "an error occured" + err.Error()
	w.Write([]byte(msg))
}

func returnAny(w http.ResponseWriter, response any) {
	bytes := []byte{}
	if response != nil {
		var err error
		bytes, err = json.Marshal(response)
		if err != nil {
			returnError(w, err)
			return
		}
	} else {
		bytes = []byte("success")
	}

	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}

func getPresetsPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	valovaultDir := filepath.Join(configDir, "valovault")
	if err := os.MkdirAll(valovaultDir, 0755); err != nil {
		return "", err
	}
	return filepath.Join(valovaultDir, "presets.json"), nil
}
