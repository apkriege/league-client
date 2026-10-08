import { expect, test } from '@playwright/test';

for (const mobile of [false, true]) {
  test(`expired scoring trial opens checkout instead of a toast ${mobile ? '@mobile' : ''}`, async ({page}) => {
    test.setTimeout(60_000);
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('integration-test-password');
    await page.getByRole('button',{name:'Sign in',exact:true}).click();
    await expect(page).toHaveURL(/\/leagues$/);
    const leaguesResponse = await page.request.get('http://127.0.0.1:3310/api/leagues');
    expect(leaguesResponse.ok()).toBe(true);
    const {leagues} = await leaguesResponse.json();
    const trial = leagues.find((league: {name:string}) => league.name.startsWith('Trial League'));
    expect(trial).toBeTruthy();
    const leagueResponse = await page.request.get(`http://127.0.0.1:3310/api/leagues/${trial.id}`);
    const league = await leagueResponse.json();
    const player = league.players[0];
    const eventId = 99999888;
    const scoresPath = `/league/${league.id}/events/${eventId}/scores`;
    const eventUrl = `**/api/leagues/${league.id}/events/${eventId}`;
    let preflightBlocked = true;
    const trialMessage = 'Your free trial includes 3 scored events. Activate this league to score another event.';
    await page.route(eventUrl, route => route.fulfill({json:{
      trialLimitMessage:preflightBlocked ? trialMessage : null,id:eventId,leagueId:league.id,name:'Trial checkout scoring',format:'individual',scoringMode:'stroke-play',
      startsAt:'2026-10-07T15:00:00Z',timeZone:'UTC',holes:9,canEnterScores:true,canEditScores:false,
      scoringHoles:Array.from({length:9},(_,index)=>({num:index+1,par:4,hcp:index+1})),
      flights:[{id:eventId,status:'not_started',startsAt:'2026-10-07T15:00:00Z',players:[{
        playerId:player.id,handicapIndex:9,player:{...player,handicap:9,rounds:[]},
      }]}],
    }}));
    let trialExpired = false;
    await page.route(`${eventUrl}/scores`, route => route.fulfill({status:trialExpired ? 402 : 422,json:
      trialExpired ? {code:'TRIAL_EVENT_LIMIT',message:trialMessage} : {message:'Scores could not be validated.'},
    }));
    await page.route(`**/api/leagues/${league.id}/events`, route => route.fulfill({json:[{
      id:eventId,name:'Trial checkout scoring',format:'individual',status:'active',startsAt:'2026-10-07T15:00:00Z',
      timeZone:'UTC',holes:9,canEnterScores:true,canEditScores:false,flights:[],
    }]}));
    await page.goto(`/league/${league.id}/admin`);
    await page.getByRole('link',{name:'Enter Scores',exact:true}).first().click();
    const preflightDialog = page.getByRole('dialog',{name:'Your free trial is over'});
    await expect(preflightDialog).toBeVisible();
    await expect(page.getByRole('spinbutton')).toHaveCount(0);
    await expect(preflightDialog.getByRole('button',{name:'Continue to checkout'})).toBeEnabled();
    await page.screenshot({path:`/tmp/trial-entry-checkout-${mobile ? 'mobile' : 'desktop'}.png`,animations:'disabled'});
    await preflightDialog.getByRole('button',{name:'Back to league'}).click();
    await expect(page).toHaveURL(new RegExp(`/league/${league.id}/admin$`));
    preflightBlocked = false;
    await page.goto(scoresPath);
    const inputs = page.getByRole('spinbutton');
    await expect(inputs).toHaveCount(9);
    for (let index=0;index<9;index++) await inputs.nth(index).fill('5');
    await page.getByRole('button',{name:'Submit Scores',exact:true}).click();
    await expect(page.getByRole('alert').filter({hasText:'Scores could not be validated.'})).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button',{name:'Dismiss notification'}).click();
    trialExpired = true;
    await page.getByRole('button',{name:'Submit Scores',exact:true}).click();
    const dialog = page.getByRole('dialog',{name:'Your free trial is over'});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Have a free code? Enter it below for full access to this league. Otherwise, continue to checkout.')).toBeVisible();
    await expect(page.getByRole('alert').filter({hasText:trialMessage})).toHaveCount(0);
    await dialog.getByRole('button',{name:'Back to scores'}).click();
    await expect(dialog).toBeHidden();
    await expect(inputs.first()).toHaveValue('5');
    await page.reload();
    await expect(inputs.first()).toHaveValue('5');
    await page.getByRole('button',{name:'Submit Scores',exact:true}).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button',{name:'Continue to checkout'})).toBeEnabled();
    await page.screenshot({path:`/tmp/trial-scoring-checkout-${mobile ? 'mobile' : 'desktop'}.png`,animations:'disabled'});
    let checkoutAttempts = 0;
    await page.route('**/api/payments/checkout-session', async route => {
      const payload = route.request().postDataJSON();
      expect(payload).toMatchObject({purpose:'league_capacity',leagueId:league.id,requestedGolfers:league.entitlement.requiredGolfers});
      expect(payload.successUrl).toContain(`/league/${league.id}/admin?checkout=season_payment_success`);
      checkoutAttempts++;
      await route.fulfill({status:checkoutAttempts === 1 ? 500 : 200,json:checkoutAttempts === 1
        ? {message:'Checkout temporarily unavailable.'}
        : {url:'http://127.0.0.1:4173/test-checkout',alreadyCovered:false}});
    });
    await dialog.getByRole('button',{name:'Continue to checkout'}).click();
    await expect(dialog.getByRole('alert')).toHaveText('Checkout temporarily unavailable.');
    await expect(dialog.getByRole('button',{name:'Continue to checkout'})).toBeEnabled();
    await page.route('**/test-checkout', route => route.fulfill({contentType:'text/html',body:'<h1>Checkout preview</h1>'}));
    await dialog.getByRole('button',{name:'Continue to checkout'}).click();
    await expect(page).toHaveURL(/\/test-checkout$/);
    expect(checkoutAttempts).toBe(2);
  });
}

