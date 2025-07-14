terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"

  backend "s3" {
    bucket                      = "sylcastaing-tofu-state"
    key                         = "strava-to-geovelo.tsfstate"
    region                      = var.region
    endpoint                    = "https://s3.fr-par.scw.cloud"
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
  }
}

provider "scaleway" {
  access_key      = var.access_key
  secret_key      = var.secret_key
  organization_id = var.organization_id
  region          = var.region
  zone            = var.zone
}

resource "scaleway_account_project" "project" {
  name = "strava-to-geovelo"
}

resource "scaleway_object_bucket" "main" {
  name          = "strava-to-geovelo"
  project_id    = scaleway_account_project.project.id
  force_destroy = true
}

resource "scaleway_iam_application" "main" {
  name = "strava-to-geovelo"
}

resource "scaleway_iam_policy" "write" {
  name           = "s3-to-geovelo-bucket"
  application_id = scaleway_iam_application.main.id

  rule {
    project_ids = [scaleway_account_project.project.id]
    permission_set_names = ["ObjectStorageObjectsWrite", "ObjectStorageObjectsRead"]
  }
}

resource "scaleway_iam_api_key" "main" {
  application_id     = scaleway_iam_application.main.id
  default_project_id = scaleway_account_project.project.id
}

data "archive_file" "source_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist"
  output_path = "${path.module}/function.zip"
}

resource "scaleway_function_namespace" "main" {
  name       = "strava-to-geovelo"
  project_id = scaleway_account_project.project.id
}

resource "scaleway_function" "main" {
  namespace_id = scaleway_function_namespace.main.id
  name         = "sync"
  runtime      = "node22"
  handler      = "index.handler"
  privacy      = "public"
  memory_limit = 512
  zip_file     = data.archive_file.source_zip.output_path
  zip_hash = filesha256(data.archive_file.source_zip.output_path)
  deploy       = true
  environment_variables = {
    STRAVA_CLIENT_ID     = var.strava_client_id
    STRAVA_CLIENT_SECRET = var.strava_client_secret

    GEOVELO_AUTHENTIFICATION = var.geovelo_authentication
    GEOVELO_API_KEY          = var.geovelo_api_key
    GEOVELO_SOURCE           = "website"

    STORAGE_ENDPOINT          = scaleway_object_bucket.main.endpoint
    STORAGE_REGION            = var.region
    STORAGE_ACCESS_KEY_ID     = scaleway_iam_api_key.main.access_key
    STORAGE_SECRET_ACCESS_KEY = scaleway_iam_api_key.main.secret_key
    STORAGE_CREDENTIAL_PATH   = "/credentials.json"
  }
}