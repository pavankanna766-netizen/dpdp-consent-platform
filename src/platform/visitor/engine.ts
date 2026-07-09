import {
  loadVisitorId,
  saveVisitorId,
} from "./storage";

export class VisitorEngine {
  getVisitorId() {
    let id = loadVisitorId();

    if (!id) {
      id =
        "ps_v_" +
        crypto.randomUUID();

      saveVisitorId(id);
    }

    return id;
  }
}

export const visitorEngine =
  new VisitorEngine();