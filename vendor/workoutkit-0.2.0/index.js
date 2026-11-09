// src/schema.ts
var ActivityType = {
  americanFootball: 1,
  archery: 2,
  australianFootball: 3,
  badminton: 4,
  baseball: 5,
  basketball: 6,
  bowling: 7,
  boxing: 8,
  climbing: 9,
  cricket: 10,
  crossTraining: 11,
  curling: 12,
  cycling: 13,
  dance: 14,
  elliptical: 16,
  equestrianSports: 17,
  fencing: 18,
  fishing: 19,
  functionalStrengthTraining: 20,
  golf: 21,
  gymnastics: 22,
  handball: 23,
  hiking: 24,
  hockey: 25,
  hunting: 26,
  lacrosse: 27,
  martialArts: 28,
  mindAndBody: 29,
  paddleSports: 31,
  play: 32,
  preparationAndRecovery: 33,
  racquetball: 34,
  rowing: 35,
  rugby: 36,
  running: 37,
  sailing: 38,
  skatingSports: 39,
  snowSports: 40,
  soccer: 41,
  softball: 42,
  squash: 43,
  stairClimbing: 44,
  surfingSports: 45,
  swimming: 46,
  tableTennis: 47,
  tennis: 48,
  trackAndField: 49,
  traditionalStrengthTraining: 50,
  volleyball: 51,
  walking: 52,
  waterFitness: 53,
  waterPolo: 54,
  waterSports: 55,
  wrestling: 56,
  yoga: 57,
  barre: 58,
  coreTraining: 59,
  crossCountrySkiing: 60,
  downhillSkiing: 61,
  flexibility: 62,
  highIntensityIntervalTraining: 63,
  jumpRope: 64,
  kickboxing: 65,
  pilates: 66,
  snowboarding: 67,
  stairs: 68,
  stepTraining: 69,
  wheelchairWalkPace: 70,
  wheelchairRunPace: 71,
  taiChi: 72,
  mixedCardio: 73,
  handCycling: 74,
  discSports: 75,
  fitnessGaming: 76,
  cardioDance: 77,
  socialDance: 78,
  pickleball: 79,
  cooldown: 80,
  swimBikeRun: 82,
  transition: 83,
  underwaterDiving: 84,
  other: 3e3
};

// src/quantities.ts
var Distance = class _Distance {
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }
  value;
  unit;
  static fromJson(json) {
    return new _Distance(json.value, json.unit);
  }
  toJSON() {
    return { value: this.value, unit: this.unit };
  }
};
var Duration = class _Duration {
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }
  value;
  unit;
  static fromJson(json) {
    return new _Duration(json.value, json.unit);
  }
  toJSON() {
    return { value: this.value, unit: this.unit };
  }
};
var Energy = class _Energy {
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }
  value;
  unit;
  static fromJson(json) {
    return new _Energy(json.value, json.unit);
  }
  toJSON() {
    return { value: this.value, unit: this.unit };
  }
};
var Power = class _Power {
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }
  value;
  unit;
  static fromJson(json) {
    return new _Power(json.value, json.unit);
  }
  toJSON() {
    return { value: this.value, unit: this.unit };
  }
};
var HeartRate = class _HeartRate {
  constructor(value, unit = "beatsPerMinute") {
    this.value = value;
    this.unit = unit;
  }
  value;
  unit;
  static fromJson(json) {
    return new _HeartRate(json.value, json.unit);
  }
  toJSON() {
    return { value: this.value, unit: this.unit };
  }
};
var Cadence = class _Cadence {
  constructor(value, unit = "countPerMinute") {
    this.value = value;
    this.unit = unit;
  }
  value;
  unit;
  static fromJson(json) {
    return new _Cadence(json.value, json.unit);
  }
  toJSON() {
    return { value: this.value, unit: this.unit };
  }
};
var Speed = class _Speed {
  constructor(distance, time) {
    this.distance = distance;
    this.time = time;
  }
  distance;
  time;
  static fromJson(json) {
    return new _Speed(Distance.fromJson(json.distance), Duration.fromJson(json.time));
  }
  toJSON() {
    return { distance: this.distance.toJSON(), time: this.time.toJSON() };
  }
};

