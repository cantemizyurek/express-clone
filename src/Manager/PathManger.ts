import { Path, Paths } from '../types'

export default class PathManger {
  private paths: Paths = PathManger.initPaths()

  getPath(
    path: string,
    {
      cur = this.paths,
      onNotFound = PathManger.handleOnNotFoundThrow,
      onIteration = () => {},
      onFound = () => {},
    }: {
      cur?: Paths
      onNotFound?: (key: string, cur: Paths) => never | Paths
      onIteration?: (key: string, cur: Paths) => void
      onFound?: (key: string, cur: Paths) => void
    }
  ): Path {
    const [currentPath, ...rest] = path.split('/').filter(Boolean)

    if (currentPath === undefined) {
      onFound(currentPath, cur)
      return cur['/']
    }

    let nextPath = cur[currentPath]
    if (nextPath === undefined) {
      nextPath = onNotFound(currentPath, cur)
    }

    onIteration(currentPath, cur)
    return this.getPath(rest.join('/'), {
      cur: nextPath as Paths,
      onNotFound,
      onIteration,
      onFound,
    })
  }

  private static initPaths(): Paths {
    return {
      '/': PathManger.initPath(),
    }
  }

  private static initPath(): Path {
    return {
      use: [],
      get: [],
      post: [],
      put: [],
      delete: [],
    }
  }

  static handleOnNotFoundThrow(key: string, cur: Paths): never {
    throw new Error(`Path ${key} not found`)
  }

  static handleOnNotFoundCreate(key: string, cur: Paths): Paths {
    cur[key] = PathManger.initPaths()
    return cur[key] as Paths
  }
}
