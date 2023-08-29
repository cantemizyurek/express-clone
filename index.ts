import { IncomingMessage, ServerResponse } from 'http'

interface RequestExpress<
  Body = any,
  Params = {
    [key: string]: any
  },
  Query = {
    [key: string]: any
  }
> {
  body: Body
  params: Params
  query: Query
  ip: string
  method: string
  url: string
}

interface ResponseExpress {
  send: (body: any) => void
  json: (body: any) => void
  status: (code: number) => void
}

type requestHandler = (
  req: RequestExpress,
  res: ResponseExpress,
  next: () => void
) => void

enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

interface Path {
  use: requestHandler[]
  get: requestHandler[]
  post: requestHandler[]
  put: requestHandler[]
  delete: requestHandler[]
}

interface Paths {
  [key: string]: Paths | Path
  '/': Path
}

class Express {
  private paths: Paths = Express.initPaths()

  constructor() {
    this.use('*', (req, res, next) => {
      res.status(404)
      res.send('Not found')
    })
  }

  private getPath(
    path: string,
    {
      cur = this.paths,
      onNotFound = () => {
        throw new Error('Path not found')
      },
      onIteration = () => {},
      onFound = () => {},
    }: {
      cur?: Paths
      onNotFound?: (key: string, cur: Paths) => never | Paths
      onFound?: (key: string, cur: Paths) => void
      onIteration?: (key: string, cur: Paths) => void
    }
  ): Path {
    const [key, ...rest] = path.split('/').filter(Boolean)

    if (key === undefined) {
      onFound(key, cur)
      return cur['/']
    }

    let next = cur[key]
    if (cur[key] === undefined) {
      next = onNotFound(key, cur)
    }

    onIteration(key, cur)
    return this.getPath(rest.join('/'), {
      cur: next as Paths,
      onNotFound,
      onFound,
      onIteration,
    })
  }

  private getExpressValues(
    path: string,
    {
      method = Method.GET,
    }: {
      method?: Method
    }
  ) {
    let middlewares: requestHandler[] = []
    const params: { [key: string]: string } = {}

    this.getPath(path, {
      onNotFound: (key, cur) => {
        let [find, name] = Express.handleOnNotFoundFindParam(key, cur)
        params[name.slice(1)] = key
        return find
      },
      onIteration: (key, cur) => {
        middlewares = Express.handleOnIterationGetMiddlewares(key, cur, {
          method,
        })
      },
      onFound: (key, cur) => {
        if (cur['/']) {
          middlewares.push(...cur['/']['use'])
        }

        if (cur['/'] && cur['/'][method]) {
          middlewares.push(...cur['/'][method])
        }
      },
    })

    return {
      middlewares,
      params,
    }
  }

  private addMiddleware(
    path: string,
    {
      method = Method.GET,
      handler,
    }: {
      method?: Method | 'use'
      handler: requestHandler
    }
  ) {
    this.getPath(path, {
      onNotFound: Express.handleOnNotFoundCreate,
      onFound: (key, cur) => {
        if (cur['/']) {
          cur['/'][method].push(handler)
        }
      },
    })
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    let middlewares: requestHandler[] = []
    let params: { [key: string]: string } = {}

    const { middlewares: _middlewares, params: _params } =
      this.getExpressValues(req.url || '', {
        method: req.method?.toLowerCase() as Method,
      })

    middlewares = _middlewares
    params = _params

    const expressRequest = Express.createExpressRequest(req, {
      params,
      body: await Express.getBody(req),
      query: {},
    })
    const expressResponse = Express.createExpressResponse(res)

    const next = () => {
      const middleware = middlewares.shift()
      if (middleware) {
        middleware(expressRequest, expressResponse, next)
      }
    }

    next()
  }

  public use(path: string, handler: requestHandler) {
    this.addMiddleware(path, {
      method: 'use',
      handler,
    })
    return this
  }

  public get(path: string, handler: requestHandler) {
    this.addMiddleware(path, {
      method: Method.GET,
      handler,
    })
    return this
  }

  public post(path: string, handler: requestHandler) {
    this.addMiddleware(path, {
      method: Method.POST,
      handler,
    })
    return this
  }

  public put(path: string, handler: requestHandler) {
    this.addMiddleware(path, {
      method: Method.PUT,
      handler,
    })
    return this
  }

  public delete(path: string, handler: requestHandler) {
    this.addMiddleware(path, {
      method: Method.DELETE,
      handler,
    })
    return this
  }

  public listen(port: number, callback?: () => void) {
    require('http')
      .createServer((req: IncomingMessage, res: ServerResponse) => {
        this.handleRequest(req, res)
      })
      .listen(port, callback)

    return this
  }

  private static createExpressResponse(res: ServerResponse): ResponseExpress {
    return {
      send: body => {
        res.end(body)
      },
      json: body => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      },
      status: code => {
        res.statusCode = code
      },
    }
  }

  private static createExpressRequest(
    req: IncomingMessage,
    {
      params = {},
      body = '',
      query = {},
    }: {
      params: { [key: string]: string }
      body: string
      query: { [key: string]: string }
    }
  ): RequestExpress {
    return {
      body,
      params,
      query,
      ip: req.socket.remoteAddress || '',
      method: req.method?.toLowerCase() || 'get',
      url: req.url || '',
    }
  }

  private static getBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })
      req.on('end', () => {
        resolve(body)
      })
      req.on('error', err => {
        reject(err)
      })
    })
  }

  private static handleOnNotFoundThrow(key: string, cur: Paths): never {
    throw {
      message: 'Path not found',
      error: 404,
    }
  }

  private static handleOnNotFoundCreate(key: string, cur: Paths): Paths {
    cur[key] = {
      '/': Express.initPath(),
    }

    return cur[key] as Paths
  }

  private static handleOnNotFoundFindParam(
    key: string,
    cur: Paths
  ): [Paths, string] | never {
    let find: string | null = null
    for (const key in cur) {
      if (key[0] === ':') {
        find = key
        break
      }
    }

    if (find === null) return Express.handleOnNotFoundThrow(key, cur)
    return [cur[find] as Paths, find]
  }

  private static handleOnIterationGetMiddlewares(
    key: string,
    cur: Paths,
    { method = Method.GET }
  ) {
    let middlewares: requestHandler[] = []
    if (cur['*'] && cur['*']['/']) {
      middlewares.push(...cur['*']['/']['use'])
      middlewares.push(...cur['*']['/'][method])
    }
    return middlewares
  }

  private static initPath() {
    return {
      use: [],
      get: [],
      post: [],
      put: [],
      delete: [],
    }
  }

  private static initPaths() {
    return {
      '/': Express.initPath(),
    }
  }
}

const app = new Express()

app.use('*', (req, res, next) => {
  console.log('middleware')
  next()
})

app.get('/', (req, res, next) => {
  res.send('Hello world')
})

app.get('/user/:id', (req, res, next) => {
  res.json({
    id: req.params.id,
  })
})

app.listen(3000, () => {
  console.log('Server started')
})
