.PHONY:

SRC_DIR?="src"
BUILD_DIR?="build"
DIST_DIR?="dist"

VERSION?=${shell cat src/manifest--base.json | jq '.version'}

build-firefox:
	@printf "\e[1m\e[94m♺ Building version ${VERSION} for Firefox"
	@mkdir -p ${BUILD_DIR}/firefox
	@yes | rm -rf "${BUILD_DIR}/firefox/*"
	@cp -r ${SRC_DIR}/* ${BUILD_DIR}/firefox
	@# Firefox needs an empty background.service_worker
	@cat ${BUILD_DIR}/firefox/manifest--base.json | jq '.background.service_worker = ""' > ${BUILD_DIR}/firefox/manifest.json
	@rm ${BUILD_DIR}/firefox/manifest--base.json
	@printf "\n\e[1m\e[32m✔ Done\e[0m\n\n"

build-chromium:
	@printf "\e[1m\e[94m♺ Building version ${VERSION} for Chromium"
	@mkdir -p ${BUILD_DIR}/chromium
	@yes | rm -rf "${BUILD_DIR}/chromium/*"
	@cp -r ${SRC_DIR}/* ${BUILD_DIR}/chromium
	@# Chrome does not need .background.scripts
	@cat ${BUILD_DIR}/chromium/manifest--base.json | jq 'del(.background.scripts)' > ${BUILD_DIR}/chromium/manifest.json
	@rm ${BUILD_DIR}/chromium/manifest--base.json
	@printf "\n\e[1m\e[32m✔ Done\e[0m\n\n"

build-all:
	@$(MAKE) build-firefox
	@$(MAKE) build-chromium