.PHONY:

SRC_DIR?="src"
BUILD_DIR?="build"
DIST_DIR?="dist"
CHROME_BINARY?="/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
PWD=${shell pwd}

VERSION?=${shell cat src/manifest--base.json | jq '.version'}

build-firefox:
	@printf "\e[1m\e[94m♺ Building version ${VERSION} for Firefox\e[0m"
	@mkdir -p ${BUILD_DIR}/firefox
	@yes | rm -rf "${BUILD_DIR}/firefox/*"
	@cp -r ${SRC_DIR}/* ${BUILD_DIR}/firefox
	@# Firefox needs an empty background.service_worker
	@cat ${BUILD_DIR}/firefox/manifest--base.json | jq '.background.service_worker = ""' > ${BUILD_DIR}/firefox/manifest.json
	@rm ${BUILD_DIR}/firefox/manifest--base.json
	@printf "\n\e[1m\e[32m✔ Done\e[0m\n\n"

build-chromium:
	@printf "\e[1m\e[94m♺ Building version ${VERSION} for Chromium\e[0m"
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

watch:
	@watchman --version > /dev/null 2>&1 || (printf "\e[1m\e[31mERROR: watchman is required. Please install it first.\e[0m\n"; exit 1)
	@printf "\e[1m\e[94m♺ Starting watchman… \e[0m\n"
	@watchman-make -p 'src/*' 'src/**/*' 'Makefile*' -t build-all

package-firefox:
	@printf "\e[1m\e[94m♺ Packaging version ${VERSION} for Firefox\e[0m\n"
	@mkdir -p ${DIST_DIR}
	@cd ${BUILD_DIR}/firefox/ && zip -r -FS ${PWD}/${DIST_DIR}/${VERSION}--firefox.zip ./* -x "**/.*"
	@printf "\e[1m\e[32m✔ Done\e[0m\n\n"

package-chromium:
	@printf "\e[1m\e[94m♺ Packaging version ${VERSION} for Chromium\e[0m\n"
	@mkdir -p ${DIST_DIR}
	@cd ${BUILD_DIR}/chromium/ && zip -r -FS ${PWD}/${DIST_DIR}/${VERSION}--chromium.zip ./* -x "**/.*"
	@printf "\e[1m\e[32m✔ Done\e[0m\n\n"

package-all:
	@$(MAKE) build-firefox
	@$(MAKE) package-firefox
	@$(MAKE) build-chromium
	@$(MAKE) package-chromium

run-chrome:
	@$(MAKE) build-chromium
	@printf "\e[1m\e[94m♺ Launching Chrome …\e[0m\n"
	@-${CHROME_BINARY} --user-data-dir=/tmp/mastodon-profile-redirect-dev --load-extension=${BUILD_DIR}/chromium --no-first-run &>/dev/null &
	@printf "\e[1m\e[32m✔ Done\e[0m\n\n"

run-firefox:
	@$(MAKE) build-firefox
	@printf "\e[1m\e[94m♺ Launching Firefox …\e[0m\n"
	@web-ext run &>/dev/null &
	@printf "\e[1m\e[32m✔ Done\e[0m\n\n"