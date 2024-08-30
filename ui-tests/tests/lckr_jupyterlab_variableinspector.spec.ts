import { expect, test } from '@jupyterlab/galata';

test('test', async ({ page }) => {
  await page.getByText('Python 3 (ipykernel)').first().click();
  await page.getByText('Python 3 (ipykernel) | Idle').waitFor();
  await page.notebook.setCell(0, 'code', 'a1 = 1');
  await page.notebook.runCell(0);
  await page.notebook.addCell('code', 'b1 = "hello"');
  await page.notebook.runCell(0, true);

  await page.getByRole('tabpanel').click({
    button: 'right'
  });
  await page.getByRole('menu').getByText('Open Variable Inspector').click();

  const firstRow = page.locator('.jp-VarInspector-table-row').first();
  await expect
    .soft(firstRow.locator('.jp-VarInspector-varName'))
    .toHaveText(/a/);
  await expect
    .soft(firstRow.locator('.jp-VarInspector-type'))
    .toHaveText(/int/);
  await expect
    .soft(firstRow.locator('jp-data-grid-cell').nth(4))
    .toHaveText(/\d\d/);
  await expect
    .soft(firstRow.locator('jp-data-grid-cell').last())
    .toHaveText(/1/);
  const secondRow = page.locator('.jp-VarInspector-table-row').last();
  await expect
    .soft(secondRow.locator('.jp-VarInspector-varName'))
    .toHaveText(/b/);
  await expect
    .soft(secondRow.locator('.jp-VarInspector-type'))
    .toHaveText(/str/);
  await expect
    .soft(secondRow.locator('jp-data-grid-cell').nth(4))
    .toHaveText(/\d\d/);
  await expect
    .soft(secondRow.locator('jp-data-grid-cell').last())
    .toHaveText(/hello/);
});

test('variable filter', async ({ page }) => {
  await page.getByText('Python 3 (ipykernel)').first().click();
  await page.getByText('Python 3 (ipykernel) | Idle').waitFor();
  await page.notebook.setCell(0, 'code', 'a1 = 1');
  await page.notebook.runCell(0);
  await page.notebook.addCell('code', 'b1 = "hello"');
  await page.notebook.runCell(0, true);

  await page.getByRole('tabpanel').click({
    button: 'right'
  });
  await page.getByRole('menu').getByText('Open Variable Inspector').click();

  //Filter out rows with int type
  await page.locator('.filter-input').pressSequentially('int');
  await page.locator('.filter-button').click();

  //expect.soft only to have one row with name b and type str
  expect
    .soft(await page.locator('.jp-VarInspector-table-row').count())
    .toEqual(1);
  const bRow = page.locator('.jp-VarInspector-table-row').first();
  await expect.soft(bRow.locator('.jp-VarInspector-varName')).toHaveText(/b1/);
  await expect.soft(bRow.locator('.jp-VarInspector-type')).toHaveText(/str/);
  await expect
    .soft(bRow.locator('jp-data-grid-cell').nth(4))
    .toHaveText(/\d\d/);
  await expect
    .soft(bRow.locator('jp-data-grid-cell').last())
    .toHaveText(/hello/);

  // Remove filter
  await page.locator('.filtered-variable-button').click();

  //Filter out all variables with 1 in the name
  await page.evaluate('document.querySelector(".filter-type").value="name"');
  await page.locator('.filter-input').pressSequentially('*1');
  await page.locator('.filter-button').click();

  //expect.softs no rows except for header
  expect
    .soft(await page.locator('.jp-VarInspector-table-row').count())
    .toEqual(0);

  //Remove the filter
  await page.locator('.filtered-variable-button').click();
  expect
    .soft(await page.locator('.jp-VarInspector-table-row').count())
    .toEqual(2);

  //Filter out variables name b1
  await page.locator('.filter-input').pressSequentially('b1');
  await page.locator('.filter-button').click();

  //expect.soft one row with name a1 and type int
  expect
    .soft(await page.locator('.jp-VarInspector-table-row').count())
    .toEqual(1);
  const aRow = page.locator('.jp-VarInspector-table-row').first();
  await expect.soft(aRow.locator('.jp-VarInspector-varName')).toHaveText(/a1/);
  await expect.soft(aRow.locator('.jp-VarInspector-type')).toHaveText(/int/);
  await expect
    .soft(aRow.locator('jp-data-grid-cell').nth(4))
    .toHaveText(/\d\d/);
  await expect.soft(aRow.locator('jp-data-grid-cell').last()).toHaveText(/1/);
});
