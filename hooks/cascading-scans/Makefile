#!/usr/bin/make -f
#
# SPDX-FileCopyrightText: 2021 iteratec GmbH
#
# SPDX-License-Identifier: Apache-2.0
#

include_guard = set
hook = cascading-scans

include ../../hooks.mk

test-2: | clean-integration-tests unit-tests docker-build docker-export kind-import deploy deploy-test-deps-2 integration-tests-2

deploy-test-dep-nmap:
	cd ../../scanners/nmap/ && $(MAKE) -s docker-build docker-export kind-import && \
	helm -n integration-tests upgrade --install nmap . \
		--set="scanner.image.repository=docker.io/$(IMG_NS)/$(scanner-prefix)-nmap" \
		--set="parser.image.repository=docker.io/$(IMG_NS)/$(parser-prefix)-nmap" \
		--set="parser.image.tag=$(IMG_TAG)" \
		--set="scanner.image.tag=$(IMG_TAG)" \
		--set="parser.env[0].name=CRASH_ON_FAILED_VALIDATION" \
		--set-string="parser.env[0].value=true"

deploy-test-dep-ncrack:
	printf "root\nadmin\n" > users.txt
	printf "THEPASSWORDYOUCREATED\n123456\npassword\n" > passwords.txt
	kubectl create secret generic --from-file users.txt --from-file passwords.txt ncrack-lists -n integration-tests --dry-run=client -o yaml | kubectl apply -f -
	cd ../../scanners/ncrack/ && $(MAKE) -s docker-build docker-export kind-import && \
	helm -n integration-tests upgrade --install ncrack . \
		--set="scanner.image.repository=docker.io/$(IMG_NS)/$(scanner-prefix)-ncrack" \
		--set="parser.image.repository=docker.io/$(IMG_NS)/$(parser-prefix)-ncrack" \
		--set="parser.image.tag=$(IMG_TAG)" \
		--set="scanner.image.tag=$(IMG_TAG)" \
		--set="parser.env[0].name=CRASH_ON_FAILED_VALIDATION" \
		--set-string="parser.env[0].value=true" \
		--set="scanner.extraVolumes[0].name=ncrack-lists" \
		--set="scanner.extraVolumes[0].secret.secretName=ncrack-lists" \
		--set="scanner.extraVolumeMounts[0].name=ncrack-lists" \
		--set="scanner.extraVolumeMounts[0].mountPath=/ncrack/"

deploy-test-dep-sslyze:
	cd ../../scanners/sslyze/ && $(MAKE) -s docker-build docker-export kind-import && \
	helm -n integration-tests upgrade --install sslyze . --wait \
		--set="parser.image.repository=docker.io/$(IMG_NS)/$(parser-prefix)-sslyze" \
		--set="parser.image.tag=$(IMG_TAG)" \
		--set="parser.env[0].name=CRASH_ON_FAILED_VALIDATION" \
		--set-string="parser.env[0].value=true"

deploy-test-deps: deploy-test-dep-dummy-ssh deploy-test-dep-nmap deploy-test-dep-ncrack

deploy:
	@echo ".: 💾 Deploying '$(name)' $(hook-prefix) HelmChart with the docker tag '$(IMG_TAG)' into kind namespace 'cascading-scans'."
	helm -n integration-tests upgrade --install dssh . --wait \
		--set="hook.image.repository=docker.io/$(IMG_NS)/$(hook-prefix)-$(name)" \
		--set="hook.image.tag=$(IMG_TAG)"

integration-tests:
	@echo ".: 🩺 Starting integration test in kind namespace 'cascading-scans'."
	kubectl -n integration-tests delete scans --all
	cd ../../tests/integration/ && npm ci &&	npx --yes --package jest@$(JEST_VERSION) jest --verbose --ci --colors --coverage --passWithNoTests scanner/cascade-nmap-ncrack.test.js

deploy-test-deps-2: deploy-test-dep-unsafe-https deploy-test-dep-nmap deploy-test-dep-sslyze

integration-tests-2:
	@echo ".: 🩺 Starting integration test in kind namespace 'cascading-scans'."
	kubectl -n integration-tests delete scans --all
	cd ../../tests/integration/ && npm ci &&	npx --yes --package jest@$(JEST_VERSION) jest --verbose --ci --colors --coverage --passWithNoTests scanner/cascade-nmap-sslyze.test.js
