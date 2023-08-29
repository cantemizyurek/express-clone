import ResponseExpress from './Server/Response'
import RequestExpress from './Server/Request'

export type requestHandler = (
  req: RequestExpress,
  res: ResponseExpress,
  next: () => void
) => void

export interface Path {
  use: requestHandler[]
  get: requestHandler[]
  post: requestHandler[]
  put: requestHandler[]
  delete: requestHandler[]
}

export interface Paths {
  [key: string]: Paths | Path
  '/': Path
}

export enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  USE = 'use',
}
