import {
  IncomingMessage,
  ServerResponse,
  createServer,
  Server as HttpServer,
} from 'node:http'

export default class Server {
  private server: null | HttpServer = null

  listen(
    port: number,
    handler: (req: IncomingMessage, res: ServerResponse) => void,
    onListening?: () => void
  ) {
    this.server = createServer(handler).listen(port, onListening)
  }

  close() {
    if (this.server === null) return
    this.server.close()
  }

  get isListening() {
    if (this.server === null) return false
    return this.server.listening
  }
}
