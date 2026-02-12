import type { EntitlementState } from '../backend';

const TRIAL_DURATION_DAYS = 7;
const NANOSECONDS_PER_DAY = 24 * 60 * 60 * 1_000_000_000;

export function bigintToDate(nanos: bigint): Date {
  return new Date(Number(nanos / 1_000_000n));
}

export function computeTrialDaysRemaining(entitlement: EntitlementState): number {
  const trialStartDate = bigintToDate(entitlement.trialStart);
  const now = new Date();
  const elapsedMs = now.getTime() - trialStartDate.getTime();
  const elapsedDays = elapsedMs / (24 * 60 * 60 * 1000);
  const remaining = Math.max(0, TRIAL_DURATION_DAYS - Math.floor(elapsedDays));
  return remaining;
}

export function isTrialExpired(entitlement: EntitlementState): boolean {
  return computeTrialDaysRemaining(entitlement) === 0;
}

export function getEntitlementMessage(state: {
  hasEntitlement: boolean;
  isSubscribed: boolean;
  trialExpired: boolean;
  trialDaysRemaining: number;
}): string {
  if (!state.hasEntitlement) {
    return 'Start your free 7-day trial to unlock all features.';
  }
  if (state.isSubscribed) {
    return 'You have full access with an active subscription.';
  }
  if (state.trialExpired) {
    return 'Your free trial has expired. Subscribe using the external link, then return here and click "Activate Pro" to enable your subscription.';
  }
  return `Free trial active: ${state.trialDaysRemaining} ${state.trialDaysRemaining === 1 ? 'day' : 'days'} remaining.`;
}
