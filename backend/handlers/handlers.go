package handlers

import (
	"backend/presets"
	"bytes"
	"encoding/json"
	"flag"
	"io"
	"log/slog"
	"net/http"
	"os"

	"github.com/truearken/valclient/valclient"
)

var CORS string

var val *valclient.ValClient

func init() {
	c, err := valclient.NewClient()
	if err != nil {
		panic(err)
	}
	val = c

	flag.StringVar(&CORS, "cors", "https://truearken.github.io", "number of lines to read from the file")
	flag.Parse()
	slog.Info(CORS)
}

func GetPresets(w http.ResponseWriter, r *http.Request) {
	data, err := presets.GetRaw()
	if err != nil {
		if os.IsNotExist(err) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Access-Control-Allow-Origin", CORS)
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
	w.Header().Set("Access-Control-Allow-Origin", CORS)
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func PostPresets(w http.ResponseWriter, r *http.Request) {
	body := new(bytes.Buffer)
	if _, err := io.Copy(body, r.Body); err != nil {
		returnError(w, err)
		return
	}

	if err := presets.SaveRaw(body.Bytes()); err != nil {
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

func GetPlayerLoadout(w http.ResponseWriter, r *http.Request) {
	loadout, err := val.GetPlayerLoadout()
	if err != nil {
		returnError(w, err)
		return
	}

	resp := new(presets.PresetV1)
	resp.Loadout = make(map[string]presets.LoadoutItemV1)

	for _, g := range loadout.Guns {
		resp.Loadout[g.ID] = presets.LoadoutItemV1{
			SkinID:      g.SkinID,
			SkinLevelID: g.SkinLevelID,
			ChromaID:    g.ChromaID,
		}
	}

	returnAny(w, resp)
}

func PostApplyLoadout(w http.ResponseWriter, r *http.Request) {
	var requestLoadout map[string]presets.LoadoutItemV1
	if err := json.NewDecoder(r.Body).Decode(&requestLoadout); err != nil {
		returnError(w, err)
		return
	}

	if err := presets.Apply(val, requestLoadout); err != nil {
		returnError(w, err)
		return
	}

	returnAny(w, nil)
}

func returnError(w http.ResponseWriter, err error) {
	w.Header().Set("Access-Control-Allow-Origin", CORS)
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

	w.Header().Set("Access-Control-Allow-Origin", CORS)
	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}
