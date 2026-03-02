import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
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

  public type ToDo = {
    id : Nat;
    title : Text;
    description : Text;
    completed : Bool;
    createdAt : Int;
    owner : Principal;
  };

  public type OldActor = {
    devices : Map.Map<Text, DeviceInfo>;
    deviceStatusCache : Map.Map<Text, DeviceStatus>;
    userAccessState : Map.Map<Text, UserAccess>;
    accessEvents : Map.Map<Int, AccessEvent>;
    smartRules : Map.Map<Text, SmartRule>;
    logEvents : Map.Map<Time.Time, LogEvent>;
    userProfiles : Map.Map<Principal, UserProfile>;
    smartRuleLogs : Map.Map<Time.Time, SmartRuleLog>;
    adminDeviceCache : Set.Set<Text>;
    vacationModeActive : Bool;
    deviceNameCache : Map.Map<Text, Text>;
    deviceSyncTracker : Map.Map<Text, Time.Time>;
    deviceStatus : DeviceStatus;
  };

  public type NewActor = {
    devices : Map.Map<Text, DeviceInfo>;
    deviceStatusCache : Map.Map<Text, DeviceStatus>;
    userAccessState : Map.Map<Text, UserAccess>;
    accessEvents : Map.Map<Int, AccessEvent>;
    smartRules : Map.Map<Text, SmartRule>;
    logEvents : Map.Map<Time.Time, LogEvent>;
    userProfiles : Map.Map<Principal, UserProfile>;
    smartRuleLogs : Map.Map<Time.Time, SmartRuleLog>;
    adminDeviceCache : Set.Set<Text>;
    vacationModeActive : Bool;
    deviceNameCache : Map.Map<Text, Text>;
    deviceSyncTracker : Map.Map<Text, Time.Time>;
    todos : Map.Map<Nat, ToDo>;
    deviceStatus : DeviceStatus;
    toDoCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      todos = Map.empty<Nat, ToDo>();
      toDoCounter = 0;
    };
  };
};
