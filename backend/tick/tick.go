package tick

import (
	"backend/presets"
	"backend/settings"
	"fmt"
	"io"
	"log/slog"
	"maps"
	"math/rand/v2"
	"os"
	"regexp"

	"github.com/nxadm/tail"
	"github.com/truearken/valclient/valclient"
)

type Ticker struct {
	Val              *valclient.ValClient
	stopCh           chan struct{}
	running          bool
	processedMatches map[string]string
}

func NewTicker(val *valclient.ValClient) *Ticker {
	return &Ticker{
		Val:              val,
		running:          false,
		stopCh:           make(chan struct{}),
		processedMatches: make(map[string]string),
	}
}

func (t *Ticker) Start() {
	if t.running {
		return
	}

	slog.Info("ticker started")

	logfilePath := fmt.Sprintf("%s\\%s", os.Getenv("LOCALAPPDATA"), "VALORANT\\Saved\\Logs\\ShooterGame.log")

	tailer, err := tail.TailFile(logfilePath, tail.Config{
		Follow:    true,
		ReOpen:    true,
		MustExist: false,
		Poll:      true,
		Logger:    tail.DiscardingLogger,
		Location:  &tail.SeekInfo{Offset: 0, Whence: io.SeekEnd},
	})
	if err != nil {
		slog.Error("unable to tail log file", "err", err)
		return
	}
	defer tailer.Cleanup()

	t.stopCh = make(chan struct{})
	t.running = true

	for {
		select {
		case <-t.stopCh:
			return
		case line := <-tailer.Lines:
			if line == nil || line.Err != nil {
				continue
			}

			err := t.processLogLine(line.Text)
			if err != nil {
				slog.Error("error in ticker", "err", err)
				continue
			}
		}
	}
}

var lockPattern = regexp.MustCompile(`Pregame_SelectCharacter\].*?/matches/([a-f0-9-]{36})/select/([a-f0-9-]{36})\].*?Response Code: \[200\]`)

func (t *Ticker) processLogLine(line string) error {
	matches := lockPattern.FindStringSubmatch(line)
	if matches == nil {
		return nil
	}

	matchUuid := matches[1]
	agentUuid := matches[2]

	if lastAgentUuid, ok := t.processedMatches[matchUuid]; ok {
		if lastAgentUuid == agentUuid {
			return nil
		}
	}

	slog.Info("detected agent select", "uuid", agentUuid)

	err := t.applyPresetForAgent(agentUuid)
	if err != nil {
		return err
	}

	t.processedMatches[matchUuid] = agentUuid

	return nil
}

func (t *Ticker) applyPresetForAgent(agentUuid string) error {
	settings, err := settings.Get()
	if err != nil {
		return fmt.Errorf("error when getting settings: %w", err)
	}

	if !settings.AutoSelectAgent {
		return nil
	}

	existingPresets, err := presets.Get()
	if err != nil {
		return fmt.Errorf("error when getting presets: %w", err)
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
		return nil
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
		return nil
	}

	slog.Info("found active variants for preset", "amount", variantAmount, "preset", selectedPreset.Name, "uuid", selectedPreset.Uuid)

	selectedVariant := variants[rand.IntN(variantAmount)]
	maps.Copy(selectedPreset.Loadout, selectedVariant.Loadout)
	if err := presets.Apply(t.Val, selectedPreset.Loadout); err != nil {
		return fmt.Errorf("error when applying: %w", err)
	}

	slog.Info("applied preset with variant", "name", selectedPreset.Name, "uuid", selectedPreset.Uuid, "variant", selectedVariant.Name, "variantUuid", selectedVariant.Uuid)

	return nil
}

func (t *Ticker) Stop() {
	if !t.running {
		return
	}
	close(t.stopCh)
	t.running = false
	slog.Info("ticker stopped")
}
