package handlers

import (
	"net/http"
)

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if _, err := h.Val.GetHelp(); err != nil {
		h.Ticker.Stop()
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	h.Ticker.Start()
	w.WriteHeader(http.StatusOK)
}
