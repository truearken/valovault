PORT ?= 8000

.DEFAULT_GOAL := help

run-website:
	@echo "Serving website/ on http://localhost:$(PORT)  (Ctrl-C to stop)"
	@cd website && python3 -m http.server $(PORT) --bind 127.0.0.1
