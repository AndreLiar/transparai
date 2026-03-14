# ─── Provider ─────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.6"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.110"
    }
  }

  # Uncomment to store state in Azure Blob Storage (recommended for teams/CI):
  # backend "azurerm" {
  #   resource_group_name  = "rg-transparai-tfstate"
  #   storage_account_name = "transparaitfstate"
  #   container_name       = "tfstate"
  #   key                  = "production.terraform.tfstate"
  # }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

# ─── Data Sources ─────────────────────────────────────────────────────────────

# Used to scope Key Vault access policies to the current Terraform caller
data "azurerm_client_config" "current" {}

# ─── Resource Group ───────────────────────────────────────────────────────────

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    project     = var.app_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ─── Cosmos DB for MongoDB API ────────────────────────────────────────────────
# Drop-in replacement for MongoDB Atlas — 100% wire-protocol compatible with Mongoose.
# Free tier: 1000 RU/s + 25 GB storage (one free-tier account per Azure subscription).
# Includes: automated backups, SLA, global replication, Vector Search (DiskANN).

resource "azurerm_cosmosdb_account" "main" {
  name                = "${var.app_name}-cosmos-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  # Enable the free tier (1000 RU/s + 25 GB free — one per subscription)
  free_tier_enabled = true

  # MongoDB API version — 4.2 is required for vector search / $vectorSearch aggregation
  mongo_server_version = "4.2"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  # Enable analytical storage for potential Synapse/reporting use
  analytical_storage_enabled = false

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_cosmosdb_mongo_database" "main" {
  name                = "transparai"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
}

# ─── Key Vault ────────────────────────────────────────────────────────────────

resource "azurerm_key_vault" "main" {
  name                       = "${var.app_name}-kv-${var.environment}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false # Set true for production compliance

  # Allow Terraform caller (your user / CI service principal) to manage secrets
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Backup", "Delete", "Get", "List", "Purge", "Recover", "Restore", "Set"
    ]
  }

  tags = azurerm_resource_group.main.tags
}

# ─── Key Vault Secrets ────────────────────────────────────────────────────────

