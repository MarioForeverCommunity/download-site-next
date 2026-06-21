import axios from "axios";
import { load, YAML11_SCHEMA } from "js-yaml";

// js-yaml v5 defaults to CORE_SCHEMA (YAML 1.2) which no longer parses
// !!timestamp dates into Date objects. Use YAML11_SCHEMA to restore this.
export async function readList(fname) {
  const res = await axios.get(`./data/${fname}`);
  return load(res.data, { schema: YAML11_SCHEMA });
}
