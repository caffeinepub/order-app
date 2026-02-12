import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface EntitlementState {
    trialStart: Time;
    isSubscribed: boolean;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelSubscription(): Promise<void>;
    createTrial(): Promise<void>;
    getAllEntitlements(): Promise<Array<[Principal, EntitlementState]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntitlementState(): Promise<EntitlementState | null>;
    getUserEntitlement(user: Principal): Promise<EntitlementState | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasActiveEntitlement(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isTrialActive(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserSubscription(user: Principal, isSubscribed: boolean): Promise<void>;
    startSubscription(): Promise<void>;
}
