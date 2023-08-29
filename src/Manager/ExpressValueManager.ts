import MiddlewareManger from './MiddleWareManager'
import ParamsManager from './ParamsManager'
import PathManger from './PathManger'
import { Methods, requestHandler } from '../types'

export default class ExpressValueManager {
  private paths = new PathManger()
  private middlewares = new MiddlewareManger(this.paths)
  private params = new ParamsManager(this.paths)

  addMiddleware(path: string, method: Methods, handler: requestHandler) {
    this.middlewares.addMiddleware(path, method, handler)
  }

  getExpressValues(
    path: string,
    {
      method = Methods.GET,
    }: {
      method?: Methods
    }
  ) {
    let middlewares: requestHandler[] = []
    let params: { [key: string]: string } = {}

    this.paths.getPath(path, {
      onNotFound: (key, cur) => {
        let [find, name] = this.params.handleOnNotFoundFindParam(key, cur)
        params[name.slice(1)] = key
        return find
      },
      onIteration: (key, cur) => {
        middlewares.push(
          ...this.middlewares.handleOnIterationGetMiddlewares(key, cur, {
            method,
          })
        )
      },
      onFound: (key, cur) => {
        middlewares.push(
          ...this.middlewares.handleOnFoundGetMiddlewares(key, cur, { method })
        )
      },
    })

    return {
      middlewares,
      params,
    }
  }
}
