import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, EntitlementState } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile(options?: { enabled?: boolean }) {
  const { actor, isFetching: actorFetching } = useActor();
  const enabled = options?.enabled ?? true;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: enabled && !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Entitlement Queries
export function useGetEntitlementState(options?: { enabled?: boolean }) {
  const { actor, isFetching: actorFetching } = useActor();
  const enabled = options?.enabled ?? true;

  const query = useQuery<EntitlementState | null>({
    queryKey: ['entitlementState'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEntitlementState();
    },
    enabled: enabled && !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useCreateTrial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTrial();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitlementState'] });
    },
  });
}

export function useStartSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.startSubscription();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitlementState'] });
    },
  });
}

export function useCancelSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelSubscription();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitlementState'] });
    },
  });
}
