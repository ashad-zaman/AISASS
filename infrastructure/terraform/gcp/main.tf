terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.gcp_region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "db_instance_type" {
  description = "Cloud SQL instance type"
  type        = string
  default     = "db-f1-micro"
}

variable "db_allocated_storage" {
  description = "Cloud SQL allocated storage in GB"
  type        = number
  default     = 20
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

locals {
  project_name = "aisass"
  tags = {
    project     = local.project_name
    environment = var.environment
  }
}

resource "google_compute_network" "main" {
  name                    = "${local.project_name}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "private" {
  name          = "${local.project_name}-private"
  region        = var.gcp_region
  network       = google_compute_network.main.id
  ip_cidr_range = var.vpc_cidr
}

resource "google_compute_subnetwork" "public" {
  name          = "${local.project_name}-public"
  region        = var.gcp_region
  network       = google_compute_network.main.id
  ip_cidr_range = cidrsubnet(var.vpc_cidr, 8, 10)
}

resource "google_sql_database_instance" "main" {
  name                = "${local.project_name}-postgres"
  database_version    = "POSTGRES_15"
  region              = var.gcp_region

  settings {
    tier              = var.db_instance_type
    disk_size         = var.db_allocated_storage
    user_labels       = local.tags
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
    }
  }

  deletion_protection = false
}

resource "google_sql_user" "postgres" {
  name     = "postgres"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

resource "google_redis_instance" "main" {
  name           = "${local.project_name}-redis"
  tier          = "BASIC"
  memory_size_gb = 1
  region        = var.gcp_region
}

resource "google_storage_bucket" "documents" {
  name          = "${local.project_name}-documents-${var.environment}"
  location      = var.gcp_region
  storage_class = "STANDARD"
  labels        = local.tags
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

output "database_connection" {
  value = google_sql_database_instance.main.connection_name
}

output "redis_host" {
  value = google_redis_instance.main.host
}

output "storage_bucket" {
  value = google_storage_bucket.documents.name
}