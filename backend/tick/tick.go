package tick

import (
	"backend/presets"
	"encoding/base64"
	"encoding/json"
	"log/slog"
	"math/rand/v2"
	"time"

	"github.com/truearken/valclient/valclient"
)

const TICK_SPEED_SECONDS = 1

var val *valclient.ValClient
var websocket *valclient.LocalWebsocket

func init() {
	c, err := valclient.NewClient()
	if err != nil {
		panic(err)
	}
	val = c

	ws, err := val.GetLocalWebsocket()
	if err != nil {
		panic(err)
	}
	websocket = ws

	if err := ws.SubscribeEvent("OnJsonApiEvent_chat_v4_presences"); err != nil {
		panic(err)
	}
}

func Start() {
	ticker := time.NewTicker(TICK_SPEED_SECONDS * time.Second)
	defer ticker.Stop()

	slog.Info("waiting for pregame...")
	waitForPregame()
	slog.Info("reached pregame")

	for range ticker.C {
		match, err := val.GetPreGameMatch()
		if err != nil {
			slog.Error("error when getting pre game match", "err", err)
			break
		}

		player, err := val.GetPreGamePlayer()
		if err != nil {
			slog.Error("error when getting pre game player", "err", err)
			break
		}

		agentUuid := ""
		for _, mp := range match.AllyTeam.Players {
			if mp.Subject != player.Subject {
				continue
			}
			if mp.CharacterSelectionState != valclient.CharacterSelectionStateLocked {
				continue
			}
			agentUuid = mp.CharacterID
		}

		existingPresets, err := presets.Get()
		if err != nil {
			slog.Error("error when getting presets", "err", err)
			break
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
		if err := presets.Apply(val, selectedPreset.Loadout); err != nil {
			slog.Error("error when getting applying", "err", err)
			break
		}

		slog.Info("applied preset", "name", selectedPreset.Name, "uuid", selectedPreset.Uuid)
		break
	}

	Start()
}

func waitForPregame() {
	events := make(chan *valclient.LocalWebsocketApiEvent)
	go func() {
		if err := websocket.Read(events); err != nil {
			panic(err)
		}
	}()

	for event := range events {
		dataBytes, err := json.Marshal(event.Payload.Data)
		if err != nil {
			panic(err)
		}

		root := new(Root)
		if err := json.Unmarshal(dataBytes, &root); err != nil {
			slog.Error("error when unmarshalling event data", "err", err)
			continue
		}

		if len(root.Presences) == 0 {
			slog.Error("no presences found")
			continue
		}

		uuid := root.Presences[0].Puuid
		if uuid != val.Player.Uuid {
			continue
		}

		decodedPrivate, err := base64.StdEncoding.DecodeString(root.Presences[0].Private)
		if err != nil {
			slog.Error("failed to decode base64 data", "err", err)
			continue
		}

		privateData := new(PrivateData)
		if err := json.Unmarshal(decodedPrivate, privateData); err != nil {
			slog.Error("failed to unmarshal private JSON", "err", err)
			continue
		}

		if privateData.MatchPresenceData.SessionLoopState == "PREGAME" {
			return
		}
	}
}

type Root struct {
	Presences []Presence `json:"presences"`
}

type Presence struct {
	Puuid   string `json:"puuid"`
	Private string `json:"private"`
}

type MatchPresenceData struct {
	SessionLoopState string `json:"sessionLoopState"`
	ProvisioningFlow string `json:"provisioningFlow"`
	MatchMap         string `json:"matchMap"`
	QueueID          string `json:"queueId"`
}

type PrivateData struct {
	MatchPresenceData MatchPresenceData `json:"matchPresenceData"`
}
