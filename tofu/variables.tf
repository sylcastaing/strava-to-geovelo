variable "access_key" {
  type      = string
  sensitive = true
}

variable "secret_key" {
  type      = string
  sensitive = true
}

variable "organization_id" {
  type      = string
  sensitive = true
}

variable "zone" {
  type = string
}

variable "region" {
  type = string
}

variable "strava_client_id" {
  type      = string
  sensitive = true
}

variable "strava_client_secret" {
  type      = string
  sensitive = true
}

variable "geovelo_authentication" {
  type      = string
  sensitive = true
}

variable "geovelo_api_key" {
  type      = string
  sensitive = true
}
