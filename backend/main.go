package main

import (
	"backend/handlers"
	"backend/tick"
	"log/slog"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/presets", handlers.GetPresets)
	mux.HandleFunc("POST /v1/presets", handlers.PostPresets)
	mux.HandleFunc("GET /v1/owned-skins", handlers.GetOwnedSkins)
	mux.HandleFunc("GET /v1/player-loadout", handlers.GetPlayerLoadout)
	mux.HandleFunc("POST /v1/apply-loadout", handlers.PostApplyLoadout)

	go tick.Start()

	slog.Info("starting server")
	if err := http.ListenAndServe(":8187", mux); err != nil {
		panic(err)
	}
}
