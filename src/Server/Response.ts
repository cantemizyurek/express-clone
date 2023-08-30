import { ServerResponse } from 'node:http'

export default class ExpressResponse {
  private res: ServerResponse
  constructor(res: ServerResponse) {
    this.res = res
  }

  send(body: any) {
    this.res.setHeader('Content-Type', 'text/html')
    this.res.end(body)
  }

  json(body: any) {
    this.res.setHeader('Content-Type', 'application/json')
    this.res.end(JSON.stringify(body))
  }

  status(code: number) {
    this.res.statusCode = code
    return this
  }

  get writableEnded() {
    return this.res.writableEnded
  }

  setHeader(key: string, value: string) {
    this.res.setHeader(key, value)
    return this
  }

  on(event: string, handler: () => void) {
    this.res.on(event, handler)
    return this
  }
}
