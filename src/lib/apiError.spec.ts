import { expect, it } from 'vitest';
import { isTrialEventLimitError } from './apiError';

it('handles only the specific scored-event trial limit', () => {
  expect(isTrialEventLimitError({status:402,code:'TRIAL_EVENT_LIMIT'})).toBe(true);
  for (const error of [null, 'TRIAL_EVENT_LIMIT', {status:402}, {status:403,code:'TRIAL_EVENT_LIMIT'}, {status:402,code:'LEAGUE_PAYMENT_DUE'}]) {
    expect(isTrialEventLimitError(error)).toBe(false);
  }
});
