# ─── Core ─────────────────────────────────────────────────────────────────────

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "West Europe"
}

variable "environment" {
  description = "Deployment environment label (e.g. production, staging)"
  type        = string
  default     = "production"
}

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
  default     = "rg-transparai"
}

variable "app_name" {
  description = "Short application name used as a name prefix"
  type        = string
  default     = "transparai"
}

# ─── Frontend (Vercel) ────────────────────────────────────────────────────────

variable "frontend_url" {
  description = "Vercel frontend URL — e.g. https://transparai.vercel.app or your custom domain"
  type        = string
  default     = ""
}

# ─── Backend App Service ───────────────────────────────────────────────────────

variable "node_version" {
  description = "Node.js version for the App Service runtime"
  type        = string
  default     = "20-lts"
}

# ─── Secrets (no defaults — must be supplied via tfvars or CI env vars) ───────

variable "mongo_uri" {
  description = "Cosmos DB for MongoDB connection string (auto-populated from azurerm_cosmosdb_account output)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "firebase_service_account_json" {
  description = "Firebase service account JSON blob (minified, single line)"
  type        = string
  sensitive   = true
}

variable "azure_openai_endpoint" {
  description = "Azure AI Foundry endpoint — e.g. https://my-resource.openai.azure.com/"
  type        = string
  default     = ""
}

variable "azure_openai_api_key" {
  description = "Azure AI Foundry API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "azure_openai_api_version" {
  description = "Azure OpenAI API version"
  type        = string
  default     = "2024-08-01-preview"
}

variable "azure_openai_deployment_gpt4o" {
  description = "Deployment name for gpt-4o in Azure AI Foundry"
  type        = string
  default     = "gpt-4o"
}

variable "azure_openai_deployment_gpt4o_mini" {
  description = "Deployment name for gpt-4o-mini in Azure AI Foundry"
  type        = string
  default     = "gpt-4o-mini"
}

# Kept for local dev fallback — not used in production when Azure is configured
variable "openai_api_key" {
  description = "Direct OpenAI API key (local dev only)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "voyage_api_key" {
  description = "Voyage AI API key for legal embeddings"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret (32+ chars)"
  type        = string
  sensitive   = true
}

variable "encryption_key" {
  description = "Encryption key for sensitive data (32+ chars)"
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "Session secret (32+ chars)"
  type        = string
  sensitive   = true
}

