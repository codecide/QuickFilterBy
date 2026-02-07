# QuickFilterBy Makefile
# Provides convenient build targets for the extension

.PHONY: all build clean install help test checksum

# Default target
all: build

# Build target - create the extension package
build:
	@echo "Building QuickFilterBy extension..."
	@mkdir -p dist
	@zip -r dist/QuickFilterBy.xpi \
		*.js \
		*.json \
		_locales/ \
		api/ \
		src/ \
		-x "*.DS_Store" \
		-x "dist/*" \
		-x ".git/*" \
		-x "node_modules/*" \
		-x "scripts/*" \
		-x "test/*" \
		-x "docs/*" \
		2>/dev/null || true
	@if [ ! -f "dist/QuickFilterBy.xpi" ]; then \
		echo "Build failed: Package not created"; \
		exit 1; \
	fi
	@echo "Build completed successfully!"
	@echo "  Package: dist/QuickFilterBy.xpi"
	@$(MAKE) checksum

# Clean target - remove build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist
	@echo "Clean completed."

# Install target - build and prepare for installation
install: build
	@echo "Extension ready for installation in Thunderbird"
	@echo "  Package: dist/QuickFilterBy.xpi"

# Checksum target - generate SHA-256 checksum
checksum: dist/QuickFilterBy.xpi
	@echo "Generating SHA-256 checksum..."
	@sha256sum dist/QuickFilterBy.xpi > dist/QuickFilterBy.xpi.sha256
	@echo "  Checksum: dist/QuickFilterBy.xpi.sha256"
	@echo "  Value:"
	@cat dist/QuickFilterBy.xpi.sha256 | sed 's/^/    /'

# Test target - run tests (placeholder for now)
test:
	@echo "Tests not yet configured"
	@exit 1

# Help target - show usage
help:
	@echo "QuickFilterBy Makefile"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all       Build the extension package (default)"
	@echo "  build     Build the extension package"
	@echo "  clean     Remove build artifacts"
	@echo "  install   Build and prepare for installation"
	@echo "  checksum  Generate SHA-256 checksum"
	@echo "  test      Run tests (not yet configured)"
	@echo "  help      Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make"
	@echo "  make build"
	@echo "  make clean"
	@echo "  make install"
