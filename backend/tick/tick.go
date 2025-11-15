package tick

import (
	"backend/presets"
	"backend/settings"
	"log/slog"
	"math/rand/v2"
	"time"

	"github.com/truearken/valclient/valclient"
)

const TICK_SPEED_SECONDS = 1

type Ticker struct {
	Val *valclient.ValClient
}

func NewTicker(val *valclient.ValClient) *Ticker {
	return &Ticker{Val: val}
}

func (t *Ticker) Start() {
	ticker := time.NewTicker(TICK_SPEED_SECONDS * time.Second * 3)

	lastAgentUuid := ""
	for range ticker.C {
		match, err := t.Val.GetPreGameMatch()
		if err != nil {
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
		variants = append(variants, selectedPreset)
		for _, variant := range existingPresets {
			if variant.ParentUuid == selectedPreset.Uuid {
				variants = append(variants, variant)
			}
		}

		variantAmount := len(variants)

		if variantAmount > 0 {
			slog.Info("found variants for preset", "preset", selectedPreset.Name, "uuid", selectedPreset.Uuid, "amount", variantAmount)
			if err := presets.Apply(t.Val, selectedPreset.Loadout); err != nil {
				slog.Error("error when applying", "err", err)
				continue
			}

			selectedVariant := variants[rand.IntN(variantAmount)]
			if err := presets.Apply(t.Val, selectedVariant.Loadout); err != nil {
				slog.Error("error when applying", "err", err)
				continue
			}
			slog.Info("applied preset with variant", "name", selectedPreset.Name, "uuid", selectedPreset.Uuid, "variant", selectedVariant.Name, "variantUuid", selectedVariant.Uuid)
		} else {
			if err := presets.Apply(t.Val, selectedPreset.Loadout); err != nil {
				slog.Error("error when applying", "err", err)
				continue
			}
			slog.Info("applied preset", "name", selectedPreset.Name, "uuid", selectedPreset.Uuid)
		}

		lastAgentUuid = agentUuid
	}
}
