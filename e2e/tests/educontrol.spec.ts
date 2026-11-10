import { test, expect } from '@playwright/test';

test.describe('Flujos Principales de EduControl', () => {
  test('Página de inicio muestra el login de EduControl con opciones de acceso rápido', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('EduControl');
    await expect(page.getByText('Acceso Rápido para Demostración (6 Roles)')).toBeVisible();
  });

  test('Inicio de sesión rápido como Administrador redirige al Dashboard', async ({ page }) => {
    await page.goto('/login');
    // Click on Admin demo button
    await page.click('button:has-text("Administrador")');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard Institucional');
  });

  test('Inicio de sesión como Alumno muestra boletín y escala de aprobación', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Alumno")');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Mi Panel Académico');
    await expect(page.getByText('Promedio General')).toBeVisible();
  });
});
