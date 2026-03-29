################################################################################
# S3 Buckets
################################################################################

resource "aws_s3_bucket" "landing" {
  bucket = "${var.project}-${var.environment}-landing"
  tags = { Project = var.project, Environment = var.environment, ManagedBy = "terraform" }
}

resource "aws_s3_bucket_public_access_block" "landing" {
  bucket                  = aws_s3_bucket.landing.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "cli_releases" {
  bucket = "${var.project}-${var.environment}-cli-releases"
  tags = { Project = var.project, Environment = var.environment, ManagedBy = "terraform" }
}

resource "aws_s3_bucket_public_access_block" "cli_releases" {
  bucket                  = aws_s3_bucket.cli_releases.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

################################################################################
# CloudFront
################################################################################

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_origin_access_control" "landing" {
  name                              = "${var.project}-${var.environment}-landing-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "cli_releases" {
  name                              = "${var.project}-${var.environment}-cli-releases-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "bot_prerender" {
  name    = "${var.project}-${var.environment}-bot-prerender"
  runtime = "cloudfront-js-2.0"
  comment = "Serve prerendered HTML to bots and crawlers"
  publish = true

  code = <<-JSEOF
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var ua = '';

  if (request.headers['user-agent']) {
    ua = request.headers['user-agent'].value.toLowerCase();
  }

  if (uri.match(/\.\w{2,5}$/)) {
    return request;
  }

  var isBrowser = /chrome\/|firefox\/|safari\/|edg\/|opera\/|opr\//i.test(ua);

  if (!isBrowser) {
    var legalPages = {'/privacy': '/privacy.html', '/terms': '/terms.html', '/impressum': '/impressum.html', '/tools': '/tools.html'};
    var cleanUri = uri.replace(/\/$/, '') || '/';
    var mapped = legalPages[cleanUri];
    request.uri = mapped ? '/_prerendered' + mapped : '/_prerendered/index.html';
  }

  return request;
}
JSEOF
}

resource "aws_cloudfront_distribution" "landing" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  comment             = "${var.project} ${var.environment} landing"
  aliases             = [var.domain]

  origin {
    domain_name              = aws_s3_bucket.landing.bucket_regional_domain_name
    origin_id                = "s3-landing"
    origin_access_control_id = aws_cloudfront_origin_access_control.landing.id
  }

  origin {
    domain_name              = aws_s3_bucket.cli_releases.bucket_regional_domain_name
    origin_id                = "s3-cli-releases"
    origin_access_control_id = aws_cloudfront_origin_access_control.cli_releases.id
  }

  ordered_cache_behavior {
    path_pattern             = "/download/*"
    target_origin_id         = "s3-cli-releases"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_optimized.id
    compress                 = true
  }

  default_cache_behavior {
    target_origin_id       = "s3-landing"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.bot_prerender.arn
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = { Project = var.project, Environment = var.environment, ManagedBy = "terraform" }
}

################################################################################
# S3 Bucket Policies
################################################################################

resource "aws_s3_bucket_policy" "landing" {
  bucket = aws_s3_bucket.landing.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontOAC"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.landing.arn}/*"
      Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.landing.arn } }
    }]
  })
}

resource "aws_s3_bucket_policy" "cli_releases" {
  bucket = aws_s3_bucket.cli_releases.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontOAC"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.cli_releases.arn}/*"
      Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.landing.arn } }
    }]
  })
}
