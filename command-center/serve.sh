#!/bin/bash
cd "/Users/lemueldavidleejr/Desktop/Codex folder/cranegenius-site" && exec python3 -m http.server "${PORT:-8088}"
