package handlers

import "net/http"

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if _, err := h.Val.GetLocalWebsocket(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
