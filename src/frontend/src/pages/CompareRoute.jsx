import React from "react";
import { useLocation } from "react-router-dom";
import DomainChooser from "../components/DomainChooser";
import { getSchemaFor } from "../config/entities";
import MapPage from "../components/MapPage";

export default function CompareRoute() {
  const params = new URLSearchParams(useLocation().search);
  const type = params.get("type");
  const schema = getSchemaFor(type);

  if (!schema) return <DomainChooser />;

  return <MapPage schema={schema} />;
}
