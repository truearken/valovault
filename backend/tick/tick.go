package tick

import (
	"backend/presets"
	"backend/settings"
	"log/slog"
	"maps"
	"math/rand/v2"
	"strings"
	"time"

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
	slog.Info("ticker started")

	t.stopCh = make(chan struct{})
	t.running = true

	ticker := time.NewTicker(TICK_SPEED_SECONDS * time.Second * 3)
	defer ticker.Stop()

	lastAgentUuid := ""
	for {
		select {
		case <-ticker.C:
		case <-t.stopCh:
			return
		}
		match, err := t.Val.GetPreGameMatch()
		if err != nil {
			if !strings.Contains(err.Error(), "RESOURCE_NOT_FOUND") {
				slog.Error("unable to get pregame", "err", err)
			}
			lastAgentUuid = ""
			continue
		}

		player, err := t.Val.GetPreGamePlayer()
		if err != nil {
			slog.Error("error when getting pre game player", "err", err)
			continue
		}

		agentUuid := ""
		for _, mp := range match.AllyTeam.Players {
			if mp.Subject != player.Subject {
				continue
			}
			agentUuid = mp.CharacterID
			continue
		}

		if lastAgentUuid == agentUuid {
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

		lastAgentUuid = agentUuid
	}
}

func (t *Ticker) Stop() {
	if t.running {
		close(t.stopCh)
		t.running = false
		slog.Info("ticker stopped")
	}
}
