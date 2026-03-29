#!/usr/bin/env bash
set -euo pipefail

# Deploy landing from local machine (fast mode)
# Usage: ./deploy-local.sh

S3_BUCKET="outgate-prod-landing"
CF_DISTRIBUTION_ID="E3BR5P7OBWQ5MQ"
AWS_REGION="eu-central-1"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "==> Installing dependencies..."
  npm ci
else
  echo "==> Dependencies up to date, skipping install"
fi

echo "==> Building landing..."
VITE_CONSOLE_URL=https://console.outgate.ai \
VITE_APP_NAME="Outgate.ai" \
npm run build

echo "==> Syncing to S3..."
aws s3 sync dist/ "s3://${S3_BUCKET}" \
  --delete \
  --region "$AWS_REGION"

echo "==> Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/*" \
  --region "$AWS_REGION" \
  --no-cli-pager > /dev/null

echo "==> Landing deployed to https://outgate.ai"
echo "    (CloudFront invalidation in progress — takes ~30s to propagate)"
