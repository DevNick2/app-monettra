# Build da imagem de produção (NEXT_PUBLIC_* vêm de .env.production)
build:
	docker compose --profile prod --env-file .env.production build

# Build da imagem de desenvolvimento
build-dev:
	docker compose --profile dev build

# Sobe o container de produção
run:
	docker compose --profile prod --env-file .env.production up -d

# Sobe o container de desenvolvimento (hot reload)
run-dev:
	docker compose --profile dev up -d

# Para e remove containers deste compose
stop:
	docker compose down

# Logs (todos os serviços do compose neste diretório)
watch-dev:
	docker compose --profile dev logs -f
