output "s3_bucket"                  { value = aws_s3_bucket.landing.bucket }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.landing.id }
output "cloudfront_domain"          { value = aws_cloudfront_distribution.landing.domain_name }
output "cli_releases_bucket"        { value = aws_s3_bucket.cli_releases.bucket }
