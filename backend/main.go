package main

import (
	"backend/handlers"
	"backend/settings"
	"backend/tick"
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

	settings, err := settings.Get()
	if err != nil {
		panic(err)
	}
	slog.Info("found settings", "settings", settings)

	h := handlers.NewHandler(val)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/health", h.Health)

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
	if err := http.ListenAndServe(":3003", logMiddleware(corsMiddleware(mux))); err != nil {
		panic(err)
	}
}

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		slog.Info("request received", "path", r.Method+" "+r.URL.String())
		next.ServeHTTP(w, r)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origins := []string{"http://localhost:3000", "tauri://localhost"}
		origin := r.Header.Get("Origin")
		for _, o := range origins {
			if origin == o {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
				if r.Method == "OPTIONS" {
					w.WriteHeader(http.StatusOK)
					return
				}
				break
			}
		}
		next.ServeHTTP(w, r)
	})
}
