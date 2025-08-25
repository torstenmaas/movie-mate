#!/usr/bin/env bash
set -euo pipefail
mkdir -p .secrets
openssl genrsa -out .secrets/jwt.key 4096
openssl rsa -in .secrets/jwt.key -pubout -out .secrets/jwt.pub
echo "Private: .secrets/jwt.key"
echo "Public : .secrets/jwt.pub"
echo ""
echo "Paste into .env:"
echo "JWT_PRIVATE_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' .secrets/jwt.key)""
echo "JWT_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' .secrets/jwt.pub)""
