package main

import (
	"backend/handlers"
	"backend/settings"
	"backend/tick"
	"log"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/truearken/valclient/valclient"
)

func main() {
	initLogger()

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
		log.Fatalf("unable to get settings: %v", err)
	}
	slog.Info("found settings", "settings", settings)

	h := handlers.NewHandler(val)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/health", h.Health)

	mux.HandleFunc("GET /v1/presets", h.GetPresets)
	mux.HandleFunc("POST /v1/presets", h.PostPresets)
	mux.HandleFunc("GET /v1/owned-skins", h.GetOwnedSkins)
	mux.HandleFunc("GET /v1/owned-gun-buddies", h.GetOwnedGunBuddies)
	mux.HandleFunc("GET /v1/owned-agents", h.GetOwnedAgents)
	mux.HandleFunc("GET /v1/player-loadout", h.GetPlayerLoadout)
	mux.HandleFunc("POST /v1/apply-loadout", h.PostApplyLoadout)
	mux.HandleFunc("GET /v1/settings", h.GetSettings)
	mux.HandleFunc("POST /v1/settings", h.PostSettings)

	ticker := tick.NewTicker(val)
	h.SetTicker(ticker)
	go ticker.Start()

	slog.Info("starting server")
	if err := http.ListenAndServe(":31719", logMiddleware(corsMiddleware(mux))); err != nil {
		panic(err)
	}
}

func initLogger() {
	configDir, err := os.UserConfigDir()
	if err != nil {
		log.Fatalf("unable to get config dir: %v", err)
	}

	logDir := filepath.Join(configDir, "valovault/logs")

	if err := os.MkdirAll(logDir, 0755); err != nil {
		log.Fatalf("error opening file: %v", err)
	}

	f, err := os.OpenFile(filepath.Join(logDir, time.Now().Format("2006-01-02")+".log"), os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}

	log.SetOutput(f)
}

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.String(), "/health") {
			slog.Info("request received", "path", r.Method+" "+r.URL.String())
		}
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
