import axios from "axios";
import yaml from "js-yaml";

export async function readList(fname) {
  const extensions = ['.br', '.gz', '']

  for (const ext of extensions) {
    try {
      const url = `./data/${fname}${ext}`
      const res = await axios.get(url, {
        headers: ext === '' ? {} : {
          'Accept-Encoding': ext === '.br' ? 'br' : 'gzip'
        }
      })
      return await yaml.load(res.data)
    } catch (e) {
      if (ext === '') {
        throw e
      }
      continue
    }
  }
}