resource "azurerm_key_vault_secret" "mongo_uri" {
  name         = "MONGO-URI"
  # Primary MongoDB connection string from Cosmos DB — no manual value needed
  value        = azurerm_cosmosdb_account.main.primary_mongodb_connection_string
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "firebase_service_account" {
  name         = "FIREBASE-SERVICE-ACCOUNT-JSON"
  value        = var.firebase_service_account_json
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "voyage_api_key" {
  name         = "VOYAGE-API-KEY"
  value        = var.voyage_api_key
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "stripe_secret_key" {
  name         = "STRIPE-SECRET-KEY"
  value        = var.stripe_secret_key
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "stripe_webhook_secret" {
  name         = "STRIPE-WEBHOOK-SECRET"
  value        = var.stripe_webhook_secret
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "JWT-SECRET"
  value        = var.jwt_secret
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "encryption_key" {
  name         = "ENCRYPTION-KEY"
  value        = var.encryption_key
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "session_secret" {
  name         = "SESSION-SECRET"
  value        = var.session_secret
  key_vault_id = azurerm_key_vault.main.id
}

# ─── Application Insights ─────────────────────────────────────────────────────

resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-ai-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "Node.JS"
  workspace_id        = "/subscriptions/fd0b9d4a-6ef0-4ef7-8078-c4ebedb30c4d/resourceGroups/ai_transparai-ai-production_bc1f99b9-9ef9-4ff6-87a8-1fb419018072_managed/providers/Microsoft.OperationalInsights/workspaces/managed-transparai-ai-production-ws"

  tags = azurerm_resource_group.main.tags
}

# ─── Azure OpenAI (AI Foundry) ────────────────────────────────────────────────
# Provisions the Cognitive Services account + gpt-4o and gpt-4o-mini deployments.
# The endpoint and key are auto-wired into App Service env — no manual portal steps.

resource "azurerm_cognitive_account" "openai" {
  name                = "${var.app_name}-openai-${var.environment}"
  location            = "West Europe"
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name            = "S0"

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_cognitive_deployment" "gpt4o_mini" {
  name                 = "gpt-4o-mini"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-4o-mini"
    version = "2024-07-18"
  }

  scale {
    type     = "GlobalStandard"
    capacity = 10 # 10K tokens per minute
  }
}

resource "azurerm_cognitive_deployment" "gpt4o" {
  name                 = "gpt-4o"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-4o"
    version = "2024-11-20"
  }

  scale {
    type     = "GlobalStandard"
    capacity = 10 # 10K tokens per minute
  }
}

resource "azurerm_key_vault_secret" "azure_openai_endpoint_secret" {
  name         = "AZURE-OPENAI-ENDPOINT"
  value        = azurerm_cognitive_account.openai.endpoint
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "azure_openai_key_secret" {
  name         = "AZURE-OPENAI-KEY"
  value        = azurerm_cognitive_account.openai.primary_access_key
  key_vault_id = azurerm_key_vault.main.id
}

# ─── App Service Plan (Backend) ───────────────────────────────────────────────

resource "azurerm_service_plan" "backend" {
  name                = "${var.app_name}-plan-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "F1" # Free tier: 60 CPU min/day, 1 GB RAM

  tags = azurerm_resource_group.main.tags
}

# ─── App Service (Backend Node.js/Express) ────────────────────────────────────

resource "azurerm_linux_web_app" "backend" {
  name                = "${var.app_name}-backend-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.backend.id

  # System-assigned identity allows App Service to read Key Vault secrets
  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = false # F1 free tier does not support always_on

    application_stack {
      node_version = var.node_version
    }

    health_check_path = "/health"
  }

  # App settings are injected as environment variables into process.env
  # Key Vault references are resolved at runtime — secrets never stored in state
  app_settings = {
    NODE_ENV = "production"
    PORT     = "8080" # App Service routes 443/80 → internal 8080

    MONGO_URI                     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.mongo_uri.versionless_id})"
    FIREBASE_SERVICE_ACCOUNT_JSON = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.firebase_service_account.versionless_id})"
    # Azure AI Foundry — auto-provisioned, endpoint + key from Key Vault
    AZURE_OPENAI_ENDPOINT              = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.azure_openai_endpoint_secret.versionless_id})"
    AZURE_OPENAI_API_KEY               = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.azure_openai_key_secret.versionless_id})"
    AZURE_OPENAI_API_VERSION           = "2024-08-01-preview"
    AZURE_OPENAI_DEPLOYMENT_GPT4O      = azurerm_cognitive_deployment.gpt4o.name
    AZURE_OPENAI_DEPLOYMENT_GPT4O_MINI = azurerm_cognitive_deployment.gpt4o_mini.name
    VOYAGE_API_KEY                = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.voyage_api_key.versionless_id})"
    STRIPE_SECRET_KEY             = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.stripe_secret_key.versionless_id})"
    STRIPE_WEBHOOK_SECRET         = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.stripe_webhook_secret.versionless_id})"
    JWT_SECRET                    = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.jwt_secret.versionless_id})"
    ENCRYPTION_KEY                = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.encryption_key.versionless_id})"
    SESSION_SECRET                = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.session_secret.versionless_id})"

    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.main.connection_string
    APPINSIGHTS_INSTRUMENTATIONKEY        = azurerm_application_insights.main.instrumentation_key

    FRONTEND_URL = var.frontend_url

    LOG_LEVEL                = "info"
    WEBSITE_RUN_FROM_PACKAGE = "1"
  }

  tags = azurerm_resource_group.main.tags
}

# ─── Key Vault Access Policy for Backend Managed Identity ─────────────────────
# Separate resource (not inline) because principal_id is only known after App Service creation

resource "azurerm_key_vault_access_policy" "backend_app" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.backend.identity[0].principal_id

  secret_permissions = ["Get", "List"]
}

# Frontend is deployed on Vercel — no Azure Static Web App resource needed.
