import axios from "axios";
import yaml from "js-yaml";

export async function readList(fname) {
  const res = await axios.get(`./data/${fname}`);
  return await yaml.load(res.data);
}
