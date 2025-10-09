package handlers

import (
	"backend/presets"
	"bytes"
	"io"
	"net/http"
	"os"
)

func (h *Handler) GetPresets(w http.ResponseWriter, r *http.Request) {
	data, err := presets.GetRaw()
	if err != nil {
		if os.IsNotExist(err) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Access-Control-Allow-Origin", h.Cors)
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("[]"))
			return
		}
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

func (h *Handler) PostPresets(w http.ResponseWriter, r *http.Request) {
	body := new(bytes.Buffer)
	if _, err := io.Copy(body, r.Body); err != nil {
		h.returnError(w, err)
		return
	}

	if err := presets.SaveRaw(body.Bytes()); err != nil {
		h.returnError(w, err)
		return
	}

	h.returnAny(w, "success")
}
