terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket         = "outgate-dev-terraform-state"
    key            = "landing/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "outgate-terraform-locks"
    encrypt        = true
  }
}

provider "aws" { region = "eu-central-1" }

data "terraform_remote_state" "infrastructure" {
  backend = "s3"
  config = {
    bucket = "outgate-dev-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "eu-central-1"
  }
}

module "landing" {
  source          = "../../modules/landing"
  project         = "outgate"
  environment     = "dev"
  domain          = "dev.outgate.ai"
  certificate_arn = data.terraform_remote_state.infrastructure.outputs.cloudfront_certificate_arn
}

output "s3_bucket"                  { value = module.landing.s3_bucket }
output "cloudfront_distribution_id" { value = module.landing.cloudfront_distribution_id }
output "cloudfront_domain"          { value = module.landing.cloudfront_domain }
output "cli_releases_bucket"        { value = module.landing.cli_releases_bucket }
