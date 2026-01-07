package tick

import (
	"backend/presets"
	"backend/settings"
	"bytes"
	"encoding/json"
	"log/slog"
	"maps"
	"math/rand/v2"

	"github.com/truearken/valclient/valclient"
)

const TICK_SPEED_SECONDS = 1

type Ticker struct {
	Val     *valclient.ValClient
	stopCh  chan struct{}
	running bool
}

func NewTicker(val *valclient.ValClient) *Ticker {
	return &Ticker{
		Val:     val,
		running: false,
		stopCh:  make(chan struct{}),
	}
}

func (t *Ticker) Start() {
	if t.running {
		return
	}

	slog.Info("ticker started")

	ws, err := t.Val.GetLocalWebsocket()
	if err != nil {
		slog.Error("unable to get websocket", "err", err)
		return
	}
	defer ws.Close()

	if err := ws.SubscribeEvent("OnJsonApiEvent"); err != nil {
		slog.Error("unable to subscribe event", "err", err)
		return
	}

	events := make(chan *valclient.LocalWebsocketApiEvent)
	go func() {
		if err := ws.Read(events); err != nil {
			slog.Info("unable to read event", "err", err)
			return
		}
	}()

	t.stopCh = make(chan struct{})
	t.running = true

	fired := false
	for {
		select {
		case <-t.stopCh:
			return
		case event := <-events:
			if event.Payload.Data == nil {
				continue
			}

			dataBytes, err := json.Marshal(event.Payload.Data)
			if err != nil {
				slog.Error("error marshalling event payload", "err", err)
				continue
			}

			if !bytes.Contains(dataBytes, []byte("ares-pregame/pregame/v1/matches")) || fired {
				fired = false
				continue
			}

			fired = true

			match, err := t.Val.GetPreGameMatch()
			if err != nil {
				slog.Info("pregame over", "err", err)
				continue
			}

			slog.Info("pregame found")

			player, err := t.Val.GetPreGamePlayer()
			if err != nil {
				slog.Error("error when getting pre game player", "err", err)
				continue
			}

			agentUuid := ""
			locked := false
			for _, mp := range match.AllyTeam.Players {
				if mp.Subject != player.Subject {
					continue
				}
				if mp.CharacterSelectionState == valclient.CharacterSelectionStateLocked {
					locked = true
				}
				agentUuid = mp.CharacterID
				continue
			}

			if locked {
				continue
			}

			settings, err := settings.Get()
			if err != nil {
				slog.Error("error when getting settings", "err", err)
				continue
			}

			if !settings.AutoSelectAgent {
				continue
			}

			existingPresets, err := presets.Get()
			if err != nil {
				slog.Error("error when getting presets", "err", err)
				continue
			}

			matchingPresets := make([]*presets.PresetV1, 0)
			for _, preset := range existingPresets {
				for _, agent := range preset.Agents {
					if agent == agentUuid {
						matchingPresets = append(matchingPresets, preset)
					}
				}
			}

			presetAmount := len(matchingPresets)
			if presetAmount == 0 {
				continue
			}
			slog.Info("found presets for agent", "amount", presetAmount)

			selectedPreset := matchingPresets[rand.IntN(presetAmount)]

			variants := make([]*presets.PresetV1, 0)
			if !selectedPreset.Disabled {
				variants = append(variants, selectedPreset)
			}

			for _, variant := range existingPresets {
				if variant.Disabled {
					continue
				}
				if variant.ParentUuid != selectedPreset.Uuid {
					continue
				}
				variants = append(variants, variant)
			}

			variantAmount := len(variants)

			if variantAmount == 0 {
				continue
			}

			slog.Info("found active variants for preset", "amount", variantAmount, "preset", selectedPreset.Name, "uuid", selectedPreset.Uuid)

			selectedVariant := variants[rand.IntN(variantAmount)]
			maps.Copy(selectedPreset.Loadout, selectedVariant.Loadout)
			if err := presets.Apply(t.Val, selectedPreset.Loadout); err != nil {
				slog.Error("error when applying", "err", err)
				continue
			}

			slog.Info("applied preset with variant", "name", selectedPreset.Name, "uuid", selectedPreset.Uuid, "variant", selectedVariant.Name, "variantUuid", selectedVariant.Uuid)
		}
	}
}

func (t *Ticker) Stop() {
	if !t.running {
		return
	}
	close(t.stopCh)
	t.running = false
	slog.Info("ticker stopped")
}
