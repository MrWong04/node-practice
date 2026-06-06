import service from '@/utils/service'
interface Api {
  '/example/test': {
    id: number
  }
  '/example/test2': {
    id: number
    message: string
  }
}

export function request<T extends keyof Api>(url: T, obj: Api[T]) {
  return service.post(url, obj)
}
