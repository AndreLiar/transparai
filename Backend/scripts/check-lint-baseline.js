const fs = require('fs');

const reportPath = process.argv[2] || '.eslint-report.json';
const maxErrorsRaw = process.env.BACKEND_LINT_ERROR_BUDGET || process.argv[3];
const maxErrors = Number(maxErrorsRaw);

if (!Number.isFinite(maxErrors)) {
  console.error('Invalid BACKEND_LINT_ERROR_BUDGET value');
  process.exit(2);
}

if (!fs.existsSync(reportPath)) {
  console.error(`ESLint report not found: ${reportPath}`);
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const totalErrors = report.reduce((sum, file) => sum + (file.errorCount || 0), 0);
const totalWarnings = report.reduce((sum, file) => sum + (file.warningCount || 0), 0);

console.log(`ESLint totals — errors: ${totalErrors}, warnings: ${totalWarnings}, budget: ${maxErrors}`);

if (totalErrors > maxErrors) {
  console.error(`Lint regression detected: ${totalErrors} errors exceeds budget ${maxErrors}`);
  process.exit(1);
}
