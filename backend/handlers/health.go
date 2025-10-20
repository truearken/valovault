package handlers

import (
	"net/http"
	"strings"

	"github.com/truearken/valclient/valclient"
)

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if _, err := h.Val.GetLocalWebsocket(); err != nil {
		if strings.Contains(err.Error(), "No connection could be made because the target machine actively refused it") {
			newVal, _ := valclient.NewClient()
			if newVal != nil {
				h.Val = newVal
			}
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
