/* Build-time feature flags. UI flags are not authorization: the backend checks roles and state. */
const on = (value: string | undefined): boolean => value === 'true';

/** Demo data only exists in development; production must never fall back to mock screens. */
export const DEMO_DATA_ENABLED = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false';

/** Staging may enable these explicitly; production defaults to off. */
export const AGREEMENT_CONFIRM_ENABLED = import.meta.env.DEV || on(import.meta.env.VITE_ENABLE_AGREEMENT_CONFIRM);
export const CONTRACT_SIGN_ENABLED = import.meta.env.DEV || on(import.meta.env.VITE_ENABLE_CONTRACT_SIGN);

/** Deposit stays off until Toss sandbox and webhook verification are complete. */
export const DEPOSIT_ENABLED = on(import.meta.env.VITE_ENABLE_DEPOSIT);

/** Public Toss client key (API 개별 연동). Never put the secret key in the frontend. */
export const TOSS_CLIENT_KEY = (import.meta.env.VITE_TOSS_CLIENT_KEY ?? '').trim();
