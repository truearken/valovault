package handlers

import (
	"backend/settings"
	"bytes"
	"io"
	"net/http"
)

func (h *Handler) GetSettings(w http.ResponseWriter, r *http.Request) {
	data, err := settings.GetRaw()
	if err != nil {
		h.returnError(w, err)
		return
	}

	if len(data) == 0 {
		data = []byte("[]")
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", h.Cors)
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (h *Handler) PostSettings(w http.ResponseWriter, r *http.Request) {
	body := new(bytes.Buffer)
	if _, err := io.Copy(body, r.Body); err != nil {
		h.returnError(w, err)
		return
	}

	if err := settings.SaveRaw(body.Bytes()); err != nil {
		h.returnError(w, err)
		return
	}

	h.returnAny(w, "success")
}
