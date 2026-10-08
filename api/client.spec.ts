import { afterEach, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import apiClient from './client';

const instance = apiClient.getAxiosInstance();
const originalAdapter = instance.defaults.adapter;
afterEach(() => { instance.defaults.adapter = originalAdapter; });

it('preserves the server error code so trial expiry can open checkout', async () => {
  instance.defaults.adapter = async (config) => {
    throw new AxiosError('Payment required', 'ERR_BAD_REQUEST', config, undefined, {
      config, status: 402, statusText: 'Payment Required', headers: {},
      data: { code: 'TRIAL_EVENT_LIMIT', message: 'Activate this league to score another event.' },
    });
  };
  await expect(apiClient.post('/leagues/1/events/1/scores', {})).rejects.toMatchObject({
    code: 'TRIAL_EVENT_LIMIT', status: 402, message: 'Activate this league to score another event.',
  });
});
