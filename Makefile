run-backend:
	cd backend && air

run-frontend:
	cd frontend && npx tauri dev

deploy:
	cd frontend && npm run deploy
