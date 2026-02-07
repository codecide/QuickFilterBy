#!/bin/bash

# QuickFilterBy Build Script for Unix/Linux
# This script builds the QuickFilterBy.xpi package

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Display usage
usage() {
    echo "QuickFilterBy Build Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build    Build the extension package (default)"
    echo "  clean    Clean build artifacts"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0"
    echo "  $0 clean"
}

# Clean function
clean() {
    echo -e "${YELLOW}Cleaning build artifacts...${NC}"
    rm -rf dist
    echo -e "${GREEN}Clean completed.${NC}"
}

# Build function
build() {
    echo -e "${GREEN}Building QuickFilterBy extension...${NC}"

    # Create dist directory
    mkdir -p dist

    # Create zip package
    echo -e "Creating package..."
    zip -r dist/QuickFilterBy.xpi \
        *.js \
        *.json \
        _locales/ \
        api/ \
        src/ \
        options/ \
        -x "*.DS_Store" \
        -x "dist/*" \
        -x ".git/*" \
        -x "node_modules/*" \
        -x "scripts/*" \
        -x "test/*" \
        -x "docs/*" \
        2>/dev/null || true

    if [ ! -f "dist/QuickFilterBy.xpi" ]; then
        echo -e "${RED}Build failed: Package not created${NC}"
        exit 1
    fi

    # Generate SHA-256 checksum
    echo -e "Generating SHA-256 checksum..."
    sha256sum dist/QuickFilterBy.xpi > dist/QuickFilterBy.xpi.sha256

    # Display file info
    SIZE=$(du -h dist/QuickFilterBy.xpi | cut -f1)
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo -e "  Package: dist/QuickFilterBy.xpi (${SIZE})"
    echo -e "  Checksum: dist/QuickFilterBy.xpi.sha256"
    echo -e "  Checksum:"
    cat dist/QuickFilterBy.xpi.sha256 | sed 's/^/    /'
}

# Main script
main() {
    local command="${1:-build}"

    case "$command" in
        build)
            build
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown command '$command'${NC}"
            echo ""
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
