import solar from "./solar_developer.schema.json";
import ev from "./ev_manufacturer.schema.json";

export function listAvailableDomains() {
  return [
    { type: solar.type, label: solar.label, description: "Compare solar developers", schema: solar },
    { type: ev.type, label: ev.label, description: "Compare EV manufacturers", schema: ev }
  ];
}

export function getSchemaFor(type) {
  const list = listAvailableDomains();
  return list.find((d) => d.type === type)?.schema ?? null;
}
