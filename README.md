# outgate-ai/landing

Landing page for [outgate.ai](https://outgate.ai).

## Development

```bash
npm install
npm run dev       # http://localhost:5174
```

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_CONSOLE_URL` | URL of the console app (for "Console" / "Get Started" buttons) | _(empty)_ |
| `VITE_APP_NAME` | App name | `Outgate.ai` |

Set per-environment values via GitHub Actions secrets (`CONSOLE_URL`).

## Deploy

Push to `main` triggers `.github/workflows/deploy.yml`:

1. Builds with production `VITE_CONSOLE_URL` from secrets
2. Syncs `dist/` to S3
3. Invalidates CloudFront cache
4. Outputs the **CloudFront CNAME** to point DNS to

### Infrastructure

S3 + CloudFront are managed by `terraform/main.tf`. First-time setup:

```bash
cd terraform
terraform init
terraform apply
```

Outputs the CNAME domain, S3 bucket name, and distribution ID.
