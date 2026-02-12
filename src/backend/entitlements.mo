import Time "mo:core/Time";

module {
  public type EntitlementState = {
    trialStart : Time.Time;
    isSubscribed : Bool;
  };

  public func isEntitlementValid(entitlement : EntitlementState) : Bool {
    entitlement.isSubscribed or isTrialValid(entitlement);
  };

  public func isTrialValid(entitlement : EntitlementState) : Bool {
    let trialDuration : Int = 7 * 24 * 60 * 60 * 1000000000; // 7 days in nanoseconds
    let systemTime = Time.now();
    systemTime - entitlement.trialStart < trialDuration;
  };
};
