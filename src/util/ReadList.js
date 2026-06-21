import axios from "axios";
import * as yaml from "js-yaml";

// js-yaml v5 no longer auto-parses YAML dates into Date objects,
// so we need to recursively convert date strings back to Date.
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function convertDates(obj) {
  if (obj == null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertDates);
  const result = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string" && datePattern.test(val)) {
      result[key] = new Date(val);
    } else if (typeof val === "object" && val !== null) {
      result[key] = convertDates(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export async function readList(fname) {
  const res = await axios.get(`./data/${fname}`);
  const data = yaml.load(res.data);
  return convertDates(data);
}
