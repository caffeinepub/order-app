import { useGetEntitlementState, useCreateTrial, useStartSubscription, useCancelSubscription } from './useQueries';
import { computeTrialDaysRemaining, isTrialExpired, getEntitlementMessage } from '@/lib/entitlement';
import { useInternetIdentity } from './useInternetIdentity';

export function useEntitlement() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: entitlementState, isLoading, error } = useGetEntitlementState({ enabled: isAuthenticated });
  const createTrialMutation = useCreateTrial();
  const startSubscriptionMutation = useStartSubscription();
  const cancelSubscriptionMutation = useCancelSubscription();

  const hasEntitlement = entitlementState !== null;
  const isSubscribed = entitlementState?.isSubscribed ?? false;
  const trialExpired = entitlementState ? isTrialExpired(entitlementState) : false;
  const trialDaysRemaining = entitlementState ? computeTrialDaysRemaining(entitlementState) : 0;
  const hasActiveAccess = isSubscribed || (hasEntitlement && !trialExpired);

  const startTrial = async () => {
    try {
      await createTrialMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to start trial:', error);
      throw error;
    }
  };

  const subscribe = async () => {
    try {
      await startSubscriptionMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to start subscription:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      await cancelSubscriptionMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  };

  const message = getEntitlementMessage({
    hasEntitlement,
    isSubscribed,
    trialExpired,
    trialDaysRemaining,
  });

  return {
    entitlementState,
    isLoading: isAuthenticated ? isLoading : false,
    error,
    hasEntitlement,
    isSubscribed,
    trialExpired,
    trialDaysRemaining,
    hasActiveAccess,
    message,
    startTrial,
    subscribe,
    cancelSubscription,
    isStartingTrial: createTrialMutation.isPending,
    isSubscribing: startSubscriptionMutation.isPending,
    isCanceling: cancelSubscriptionMutation.isPending,
  };
}
