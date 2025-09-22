run-backend:
	cd backend && GOOS=windows go build -o bin/valovault.exe main.go && bin/valovault.exe

run-frontend:
	cd frontend && npm run dev