// src/classes.ts
var Goal = class {
  static fromJson(json) {
    switch (json.type) {
      case "open":
        return new OpenGoal();
      case "time":
        return new TimeGoal(Duration.fromJson(json.time));
      case "distance":
        return new DistanceGoal(Distance.fromJson(json.distance));
      case "energy":
        return new EnergyGoal(Energy.fromJson(json.energy));
      case "poolSwimDistanceWithTime":
        return new PoolSwimDistanceWithTimeGoal(
          Distance.fromJson(json.poolSwimDistanceWithTime.distance),
          Duration.fromJson(json.poolSwimDistanceWithTime.time)
        );
    }
  }
};
var OpenGoal = class extends Goal {
  toJSON() {
    return { type: "open" };
  }
};
var TimeGoal = class extends Goal {
  constructor(time) {
    super();
    this.time = time;
  }
  time;
  toJSON() {
    return { type: "time", time: this.time.toJSON() };
  }
};
var DistanceGoal = class extends Goal {
  constructor(distance) {
    super();
    this.distance = distance;
  }
  distance;
  toJSON() {
    return { type: "distance", distance: this.distance.toJSON() };
  }
};
var EnergyGoal = class extends Goal {
  constructor(energy) {
    super();
    this.energy = energy;
  }
  energy;
  toJSON() {
    return { type: "energy", energy: this.energy.toJSON() };
  }
};
var PoolSwimDistanceWithTimeGoal = class extends Goal {
  constructor(distance, time) {
    super();
    this.distance = distance;
    this.time = time;
  }
  distance;
  time;
  toJSON() {
    return {
      type: "poolSwimDistanceWithTime",
      poolSwimDistanceWithTime: {
        distance: this.distance.toJSON(),
        time: this.time.toJSON()
      }
    };
  }
};
var Alert = class {
  static fromJson(json) {
    switch (json.type) {
      case "heartRateZone":
        return new HeartRateZoneAlert(json.zone);
      case "heartRateRange":
        return new HeartRateRangeAlert(HeartRate.fromJson(json.min), HeartRate.fromJson(json.max));
      case "powerZone":
        return new PowerZoneAlert(json.zone);
      case "powerRange":
        return new PowerRangeAlert(Power.fromJson(json.min), Power.fromJson(json.max), json.metric);
      case "powerThreshold":
        return new PowerThresholdAlert(Power.fromJson(json.threshold), json.metric);
      case "speedRange":
        return new SpeedRangeAlert(Speed.fromJson(json.min), Speed.fromJson(json.max), json.metric);
      case "speedThreshold":
        return new SpeedThresholdAlert(Speed.fromJson(json.threshold), json.metric);
      case "cadenceThreshold":
        return new CadenceThresholdAlert(Cadence.fromJson(json.threshold));
      case "cadenceRange":
        return new CadenceRangeAlert(Cadence.fromJson(json.min), Cadence.fromJson(json.max));
    }
  }
};
var HeartRateZoneAlert = class extends Alert {
  constructor(zone) {
    super();
    this.zone = zone;
  }
  zone;
  toJSON() {
    return { type: "heartRateZone", zone: this.zone };
  }
};
var HeartRateRangeAlert = class extends Alert {
  constructor(min, max) {
    super();
    this.min = min;
    this.max = max;
  }
  min;
  max;
  toJSON() {
    return {
      type: "heartRateRange",
      min: this.min.toJSON(),
      max: this.max.toJSON()
    };
  }
};
var PowerZoneAlert = class extends Alert {
  constructor(zone) {
    super();
    this.zone = zone;
  }
  zone;
  toJSON() {
    return { type: "powerZone", zone: this.zone };
  }
};
var PowerRangeAlert = class extends Alert {
  constructor(min, max, metric) {
    super();
    this.min = min;
    this.max = max;
    this.metric = metric;
  }
  min;
  max;
  metric;
  toJSON() {
    const out = {
      type: "powerRange",
      min: this.min.toJSON(),
      max: this.max.toJSON()
    };
    if (this.metric) out.metric = this.metric;
    return out;
  }
};
var PowerThresholdAlert = class extends Alert {
  constructor(threshold, metric) {
    super();
    this.threshold = threshold;
    this.metric = metric;
  }
  threshold;
  metric;
  toJSON() {
    const out = {
      type: "powerThreshold",
      threshold: this.threshold.toJSON()
    };
    if (this.metric) out.metric = this.metric;
    return out;
  }
};
var SpeedRangeAlert = class extends Alert {
  constructor(min, max, metric) {
    super();
    this.min = min;
    this.max = max;
    this.metric = metric;
  }
  min;
  max;
  metric;
  toJSON() {
    const out = {
      type: "speedRange",
      min: this.min.toJSON(),
      max: this.max.toJSON()
    };
    if (this.metric) out.metric = this.metric;
    return out;
  }
};
var SpeedThresholdAlert = class extends Alert {
  constructor(threshold, metric) {
    super();
    this.threshold = threshold;
    this.metric = metric;
  }
  threshold;
  metric;
  toJSON() {
    const out = {
      type: "speedThreshold",
      threshold: this.threshold.toJSON()
    };
    if (this.metric) out.metric = this.metric;
    return out;
  }
};
var CadenceThresholdAlert = class extends Alert {
  constructor(threshold) {
    super();
    this.threshold = threshold;
  }
  threshold;
  toJSON() {
    return { type: "cadenceThreshold", threshold: this.threshold.toJSON() };
  }
};
var CadenceRangeAlert = class extends Alert {
  constructor(min, max) {
    super();
    this.min = min;
    this.max = max;
  }
  min;
  max;
  toJSON() {
    return {
      type: "cadenceRange",
      min: this.min.toJSON(),
      max: this.max.toJSON()
    };
  }
};
var Step = class _Step {
  displayName;
  goal;
  alert;
  constructor(goal, displayName, alert) {
    this.goal = goal;
    this.displayName = displayName;
    this.alert = alert;
  }
  static fromJson(json) {
    return new _Step(
      Goal.fromJson(json.goal),
      json.displayName,
      json.alert ? Alert.fromJson(json.alert) : void 0
    );
  }
  toJSON() {
    const out = { goal: this.goal.toJSON() };
    if (this.displayName !== void 0) out.displayName = this.displayName;
    if (this.alert) out.alert = this.alert.toJSON();
    return out;
  }
};
var IntervalStep = class _IntervalStep {
  purpose;
  step;
  constructor(purpose, step) {
    this.purpose = purpose;
    this.step = step;
  }
  static fromJson(json) {
    return new _IntervalStep(json.purpose, Step.fromJson(json.step));
  }
  toJSON() {
    return { purpose: this.purpose, step: this.step.toJSON() };
  }
};
var IntervalBlock = class _IntervalBlock {
  iterations;
  steps = [];
  constructor(iterations) {
    this.iterations = iterations;
  }
  addStep(purpose, goal, displayName, alert) {
    const s = new IntervalStep(purpose, new Step(goal, displayName, alert));
    this.steps.push(s);
    return s;
  }
  static fromJson(json) {
    const b = new _IntervalBlock(json.iterations);
    b.steps = json.steps.map((s) => IntervalStep.fromJson(s));
    return b;
  }
  toJSON() {
    return {
      iterations: this.iterations,
      steps: this.steps.map((s) => s.toJSON())
    };
  }
};
var CustomWorkout = class _CustomWorkout {
  activity;
  location;
  displayName;
  warmup;
  blocks = [];
  cooldown;
  constructor(init) {
    this.activity = init.activity;
    this.location = init.location;
    this.displayName = init.displayName;
  }
  addBlock(iterations) {
    const b = new IntervalBlock(iterations);
    this.blocks.push(b);
    return b;
  }
  static fromJson(json) {
    const w = new _CustomWorkout({
      activity: json.activity,
      location: json.location,
      displayName: json.displayName
    });
    if (json.warmup) w.warmup = Step.fromJson(json.warmup);
    w.blocks = json.blocks.map((b) => IntervalBlock.fromJson(b));
    if (json.cooldown) w.cooldown = Step.fromJson(json.cooldown);
    return w;
  }
  toJSON() {
    const out = {
      activity: this.activity,
      location: this.location,
      blocks: this.blocks.map((b) => b.toJSON())
    };
    if (this.displayName !== void 0) out.displayName = this.displayName;
    if (this.warmup) out.warmup = this.warmup.toJSON();
    if (this.cooldown) out.cooldown = this.cooldown.toJSON();
    return out;
  }
};
var SingleGoalWorkout = class _SingleGoalWorkout {
  activity;
  location;
  swimmingLocation;
  goal;
  constructor(init) {
    this.activity = init.activity;
    this.location = init.location;
    this.swimmingLocation = init.swimmingLocation;
    this.goal = init.goal;
  }
  static fromJson(json) {
    return new _SingleGoalWorkout({
      activity: json.activity,
      location: json.location,
      swimmingLocation: json.swimmingLocation,
      goal: Goal.fromJson(json.goal)
    });
  }
  toJSON() {
    const out = {
      activity: this.activity,
      location: this.location,
      goal: this.goal.toJSON()
    };
    if (this.swimmingLocation !== void 0) {
      out.swimmingLocation = this.swimmingLocation;
    }
    return out;
  }
};
var PacerWorkout = class _PacerWorkout {
  activity;
  location;
  distance;
  time;
  constructor(init) {
    this.activity = init.activity;
    this.location = init.location;
    this.distance = init.distance;
    this.time = init.time;
  }
  static fromJson(json) {
    return new _PacerWorkout({
      activity: json.activity,
      location: json.location,
      distance: Distance.fromJson(json.distance),
      time: Duration.fromJson(json.time)
    });
  }
  toJSON() {
    return {
      activity: this.activity,
      location: this.location,
      distance: this.distance.toJSON(),
      time: this.time.toJSON()
    };
  }
};
var SbrActivity = class {
  static fromJson(json) {
    switch (json.kind) {
      case "swimming":
        return new SwimmingActivity({ swimmingLocation: json.swimmingLocation });
      case "cycling":
        return new CyclingActivity({ location: json.location });
      case "running":
        return new RunningActivity({ location: json.location });
    }
  }
};
var SwimmingActivity = class extends SbrActivity {
  swimmingLocation;
  constructor(init) {
    super();
    this.swimmingLocation = init?.swimmingLocation;
  }
  toJSON() {
    const out = { kind: "swimming" };
    if (this.swimmingLocation !== void 0) {
      out.swimmingLocation = this.swimmingLocation;
    }
    return out;
  }
};
var CyclingActivity = class extends SbrActivity {
  location;
  constructor(init) {
    super();
    this.location = init?.location;
  }
  toJSON() {
    const out = { kind: "cycling" };
    if (this.location !== void 0) out.location = this.location;
    return out;
  }
};
var RunningActivity = class extends SbrActivity {
  location;
  constructor(init) {
    super();
    this.location = init?.location;
  }
  toJSON() {
    const out = { kind: "running" };
    if (this.location !== void 0) out.location = this.location;
    return out;
  }
};
var SwimBikeRunWorkout = class _SwimBikeRunWorkout {
  displayName;
  activities = [];
  constructor(init) {
    this.displayName = init?.displayName;
    if (init?.activities) this.activities = init.activities;
  }
  add(activity) {
    this.activities.push(activity);
    return this;
  }
  static fromJson(json) {
    const w = new _SwimBikeRunWorkout({ displayName: json.displayName });
    w.activities = json.activities.map((a) => SbrActivity.fromJson(a));
    return w;
  }
  toJSON() {
    const out = {
      activities: this.activities.map((a) => a.toJSON())
    };
    if (this.displayName !== void 0) out.displayName = this.displayName;
    return out;
  }
};
var WorkoutPlan = class _WorkoutPlan {
  referenceId;
  custom;
  goal;
  pacer;
  swimBikeRun;
  constructor(init) {
    this.referenceId = init.referenceId;
  }
  clearWorkout() {
    this.custom = void 0;
    this.goal = void 0;
    this.pacer = void 0;
    this.swimBikeRun = void 0;
  }
  asCustom(init) {
    this.clearWorkout();
    this.custom = new CustomWorkout(init);
    return this.custom;
  }
  asGoal(init) {
    this.clearWorkout();
    this.goal = new SingleGoalWorkout(init);
    return this.goal;
  }
  asPacer(init) {
    this.clearWorkout();
    this.pacer = new PacerWorkout(init);
    return this.pacer;
  }
  asSwimBikeRun(init) {
    this.clearWorkout();
    this.swimBikeRun = new SwimBikeRunWorkout(init);
    return this.swimBikeRun;
  }
  static fromJson(json) {
    const p = new _WorkoutPlan({ referenceId: json.referenceId });
    if (json.custom) p.custom = CustomWorkout.fromJson(json.custom);
    if (json.goal) p.goal = SingleGoalWorkout.fromJson(json.goal);
    if (json.pacer) p.pacer = PacerWorkout.fromJson(json.pacer);
    if (json.swimBikeRun) p.swimBikeRun = SwimBikeRunWorkout.fromJson(json.swimBikeRun);
    return p;
  }
  toJSON() {
    const out = { referenceId: this.referenceId };
    if (this.custom) out.custom = this.custom.toJSON();
    if (this.goal) out.goal = this.goal.toJSON();
    if (this.pacer) out.pacer = this.pacer.toJSON();
    if (this.swimBikeRun) out.swimBikeRun = this.swimBikeRun.toJSON();
    return out;
  }
};

export { ActivityType, Alert, Cadence, CadenceRangeAlert, CadenceThresholdAlert, CustomWorkout, CyclingActivity, Distance, DistanceGoal, Duration, Energy, EnergyGoal, Goal, HeartRate, HeartRateRangeAlert, HeartRateZoneAlert, IntervalBlock, IntervalStep, OpenGoal, PacerWorkout, PoolSwimDistanceWithTimeGoal, Power, PowerRangeAlert, PowerThresholdAlert, PowerZoneAlert, RunningActivity, SbrActivity, SingleGoalWorkout, Speed, SpeedRangeAlert, SpeedThresholdAlert, Step, SwimBikeRunWorkout, SwimmingActivity, TimeGoal, WorkoutPlan };
