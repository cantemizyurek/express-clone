import { IncomingMessage } from 'node:http'

export default class ExpressRequest {
  private req: IncomingMessage
  params: { [key: string]: string }
  body: string

  constructor(
    req: IncomingMessage,
    {
      params = {},
      body = '',
    }: {
      params?: { [key: string]: string }
      body?: string
    } = {
      params: {},
      body: '',
    }
  ) {
    this.req = req
    this.params = params
    this.body = body
  }

  get ip() {
    return this.req.socket.remoteAddress || ''
  }

  get method() {
    return this.req.method?.toLowerCase() || 'get'
  }

  get url() {
    return this.req.url || ''
  }

  static getBody(req: IncomingMessage) {
    return new Promise<string>(resolve => {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })

      req.on('end', () => {
        resolve(body)
      })
    })
  }
}
