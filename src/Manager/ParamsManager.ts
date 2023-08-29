import PathManger from './PathManger'
import { Paths } from '../types'

export default class ParamsManager {
  private paths: PathManger

  constructor(pathManager: PathManger) {
    this.paths = pathManager
  }

  handleOnNotFoundFindParam(key: string, cur: Paths): [Paths, string] | never {
    let find: string | null = null
    for (const key in cur) {
      if (key[0] === ':') {
        find = key
        break
      }
    }

    if (find === null) return PathManger.handleOnNotFoundThrow(key, cur)
    return [cur[find] as Paths, find]
  }
}
