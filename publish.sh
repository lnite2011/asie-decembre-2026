#!/usr/bin/env bash
# Publie ce dossier sur le dépôt public (GitHub Pages) : https://lnite2011.github.io/asie-decembre-2026/
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git remote get-url asie >/dev/null 2>&1 || git remote add asie https://github.com/lnite2011/asie-decembre-2026.git
git subtree push --prefix=trips/singapore-vietnam-thailand-2026-12/website/app asie main
