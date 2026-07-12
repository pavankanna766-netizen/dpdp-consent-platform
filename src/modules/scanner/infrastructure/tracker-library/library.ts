import type {
  TrackerDefinition,
} from "../../domain/tracker";

import {
  analyticsTrackers,
  marketingTrackers,
  monitoringTrackers,
  tagManagerTrackers,
  sessionRecordingTrackers,
  supportTrackers,
  paymentTrackers,
} from "./categories";

export const trackerLibrary: TrackerDefinition[] =
  [
    ...analyticsTrackers,

    ...marketingTrackers,

    ...tagManagerTrackers,

    ...monitoringTrackers,

    ...sessionRecordingTrackers,

    ...supportTrackers,

    ...paymentTrackers,
  ];