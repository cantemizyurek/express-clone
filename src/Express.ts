import { IncomingMessage, ServerResponse } from 'node:http'
import ExpressValueManager from './Manager/ExpressValueManager'
import Server from './Server/Server'
import Request from './Server/Request'
import Response from './Server/Response'
import { Methods, requestHandler } from './types'

export default class Express {
  private valueManager = new ExpressValueManager()
  private server = new Server()

  private onNotFound: (req: IncomingMessage, res: ServerResponse) => void

  constructor(
    {
      onNotFound = (req, res) => {
        res.statusCode = 404
        res.end()
      },
    }: {
      onNotFound?: (req: IncomingMessage, res: ServerResponse) => void
    } = {
      onNotFound: (req, res) => {
        res.statusCode = 404
        res.end()
      },
    }
  ) {
    this.onNotFound = onNotFound
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    let middlewares: requestHandler[] = []
    let params: { [key: string]: string } = {}

    try {
      const { middlewares: _middlewares, params: _params } =
        this.valueManager.getExpressValues(req.url || '', {
          method: req.method?.toLowerCase() as Methods,
        })

      middlewares = _middlewares
      params = _params
    } catch {
      this.onNotFound(req, res)
      return
    }

    const request = new Request(req, {
      params,
      body: await Request.getBody(req),
    })

    const response = new Response(res)

    function next() {
      const middleware = middlewares.shift()
      if (middleware) {
        middleware(request, response, next)
      }
    }

    next()
  }

  public use(path: string, handler: requestHandler) {
    this.valueManager.addMiddleware(path, Methods.USE, handler)
    return this
  }

  public get(path: string, handler: requestHandler) {
    this.valueManager.addMiddleware(path, Methods.GET, handler)
    return this
  }

  public post(path: string, handler: requestHandler) {
    this.valueManager.addMiddleware(path, Methods.POST, handler)
    return this
  }

  public put(path: string, handler: requestHandler) {
    this.valueManager.addMiddleware(path, Methods.PUT, handler)
    return this
  }

  public delete(path: string, handler: requestHandler) {
    this.valueManager.addMiddleware(path, Methods.DELETE, handler)
    return this
  }

  public listen(port: number, callback?: () => void) {
    this.server.listen(port, this.handleRequest.bind(this), callback)
    return this
  }

  public close() {
    this.server.close()
    return this
  }
}
