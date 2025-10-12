package handlers

import "net/http"

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if _, err := h.Val.GetHelp(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
