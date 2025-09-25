package main

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/truearken/valclient/valclient"
)

func main() {
	val, err := valclient.NewClient()
	if err != nil {
		panic(err)
	}

	mux := http.NewServeMux()

	type OwnedSkinsResponse struct {
		LevelIds   []string
		ChromaIds []string
	}

	mux.HandleFunc("GET /owned-skins", func(w http.ResponseWriter, r *http.Request) {
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
	})

	type PlayerLoadoutResponse struct {
		Loadout map[string]string
	}

	mux.HandleFunc("GET /player-loadout", func(w http.ResponseWriter, r *http.Request) {
		loadout, err := val.GetPlayerLoadout()
		if err != nil {
			returnError(w, err)
			return
		}

		resp := new(PlayerLoadoutResponse)
		resp.Loadout = map[string]string{}

		for _, g := range loadout.Guns {
			if g.ChromaID != "" {
				resp.Loadout[g.ID] = g.ChromaID
			} else {
				resp.Loadout[g.ID] = g.SkinLevelID
			}
		}

		returnAny(w, resp)
	})

	slog.Info("starting server")
	if err := http.ListenAndServe(":8187", mux); err != nil {
		panic(err)
	}
}

func returnError(w http.ResponseWriter, err error) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte(err.Error()))
}

func returnAny(w http.ResponseWriter, response any) {
	bytes, err := json.Marshal(response)
	if err != nil {
		returnError(w, err)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}
