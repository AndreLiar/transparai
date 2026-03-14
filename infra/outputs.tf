# ─── URLs ─────────────────────────────────────────────────────────────────────

output "backend_url" {
  description = "Public HTTPS URL of the backend App Service"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_url" {
  description = "Frontend URL (Vercel) — set via var.frontend_url in terraform.tfvars"
  value       = var.frontend_url
}

# ─── Monitoring ───────────────────────────────────────────────────────────────

output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# ─── Cosmos DB ────────────────────────────────────────────────────────────────

output "cosmosdb_endpoint" {
  description = "Cosmos DB account endpoint"
  value       = azurerm_cosmosdb_account.main.endpoint
}

output "cosmosdb_connection_string" {
  description = "Primary MongoDB connection string — stored in Key Vault; exposed here for reference only"
  value       = azurerm_cosmosdb_account.main.primary_mongodb_connection_string
  sensitive   = true
}

# ─── Infrastructure References ────────────────────────────────────────────────

output "key_vault_uri" {
  description = "Key Vault URI — use to add secrets manually via Azure Portal if needed"
  value       = azurerm_key_vault.main.vault_uri
}

output "resource_group_name" {
  description = "Name of the resource group containing all resources"
  value       = azurerm_resource_group.main.name
}

output "backend_managed_identity_principal_id" {
  description = "Object ID of the backend App Service managed identity"
  value       = azurerm_linux_web_app.backend.identity[0].principal_id
}
