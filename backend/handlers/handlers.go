package handlers

import (
	"backend/presets"
	"backend/tick"
	"encoding/json"
	"net/http"
	"sync"

	"github.com/truearken/valclient/valclient"
)

type Handler struct {
	Val    *valclient.ValClient
	Ticker *tick.Ticker
	mu     sync.RWMutex
}

func NewHandler(Val *valclient.ValClient) *Handler {
	return &Handler{
		Val: Val,
	}
}

func (h *Handler) SetTicker(ticker *tick.Ticker) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.Ticker = ticker
}

func (h *Handler) RestartTicker(newVal *valclient.ValClient) {
	h.Ticker.Stop()
	h.Ticker.Start()
}

type OwnedSkinsResponse struct {
	LevelIds  []string
	ChromaIds []string
}

func (h *Handler) GetOwnedSkins(w http.ResponseWriter, r *http.Request) {
	ownedSkins, err := h.Val.GetOwnedItems(valclient.ITEM_TYPE_SKINS)
	if err != nil {
		h.returnError(w, err)
		return
	}

	chromas, err := h.Val.GetOwnedItems(valclient.ITEM_TYPE_SKIN_VARIANTS)
	if err != nil {
		h.returnError(w, err)
		return
	}

	levelIds := make([]string, 0, len(ownedSkins.Entitlements))
	for _, skin := range ownedSkins.Entitlements {
		levelIds = append(levelIds, skin.ItemID)
	}

	chromaIds := make([]string, 0, len(chromas.Entitlements))
	for _, chroma := range chromas.Entitlements {
		chromaIds = append(chromaIds, chroma.ItemID)
	}

	h.returnAny(w, &OwnedSkinsResponse{LevelIds: levelIds, ChromaIds: chromaIds})
}

type OwnedGunBuddiesResponse struct {
	LevelIds []string
}

func (h *Handler) GetOwnedGunBuddies(w http.ResponseWriter, r *http.Request) {
	ownedBuddies, err := h.Val.GetOwnedItems(valclient.ITEM_TYPE_GUN_BUDDIES)
	if err != nil {
		h.returnError(w, err)
		return
	}

	buddies := make([]string, 0, len(ownedBuddies.Entitlements))
	for _, b := range ownedBuddies.Entitlements {
		buddies = append(buddies, b.ItemID)
	}

	h.returnAny(w, &OwnedGunBuddiesResponse{LevelIds: buddies})
}

type OwnedAgentsResponse struct {
	AgentIds []string
}

func (h *Handler) GetOwnedAgents(w http.ResponseWriter, r *http.Request) {
	ownedAgents, err := h.Val.GetOwnedItems(valclient.ITEM_TYPE_AGENTS)
	if err != nil {
		h.returnError(w, err)
		return
	}

	agents := make([]string, 0, len(ownedAgents.Entitlements))
	for _, b := range ownedAgents.Entitlements {
		agents = append(agents, b.ItemID)
	}

	h.returnAny(w, &OwnedAgentsResponse{AgentIds: agents})
}

func (h *Handler) GetPlayerLoadout(w http.ResponseWriter, r *http.Request) {
	loadout, err := h.Val.GetPlayerLoadout()
	if err != nil {
		h.returnError(w, err)
		return
	}

	resp := new(presets.PresetV1)
	resp.Loadout = make(map[string]presets.LoadoutItemV1)

	for _, g := range loadout.Guns {
		resp.Loadout[g.ID] = presets.LoadoutItemV1{
			SkinID:       g.SkinID,
			SkinLevelID:  g.SkinLevelID,
			ChromaID:     g.ChromaID,
			CharmID:      g.CharmID,
			CharmLevelID: g.CharmLevelID,
		}
	}

	h.returnAny(w, resp)
}

func (h *Handler) PostApplyLoadout(w http.ResponseWriter, r *http.Request) {
	var requestLoadout map[string]presets.LoadoutItemV1
	if err := json.NewDecoder(r.Body).Decode(&requestLoadout); err != nil {
		h.returnError(w, err)
		return
	}

	if err := presets.Apply(h.Val, requestLoadout); err != nil {
		h.returnError(w, err)
		return
	}

	h.returnAny(w, nil)
}

func (h *Handler) returnError(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	msg := "an error occured" + err.Error()
	w.Write([]byte(msg))
}

func (h *Handler) returnAny(w http.ResponseWriter, response any) {
	bytes := []byte{}
	if response != nil {
		var err error
		bytes, err = json.Marshal(response)
		if err != nil {
			h.returnError(w, err)
			return
		}
	} else {
		bytes = []byte("success")
	}

	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}
