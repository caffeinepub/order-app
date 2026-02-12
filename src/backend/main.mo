import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Entitlements "entitlements";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Store entitlement states per user
  let entitlementStates = Map.empty<Principal, Entitlements.EntitlementState>();

  // User profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or be an admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Entitlement management functions
  public shared ({ caller }) func createTrial() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create trials");
    };

    // Check if trial already exists for this user
    switch (entitlementStates.get(caller)) {
      case (?_) {
        Runtime.trap("Trial or subscription already exists for this user");
      };
      case (null) {
        // Create new trial
        let entitlementState : Entitlements.EntitlementState = {
          trialStart = Time.now();
          isSubscribed = false;
        };
        entitlementStates.add(caller, entitlementState);
      };
    };
  };

  public query ({ caller }) func hasActiveEntitlement() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check entitlements");
    };

    switch (entitlementStates.get(caller)) {
      case (null) {
        false;
      };
      case (?entitlement) {
        Entitlements.isEntitlementValid(entitlement);
      };
    };
  };

  public query ({ caller }) func isTrialActive() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check trial status");
    };

    switch (entitlementStates.get(caller)) {
      case (null) {
        false;
      };
      case (?entitlement) {
        Entitlements.isTrialValid(entitlement);
      };
    };
  };

  public query ({ caller }) func getEntitlementState() : async ?Entitlements.EntitlementState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view entitlement state");
    };

    entitlementStates.get(caller);
  };

  public shared ({ caller }) func startSubscription() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can start subscriptions");
    };

    // Check if entitlement already exists for this user
    switch (entitlementStates.get(caller)) {
      case (null) {
        // No existing entitlement, create with current timestamp
        let newState : Entitlements.EntitlementState = {
          trialStart = Time.now();
          isSubscribed = true;
        };
        entitlementStates.add(caller, newState);
      };
      case (?existingState) {
        // Existing entitlement -> only set subscription to true and use existing trialStart timestamp
        let updatedState = {
          existingState with
          isSubscribed = true;
        };
        entitlementStates.add(caller, updatedState);
      };
    };
  };

  public shared ({ caller }) func cancelSubscription() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can cancel subscriptions");
    };

    switch (entitlementStates.get(caller)) {
      case (null) {
        Runtime.trap("No subscription or trial found for this user");
      };
      case (?entitlement) {
        let updatedEntitlement = {
          entitlement with
          isSubscribed = false;
        };
        entitlementStates.add(caller, updatedEntitlement);
      };
    };
  };

  // Admin-only functions
  public query ({ caller }) func getAllEntitlements() : async [(Principal, Entitlements.EntitlementState)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all entitlements");
    };

    entitlementStates.entries().toArray();
  };

  public query ({ caller }) func getUserEntitlement(user : Principal) : async ?Entitlements.EntitlementState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view other users' entitlements");
    };

    entitlementStates.get(user);
  };

  public shared ({ caller }) func setUserSubscription(user : Principal, isSubscribed : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify user subscriptions");
    };

    switch (entitlementStates.get(user)) {
      case (null) {
        let entitlementState : Entitlements.EntitlementState = {
          trialStart = Time.now();
          isSubscribed = isSubscribed;
        };
        entitlementStates.add(user, entitlementState);
      };
      case (?entitlement) {
        let updatedEntitlement = {
          entitlement with
          isSubscribed = isSubscribed;
        };
        entitlementStates.add(user, updatedEntitlement);
      };
    };
  };
};
