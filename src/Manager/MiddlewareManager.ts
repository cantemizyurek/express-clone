import PathManger from './PathManager'
import { Methods, Paths, requestHandler } from '../types'

export default class MiddlewareManger {
  private paths: PathManger

  constructor(pathManager: PathManger) {
    this.paths = pathManager
  }

  addMiddleware(path: string, method: Methods, handler: requestHandler) {
    this.paths.getPath(path, {
      onNotFound: PathManger.handleOnNotFoundCreate,
      onFound: (key, cur) => {
        if (cur['/']) {
          cur['/'][method].push(handler)
        }
      },
    })
  }

  handleOnFoundGetMiddlewares(
    key: string,
    cur: Paths,
    { method }: { method: Methods }
  ): requestHandler[] {
    let middlewares: requestHandler[] = []

    if (cur['*'] && cur['*']['/']) {
      middlewares.push(...cur['*']['/']['use'])
      middlewares.push(...cur['*']['/'][method])
    }

    if (cur['/']) {
      middlewares.push(...cur['/']['use'])
    }

    if (cur['/'] && cur['/'][method]) {
      middlewares.push(...cur['/'][method])
    }

    return middlewares
  }

  handleOnIterationGetMiddlewares(
    key: string,
    cur: Paths,
    { method }: { method: Methods }
  ): requestHandler[] {
    let middlewares: requestHandler[] = []
    if (cur['*'] && cur['*']['/']) {
      middlewares.push(...cur['*']['/']['use'])
      middlewares.push(...cur['*']['/'][method])
    }
    return middlewares
  }
}
