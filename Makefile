dist:
	@echo "\033[32mBuilding release\033[0m"
	@npm run dist
dev:
	@echo "\033[35mBuilding development\033[0m"
	@npm run dev
clean:
	@rm -f *.dist.js
	@echo "\033[32mClean complete\033[0m"