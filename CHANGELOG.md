# Changelog

All notable changes to AI Chat for GNOME Desktop will be documented in this file.

## [Unreleased]

### Changed
- Updated UUID to `ai-chat-gnome@rumble19.gmail.com`
- Improved release process with automated zip creation
- Enhanced documentation and installation instructions

## [0.2.0] - 2025-06-20

### Added
- Reliable window toggle functionality
- Persistent cookie storage for login sessions
- Configurable window size and chat URL through preferences
- Modern ES modules support
- Proper subprocess management

### Changed
- Refactored extension architecture for better reliability
- Updated GNOME Shell support to versions 45-48
- Improved window management and state tracking

### Fixed
- Window toggle race conditions
- Subprocess lifecycle management
- Extension stability issues

## [0.1.0] - Initial Release

### Added
- Basic ChatGPT window functionality
- Panel icon integration
- Resizable window with proper controls
- GNOME Shell 44+ support

---

## Release Process

1. Update version in `metadata.json`
2. Update `CHANGELOG.md` with new version
3. Create and push a git tag: `git tag v0.2.1 && git push origin v0.2.1`
4. GitHub Actions will automatically create the release with zip file
5. Alternatively, run `./scripts/create-release.sh` for manual releases
