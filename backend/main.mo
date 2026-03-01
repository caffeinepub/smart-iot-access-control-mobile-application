import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type TimeSlot = {
    day : Nat;
    startHour : Nat;
    endHour : Nat;
  };

  public type UserAccess = {
    rfidUid : Text;
    pinCode : Text;
    name : Text;
    accessLevel : UserRole;
    isActive : Bool;
    lastAccess : Int;
    failedAttempts : Nat;
    email : Text;
    role : UserRole;
    accessWindow : [TimeSlot];
  };

  public type DeviceStatus = {
    isLocked : Bool;
    batteryLevel : Nat;
    lastSync : Int;
    currentUsers : Nat;
    firmwareVersion : Text;
    wifiSignalStrength : Int;
    tamperDetected : Bool;
    emergencyMode : Bool;
  };

  public type AccessEvent = {
    rfidUid : Text;
    timestamp : Int;
    success : Bool;
    eventType : Text;
    location : Text;
    method : Text;
    userEmail : Text;
  };

  public type SmartRule = {
    ruleName : Text;
    action : Text;
    schedule : Text;
    users : [Text];
    triggers : [Text];
    active : Bool;
    createdBy : Text;
    deviceId : Text;
  };

  public type LogEvent = {
    message : Text;
    code : Text;
    timestamp : Time.Time;
    level : Text;
    deviceId : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    rfidUid : Text;
  };

  public type DeviceInfo = {
    deviceId : Text;
    deviceName : Text;
    status : DeviceStatus;
    isConnected : Bool;
    lastSync : Time.Time;
  };

  public type SmartRuleLog = {
    timestamp : Time.Time;
    ruleName : Text;
    triggerCondition : Text;
    actionTaken : Text;
    outcome : Bool;
  };

  module LogEvent {
    public func compareByTimestamp(a : LogEvent, b : LogEvent) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module SmartRuleLog {
    public func compareByTimestamp(a : SmartRuleLog, b : SmartRuleLog) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module AccessEvent {
    public func compareByTimestamp(a : AccessEvent, b : AccessEvent) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  let devices = Map.empty<Text, DeviceInfo>();
  let deviceStatusCache = Map.empty<Text, DeviceStatus>();
  let userAccessState = Map.empty<Text, UserAccess>();
  let accessEvents = Map.empty<Int, AccessEvent>();
  let smartRules = Map.empty<Text, SmartRule>();
  let logEvents = Map.empty<Time.Time, LogEvent>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let smartRuleLogs = Map.empty<Time.Time, SmartRuleLog>();
  let adminDeviceCache = Set.empty<Text>();
  var vacationModeActive = false;
  let deviceNameCache = Map.empty<Text, Text>();
  let deviceSyncTracker = Map.empty<Text, Time.Time>();

  // State
  var deviceStatus : DeviceStatus = {
    isLocked = true;
    batteryLevel = 100;
    lastSync = 0;
    currentUsers = 0;
    firmwareVersion = "1.0.0";
    wifiSignalStrength = 80;
    tamperDetected = false;
    emergencyMode = false;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    addLogEvent("User profile updated for " # profile.name);
  };

  public shared ({ caller }) func assignDeviceToAdmin(deviceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign devices to admins");
    };
    adminDeviceCache.add(deviceId);
    addLogEvent("Device assigned to admin: " # deviceId);
  };

  public query ({ caller }) func isDeviceAdmin(deviceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check device admin status");
    };
    if (not adminDeviceCache.contains(deviceId)) {
      Runtime.trap("Device is not an admin device");
    };
  };

  // Device Management
  public shared ({ caller }) func addDevice(deviceId : Text, deviceName : Text, encryptedCredentials : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add devices");
    };
    let _credentials = decryptCredentials(encryptedCredentials);
    let newDevice = {
      deviceId;
      deviceName;
      status = deviceStatus;
      isConnected = true;
      lastSync = Time.now();
    };
    devices.add(deviceId, newDevice);
    addLogEvent("Added new device: " # deviceName # " (" # deviceId # ")");
    deviceNameCache.add(deviceId, deviceName);
  };

  public query ({ caller }) func getDeviceNameCache() : async [(Text, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    deviceNameCache.toArray();
  };

  func decryptCredentials(_ : Text) : Text {
    "decryptedDummy";
  };

  public shared ({ caller }) func updateDeviceStatus(deviceId : Text, newStatus : DeviceStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let existingDevice = devices.get(deviceId);
    switch (existingDevice) {
      case (null) { Runtime.trap("Device not found: " # deviceId) };
      case (?device) {
        let updatedDevice = {
          device with
          status = newStatus;
          lastSync = Time.now();
        };
        devices.add(deviceId, updatedDevice);
        deviceStatusCache.add(deviceId, newStatus);
        deviceSyncTracker.add(deviceId, Time.now());
        addLogEvent("Device status updated for: " # device.deviceName);
      };
    };
  };

  public shared ({ caller }) func toggleDeviceLock(deviceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle device lock");
    };
    let existingDevice = devices.get(deviceId);
    switch (existingDevice) {
      case (null) { Runtime.trap("Device not found: " # deviceId) };
      case (?device) {
        let newLockState = not device.status.isLocked;
        handleLockToggle(device, newLockState);
      };
    };
  };

  func handleLockToggle(device : DeviceInfo, newLockState : Bool) {
    let updatedStatus = {
      device.status with
      isLocked = newLockState;
      lastSync = Time.now();
    };
    let updatedDevice = {
      device with
      status = updatedStatus;
    };
    devices.add(device.deviceId, updatedDevice);
    deviceStatusCache.add(device.deviceId, updatedStatus);
    deviceSyncTracker.add(device.deviceId, Time.now());
    addLogEvent("Toggled lock state for " # device.deviceName # ": " # (if newLockState { "locked" } else {
      "unlocked";
    }));
  };

  // Direct device queries by deviceId
  public query ({ caller }) func getDeviceStatusById(deviceId : Text) : async ?DeviceStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view device status");
    };
    let device = devices.get(deviceId);
    switch (device) {
      case (null) { Runtime.trap("Device not found: " # deviceId) };
      case (?d) { ?d.status };
    };
  };

  public query ({ caller }) func getDeviceStatsById(deviceId : Text) : async ?DeviceStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view device stats");
    };
    let device = devices.get(deviceId);
    switch (device) {
      case (null) { null };
      case (?d) { ?d.status };
    };
  };

  // Bulk device data
  public query ({ caller }) func getAllDeviceStatuses() : async [(Text, DeviceStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view device statuses");
    };
    let array = devices.toArray();
    array.map(func((deviceId, device)) { (deviceId, device.status) });
  };

  public query ({ caller }) func getAllDevices() : async [(Text, DeviceInfo)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view devices");
    };
    let array = devices.toArray();
    array;
  };

  public query ({ caller }) func getDeviceList() : async [DeviceInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view devices");
    };
    let iter = devices.values();
    iter.toArray();
  };

  public query ({ caller }) func getDeviceCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view devices");
    };
    devices.size();
  };

  // Get specific device information
  public query ({ caller }) func getDeviceById(deviceId : Text) : async {
    id : Text;
    name : Text;
    status : DeviceStatus;
    isConnected : Bool;
    lastSync : Time.Time;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view device information");
    };
    switch (devices.get(deviceId)) {
      case (null) { Runtime.trap("Device not found: " # deviceId) };
      case (?device) {
        {
          id = device.deviceId;
          name = device.deviceName;
          status = device.status;
          isConnected = device.isConnected;
          lastSync = device.lastSync;
        };
      };
    };
  };

  // Vacation Mode (Admin)
  public shared ({ caller }) func enableVacationMode() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can enable vacation mode");
    };
    vacationModeActive := true;
    addLogEvent("Vacation Mode Activated");
  };

  public shared ({ caller }) func disableVacationMode() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can disable vacation mode");
    };
    vacationModeActive := false;
    addLogEvent("Vacation Mode Disabled");
  };

  public query ({ caller }) func getVacationModeStatus() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view vacation mode status");
    };
    vacationModeActive;
  };

  public shared ({ caller }) func syncDevice(deviceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can sync devices");
    };
    switch (devices.get(deviceId)) {
      case (null) { Runtime.trap("Device not found") };
      case (?_) {
        deviceSyncTracker.add(deviceId, Time.now());
        addLogEvent("Device synced: " # deviceId);
      };
    };
  };

  func addLogEvent(msg : Text) {
    let newLog = {
      message = msg;
      code = "INFO";
      timestamp = Time.now();
      level = "INFO";
      deviceId = "default";
    };
    logEvents.add(Time.now(), newLog);
  };

  // User Management - admin only
  public query ({ caller }) func getUsers() : async [UserAccess] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view users");
    };
    userAccessState.values().toArray();
  };

  public shared ({ caller }) func addUser(user : UserAccess) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    userAccessState.add(user.rfidUid, user);
    addLogEvent("User added " # user.name);
  };

  public shared ({ caller }) func removeUser(uid : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not userAccessState.containsKey(uid)) {
      Runtime.trap("User does not exist.");
    };
    userAccessState.remove(uid);
    addLogEvent("User removed " # uid);
  };

  public shared ({ caller }) func disableUser(uid : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (userAccessState.get(uid)) {
      case (null) { Runtime.trap("User does not exist.") };
      case (?user) {
        userAccessState.add(
          uid,
          {
            user with
            isActive = false;
          },
        );
        addLogEvent("User disabled " # uid);
      };
    };
  };

  public shared ({ caller }) func enableUser(uid : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (userAccessState.get(uid)) {
      case (null) { Runtime.trap("User does not exist.") };
      case (?user) {
        userAccessState.add(
          uid,
          {
            user with
            isActive = true;
          },
        );
        addLogEvent("User enabled " # uid);
      };
    };
  };

  // Set recurring access window schedule for a user - admin only
  public shared ({ caller }) func setUserAccessWindow(uid : Text, accessWindow : [TimeSlot]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set user access windows");
    };
    switch (userAccessState.get(uid)) {
      case (null) { Runtime.trap("User does not exist.") };
      case (?user) {
        userAccessState.add(
          uid,
          {
            user with
            accessWindow = accessWindow;
          },
        );
        addLogEvent("Access window updated for user: " # uid);
      };
    };
  };

  // Get access window for a specific user - admin only
  public query ({ caller }) func getUserAccessWindow(uid : Text) : async [TimeSlot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view user access windows");
    };
    switch (userAccessState.get(uid)) {
      case (null) { Runtime.trap("User does not exist.") };
      case (?user) { user.accessWindow };
    };
  };

  // Record an access event - admin only (used by access log simulation)
  // The caller (admin/system) is responsible for checking the access window
  // and marking the event as unauthorized if outside the window.
  public shared ({ caller }) func recordAccessEvent(event : AccessEvent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record access events");
    };
    accessEvents.add(event.timestamp, event);
    let statusText = if (event.success) { "granted" } else { "denied" };
    addLogEvent("Access event recorded for " # event.userEmail # ": " # statusText # " via " # event.method);
  };

  // Simulate an access attempt - checks access window and records the event
  // Admin only: simulates the door controller logic
  public shared ({ caller }) func simulateAccessAttempt(
    rfidUid : Text,
    userEmail : Text,
    location : Text,
    method : Text,
    dayOfWeek : Nat,
    hourOfDay : Nat,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can simulate access attempts");
    };

    let now = Time.now();
    var authorized = false;
    var withinWindow = true;

    // Look up user by rfidUid
    switch (userAccessState.get(rfidUid)) {
      case (null) {
        // Unknown user - deny
        authorized := false;
        withinWindow := false;
      };
      case (?user) {
        if (not user.isActive) {
          authorized := false;
          withinWindow := false;
        } else {
          // Check access window if one is defined
          if (user.accessWindow.size() > 0) {
            withinWindow := false;
            for (slot in user.accessWindow.vals()) {
              if (slot.day == dayOfWeek and hourOfDay >= slot.startHour and hourOfDay < slot.endHour) {
                withinWindow := true;
              };
            };
          };
          authorized := withinWindow;
        };
      };
    };

    let event : AccessEvent = {
      rfidUid;
      timestamp = now;
      success = authorized;
      eventType = if (authorized) { "ACCESS_GRANTED" } else { "ACCESS_DENIED" };
      location;
      method;
      userEmail;
    };
    accessEvents.add(now, event);

    let statusText = if (authorized) { "granted" } else { "denied (outside access window or inactive)" };
    addLogEvent("Simulated access for " # userEmail # ": " # statusText);

    authorized;
  };

  // Get all access events - admin only
  public query ({ caller }) func getAccessEvents() : async [AccessEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view access events");
    };
    accessEvents.values().toArray().sort(AccessEvent.compareByTimestamp);
  };

  // Get failed access events in the last 24 hours - admin only
  public query ({ caller }) func getFailedAccessEventsLast24h() : async [AccessEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view failed access events");
    };
    let oneDayNanos : Int = 86_400_000_000_000;
    let cutoff : Int = Time.now() - oneDayNanos;
    let allEvents = accessEvents.values().toArray();
    allEvents.filter(func(e : AccessEvent) : Bool {
      not e.success and e.timestamp >= cutoff
    });
  };

  // Smart Rules - admin only
  public query ({ caller }) func getSmartRules() : async [SmartRule] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view smart rules");
    };
    smartRules.values().toArray();
  };

  public shared ({ caller }) func addSmartRule(rule : SmartRule) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    smartRules.add(rule.ruleName, rule);
    addLogEvent("Smart rule added: " # rule.ruleName);
  };

  public shared ({ caller }) func removeSmartRule(ruleName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not smartRules.containsKey(ruleName)) {
      Runtime.trap("Smart rule does not exist.");
    };
    smartRules.remove(ruleName);
    addLogEvent("Smart rule removed: " # ruleName);
  };

  // Smart Rule Logging
  public shared ({ caller }) func logSmartRuleExecution(
    ruleName : Text,
    triggerCondition : Text,
    actionTaken : Text,
    outcome : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can log smart rule executions");
    };

    let newLog : SmartRuleLog = {
      timestamp = Time.now();
      ruleName;
      triggerCondition;
      actionTaken;
      outcome;
    };

    smartRuleLogs.add(Time.now(), newLog);
    addLogEvent("Smart rule executed: " # ruleName);
  };

  public query ({ caller }) func getSmartRuleExecutionLog() : async [SmartRuleLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view smart rule execution logs");
    };
    let sortedLogs = smartRuleLogs.values().toArray().sort(SmartRuleLog.compareByTimestamp);
    sortedLogs;
  };

  // Event Logs - admin only
  public query ({ caller }) func getEventLogs() : async [LogEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view event logs");
    };
    let sortedLogs = logEvents.values().toArray().sort(LogEvent.compareByTimestamp);
    sortedLogs;
  };

  // Legacy Device Status (for backward compatibility)
  public query ({ caller }) func getDefaultDeviceStatus() : async DeviceStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view device status");
    };
    deviceStatus;
  };

  public shared ({ caller }) func toggleDefaultDeviceLock() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle device lock");
    };
    deviceStatus := {
      deviceStatus with
      isLocked = not deviceStatus.isLocked;
      lastSync = Time.now();
    };
    addLogEvent("Default device lock toggled: " # (if (deviceStatus.isLocked) { "locked" } else { "unlocked" }));
  };

  // Holiday Monitoring
  public shared ({ caller }) func toggleHolidayLights(status : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle holiday lights");
    };
    if (status) {
      addLogEvent("Holiday lights enabled");
    } else {
      addLogEvent("Holiday lights disabled");
    };
  };

  // Visual security feature
  public query ({ caller }) func getSecurityDecoyStatus() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view security status");
    };
    false;
  };

  // Admin Dashboard - admin only
  public query ({ caller }) func getAdminDashboardData() : async {
    totalUsers : Nat;
    activeUsers : Nat;
    disabledUsers : Nat;
    guestUsers : Nat;
    deviceStatuses : [(Text, DeviceStatus)];
    accessEventFeed : [AccessEvent];
    failedAccessLast24h : Nat;
    vacationMode : Bool;
    activeSmartRulesCount : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access admin dashboard");
    };

    let allUsers = userAccessState.values().toArray();
    let activeUsers = allUsers.filter(func(u : UserAccess) : Bool { u.isActive }).size();
    let disabledUsers = allUsers.filter(func(u : UserAccess) : Bool { not u.isActive }).size();
    let guestUsers = allUsers.filter(func(u : UserAccess) : Bool { u.role == #guest }).size();

    let allEvents = accessEvents.values().toArray().sort(AccessEvent.compareByTimestamp);

    let oneDayNanos : Int = 86_400_000_000_000;
    let cutoff : Int = Time.now() - oneDayNanos;
    let failedLast24h = allEvents.filter(func(e : AccessEvent) : Bool {
      not e.success and e.timestamp >= cutoff
    }).size();

    let activeRules = smartRules.values().toArray().filter(func(r : SmartRule) : Bool { r.active }).size();

    {
      totalUsers = allUsers.size();
      activeUsers;
      disabledUsers;
      guestUsers;
      deviceStatuses = devices.toArray().map(
        func((id, d)) { (id, d.status) }
      );
      accessEventFeed = allEvents;
      failedAccessLast24h = failedLast24h;
      vacationMode = vacationModeActive;
      activeSmartRulesCount = activeRules;
    };
  };
};
