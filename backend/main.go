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
	mux.HandleFunc("GET /v1/valclient/owned-skins", func(w http.ResponseWriter, r *http.Request) {
		resp, err := val.GetOwnedItems(valclient.ITEM_TYPE_SKIN_VARIANTS)	
		if err != nil {
			w.Write([]byte(err.Error()))
			return
		}

		bytes, err := json.Marshal(resp)
		if err != nil {
			w.Write([]byte(err.Error()))
			return
		}

		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Write(bytes)
	})

	slog.Info("starting server")
	if err := http.ListenAndServe(":8187", mux); err != nil {
		panic(err)
	}
}