for (const mobile of [false, true]) {
  test(`free code activates only the league in the trial modal ${mobile ? '@mobile' : ''}`, async ({page,request}) => {
    test.setTimeout(60_000);
    await request.post('http://127.0.0.1:3310/api/auth/login',{data:{email:'super@test.com',password:'integration-test-password'}});
    const generated = await request.post('http://127.0.0.1:3310/api/admin/payment-bypass-codes',{data:{label:'Browser trial activation',expiresInDays:30}});
    expect(generated.status()).toBe(201);
    const {code} = await generated.json();
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('integration-test-password');
    await page.getByRole('button',{name:'Sign in',exact:true}).click();
    await expect(page).toHaveURL(/\/leagues$/);
    const created = await page.request.post('http://127.0.0.1:3310/api/leagues',{data:{
      billingDraftKey:crypto.randomUUID(),startTrial:true,name:`Code trial ${mobile ? 'mobile' : 'desktop'}`,
      type:'season',format:'individual',holeFormat:'9',handicapHoleBasis:9,numPlayers:1,
      startDate:'2026-01-01',endDate:'2027-01-01',contactFirstName:'Code',contactLastName:'Test',contactEmail:'admin@test.com',
      players:[{id:1,firstName:'Code',lastName:'Golfer',gender:'male',handicap:9,type:'player'}],teams:[],
    }});
    expect(created.status(),await created.text()).toBe(201);
    const league = await created.json();
    const details = await page.request.get(`http://127.0.0.1:3310/api/leagues/${league.id}`);
    const player = (await details.json()).players[0];
    let activated = false;
    let checkoutRequests = 0;
    await page.route('**/api/payments/checkout-session',route => {checkoutRequests++;return route.fulfill({status:500,json:{message:'Checkout should not be used for a free code.'}});});
    await page.route('**/api/payments/bypass-code',async route => {
      expect(route.request().postDataJSON().leagueId).toBe(league.id);
      const response = await route.fetch();
      if (response.ok()) activated = true;
      await route.fulfill({response});
    });
    await page.goto(`/league/${league.id}/admin`);
    await page.getByRole('button',{name:'Activate',exact:true}).click();
    const adminActivation = page.getByRole('dialog',{name:'Activate your league'});
    await expect(adminActivation).toBeVisible();
    await expect(adminActivation.getByLabel('Code',{exact:true})).toBeVisible();
    await expect(adminActivation.getByRole('button',{name:'Continue to checkout'})).toBeEnabled();
    expect(checkoutRequests).toBe(0);
    await page.screenshot({path:`/tmp/admin-activate-modal-${mobile ? 'mobile' : 'desktop'}.png`,animations:'disabled'});
    await adminActivation.getByRole('button',{name:'Back to league'}).click();
    await expect(adminActivation).toBeHidden();
    const eventId = 99999777;
    await page.route(`**/api/leagues/${league.id}/events/${eventId}`,route => route.fulfill({json:{
      id:eventId,leagueId:league.id,name:'Free code score entry',format:'individual',scoringMode:'stroke-play',
      startsAt:'2026-10-07T15:00:00Z',timeZone:'UTC',holes:9,canEnterScores:true,canEditScores:false,
      trialLimitMessage:activated ? null : 'Your free trial includes 3 scored events. Activate this league to score another event.',
      scoringHoles:Array.from({length:9},(_,index)=>({num:index+1,par:4,hcp:index+1})),
      flights:[{id:eventId,status:'not_started',startsAt:'2026-10-07T15:00:00Z',players:[{playerId:player.id,handicapIndex:9,player:{...player,rounds:[]}}]}],
    }}));
    await page.goto(`/league/${league.id}/events/${eventId}/scores`);
    const dialog = page.getByRole('dialog',{name:'Your free trial is over'});
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('spinbutton')).toHaveCount(0);
    await dialog.getByLabel('Code',{exact:true}).fill('INVALID-CODE');
    await dialog.getByRole('button',{name:'Apply',exact:true}).click();
    await expect(dialog.getByRole('alert')).toContainText('invalid');
    await expect(page.getByRole('alert')).toHaveCount(1);
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Code',{exact:true}).fill(code.toLowerCase());
    await page.screenshot({path:`/tmp/trial-free-code-${mobile ? 'mobile' : 'desktop'}.png`,animations:'disabled'});
    await dialog.getByRole('button',{name:'Apply',exact:true}).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('spinbutton')).toHaveCount(9);
    expect(checkoutRequests).toBe(0);
    const refreshed = await page.request.get(`http://127.0.0.1:3310/api/leagues/${league.id}`);
    expect((await refreshed.json()).entitlement.status).toBe('bypassed');
    expect((await page.request.post('http://127.0.0.1:3310/api/payments/bypass-code',{data:{code,leagueId:league.id}})).status()).toBe(400);
  });
}
