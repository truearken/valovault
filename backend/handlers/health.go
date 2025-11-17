package handlers

import (
	"log/slog"
	"net/http"

	"github.com/truearken/valclient/valclient"
)

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if _, err := h.Val.GetHelp(); err != nil {
		newVal, _ := valclient.NewClient()
		if newVal != nil {
			slog.Info("valorant started, new client created")
			h.Val = newVal
		}
		defer h.Val.Close()

		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
