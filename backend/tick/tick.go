package tick

import (
	"log/slog"
	"time"

	"github.com/truearken/valclient/valclient"
)

const TICK_SPEED_SECONDS = 1

var val *valclient.ValClient

func init() {
	c, err := valclient.NewClient()
	if err != nil {
		panic(err)
	}
	val = c
}

func Start() {
	ticker := time.NewTicker(TICK_SPEED_SECONDS * time.Second)
	defer ticker.Stop()

	for ; true; <-ticker.C {
		slog.Info("ticking...")

		_, err := val.GetPreGameMatch()
		if err != nil {
			continue // player is not in pregame
		}

		player, err := val.GetPreGamePlayer()
		if err != nil {
			continue
		}

		slog.Info("found pregame player", "player", player)
	}
}
