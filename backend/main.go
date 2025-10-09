package main

import (
	"backend/handlers"
	"backend/tick"
	"flag"
	"log/slog"
	"net/http"
	"time"

	"github.com/truearken/valclient/valclient"
)

func main() {
	var val *valclient.ValClient
	var err error
	slog.Info("waiting for valorant to start")
	for {
		val, err = valclient.NewClient()
		if err == nil {
			slog.Info("valorant started")
			break
		}
		time.Sleep(5 * time.Second)
	}

	cors := ""
	flag.StringVar(&cors, "cors", "https://truearken.github.io", "cors url for local testing")
	flag.Parse()

	h := handlers.NewHandler(val, cors)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/presets", h.GetPresets)
	mux.HandleFunc("POST /v1/presets", h.PostPresets)
	mux.HandleFunc("GET /v1/owned-skins", h.GetOwnedSkins)
	mux.HandleFunc("GET /v1/player-loadout", h.GetPlayerLoadout)
	mux.HandleFunc("POST /v1/apply-loadout", h.PostApplyLoadout)
	mux.HandleFunc("GET /v1/settings", h.GetSettings)
	mux.HandleFunc("POST /v1/settings", h.PostSettings)

	ticker, err := tick.NewTicker(val)
	if err != nil {
		panic(err)
	}
	go ticker.Start()

	slog.Info("starting server")
	if err := http.ListenAndServe(":8187", mux); err != nil {
		panic(err)
	}
}
