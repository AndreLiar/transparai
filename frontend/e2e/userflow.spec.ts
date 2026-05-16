import { test, expect } from '@playwright/test';

test('landing to auth navigation works', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Vous signez/i })).toBeVisible();

  await page.getByRole('link', { name: 'Connexion' }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();

  await page.getByRole('link', { name: /Créez-en un/i }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();
});

test('guest analyze form is reachable and fillable', async ({ page }) => {
  await page.goto('/analyze');

  await expect(page.getByRole('heading', { name: /Analysez votre/i })).toBeVisible();
  const textarea = page.getByPlaceholder(/Collez ici vos conditions générales/i);
  await expect(textarea).toBeVisible();
  await textarea.fill('Conditions générales de test pour parcours invité.');
  await expect(textarea).toHaveValue(/parcours invité/);

  await expect(page.getByRole('button', { name: /Analyser avec l'IA/i })).toBeVisible();
});
