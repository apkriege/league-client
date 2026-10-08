import { expect, test } from '@playwright/test';

for (const mobile of [false, true]) {
  test(`configures a league handicap and allows an unknown starter ${mobile ? '@mobile' : ''}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('integration-test-password');
    await page.getByRole('button', {name:'Sign in',exact:true}).click();
    await expect(page).toHaveURL(/\/leagues$/);
    await page.goto('/leagues/create');
    await page.getByLabel('League Name').fill(`Handicap Settings ${mobile ? 'Mobile' : 'Desktop'}`);
    await page.getByLabel('Best rounds (X)').fill('3');
    await page.getByRole('button', {name:'Next →'}).click();
    await expect(page.getByRole('alert').filter({hasText:'whole numbers'}).first()).toBeVisible();
    await page.getByLabel('Best rounds (X)').fill('5');
    await page.getByLabel('Recent rounds (Y)').fill('8');
    await page.getByLabel('Handicap multiplier').fill('0.96');
    await page.getByLabel('Maximum hole score for handicap').click();
    await page.getByRole('option', {name:'Par + 3',exact:true}).click();
    await expect(page.getByRole('listbox')).toBeHidden();
    await page.getByLabel('Best rounds (X)').scrollIntoViewIfNeeded();
    await page.screenshot({path:`/tmp/handicap-settings-${mobile ? 'mobile' : 'desktop'}.png`,animations:"disabled"});
    await page.getByRole('button', {name:'Next →'}).click();
    await expect(page.getByRole('heading',{name:'Add Players'})).toBeVisible();
    await page.getByLabel('First Name', {exact:true}).fill('Unknown');
    await page.getByLabel('Last Name', {exact:true}).fill('Starter');
    await page.getByLabel('Gender', {exact:true}).click();
    await page.getByRole('option', {name:'Male',exact:true}).click();
    await page.getByRole('button',{name:'Save Player'}).click();
    await expect(page.getByText('Unknown Starter',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Next →'}).click();
    await expect(page.getByText(/Best 5 of last 8/)).toBeVisible();
    await page.getByRole('button',{name:'Start 3-Event Trial'}).click();
    await expect(page).toHaveURL(/\/league\/\d+\/admin$/);
    const id = page.url().match(/\/league\/(\d+)/)?.[1];
    const response = await page.request.get(`http://127.0.0.1:3310/api/leagues/${id}`);
    expect(response.ok()).toBe(true);
    const league = await response.json();
    expect(league).toMatchObject({handicapBestRounds:5,handicapWindow:8,handicapMultiplier:0.96,handicapHoleBasis:18,handicapHoleLimit:'par-plus-3'});
    expect(league.players[0].handicap).toBeNull();
    await page.goto(`/league/${id}/edit`);
    await expect(page.getByLabel('Best rounds (X)')).toBeDisabled();
    await expect(page.getByLabel('Recent rounds (Y)')).toBeDisabled();
    await expect(page.getByLabel('Handicap multiplier')).toBeDisabled();
    await page.goto(`/league/${id}/player/${league.players[0].id}`);
    await page.getByRole('button',{name:'View handicap calculation'}).click();
    await expect(page.getByText('No completed rounds yet.')).toBeVisible();
    await expect(page.getByText(/Finish your first individual round to get a handicap/)).toBeVisible();
    await page.screenshot({path:`/tmp/handicap-drawer-${mobile ? 'mobile' : 'desktop'}.png`,animations:"disabled"});
    await page.route(`**/api/leagues/${id}/players/${league.players[0].id}/stats`, async route => {
      const response = await route.fetch();
      const stats = await response.json();
      const entry = {roundIds:[900001],differential:9,playedAt:'2026-01-01T15:00:00Z'};
      stats.handicapCalculation = {...stats.handicapCalculation,basis:9,status:'provisional',eligibleRounds:1,
        entries:[entry],usedEntries:[entry],average:9,multiplier:0.96,index:8.64,storedHandicap:8.64,
        sourceRounds:[{id:900001,eventId:900001,differential:9,holes:9,playedAt:entry.playedAt,
          eventName:'Recent scoring example with a longer event name',gross:45,net:36,adjustedGross:44,rating:36,slope:113}]};
      await route.fulfill({json:stats});
    });
    await page.reload();
    await page.getByRole('button',{name:'View handicap calculation'}).click();
    const scoringTable = page.getByRole('table').filter({has:page.getByRole('columnheader',{name:'Differential'})});
    await expect(scoringTable.getByRole('columnheader',{name:'Gross',exact:true})).toBeVisible();
    await expect(scoringTable.getByRole('columnheader',{name:'Net',exact:true})).toBeVisible();
    await expect(scoringTable.getByRole('cell',{name:'45',exact:true})).toBeVisible();
    await expect(scoringTable.getByRole('cell',{name:'36',exact:true})).toBeVisible();
    await expect(page.getByText('× 0.96', {exact:false})).toBeVisible();
    await expect(page.getByText('Score differential =', {exact:false})).not.toBeVisible();
    await page.getByText('How round differentials work', {exact:true}).click();
    await expect(page.getByText('Score differential =', {exact:false})).toBeVisible();
    await page.getByText('How round differentials work', {exact:true}).click();
    await page.screenshot({path:`/tmp/handicap-recent-scores-${mobile ? 'mobile' : 'desktop'}.png`,animations:'disabled'});
    const holes = Array.from({length:18}, (_,index) => ({num:index+1,par:4,hcp:index+1}));
    const pendingId = league.players[0].id;
    const entries = [pendingId,90001,90002,90003].map((playerId,index) => ({
      playerId,teamId:index < 2 ? 1 : 2,handicapIndex:index === 0 ? null : 0,
      firstRoundHandicap:index === 0 ? {handicapHoleBasis:18,handicapHoleLimit:'par-plus-3',rating:72,slope:113} : null,
      player:{id:playerId,firstName:index === 0 ? 'Unknown' : 'Known',lastName:index === 0 ? 'Starter' : String(index),gender:'male',handicap:index === 0 ? null : 0,rounds:[]},
    }));
    await page.route(`**/api/leagues/${id}/events/99999999`, async route => route.fulfill({json:{
      id:99999999,leagueId:Number(id),name:'Team handicap preview',format:'team',scoringMode:'best-ball',
      startsAt:new Date().toISOString(),timeZone:'UTC',scoringConfig:{handicapAllowance:1},
      scoringHoles:holes,holes:18,canEnterScores:true,canEditScores:false,
      flights:[{id:99999999,status:'not_started',startsAt:new Date().toISOString(),players:entries,teams:[{teamId:1,team:{name:'A'}},{teamId:2,team:{name:'B'}}]}],
    }}));
    await page.goto(`/league/${id}/events/99999999/scores`);
    const pendingRow = page.getByRole('row').filter({hasText:'Unknown Starter'});
    await expect(pendingRow.getByText('Handicap calculated when all holes are entered')).toBeVisible();
    await expect(pendingRow.locator('td').nth(20)).toHaveText('—');
    const inputs = pendingRow.getByRole('spinbutton');
    for (let index = 0; index < 18; index++) await inputs.nth(index).fill('5');
    await expect(pendingRow.getByText('Handicap 18.00 (first round)',{exact:true})).toBeVisible();
    await expect(pendingRow.locator('td').nth(19)).toHaveText('90');
    await expect(pendingRow.locator('td').nth(20)).toHaveText('72');
    await page.screenshot({path:`/tmp/handicap-team-preview-${mobile ? 'mobile' : 'desktop'}.png`,animations:'disabled'});

  });
}
