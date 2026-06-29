import { ValidationError } from './errors'

export interface PaginationParams {
  page: number
  pageSize: number
  skip: number
  take: number
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = parseInt(String(query.page ?? DEFAULT_PAGE), 10)
  const pageSize = parseInt(String(query.pageSize ?? DEFAULT_PAGE_SIZE), 10)

  if (Number.isNaN(page) || page < 1) {
    throw new ValidationError('page 必须为正整数')
  }
  if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new ValidationError(`pageSize 必须为 1-${MAX_PAGE_SIZE} 之间的整数`)
  }

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

export function parseOptionalInt(value: unknown, fieldName = '参数'): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const n = parseInt(String(value), 10)
  if (Number.isNaN(n)) {
    throw new ValidationError(`${fieldName} 必须为整数`)
  }
  return n
}

export function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const str = String(value).trim()
  return str || undefined
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  pagination: Pick<PaginationParams, 'page' | 'pageSize'>
): PaginatedResult<T> {
  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pagination.pageSize),
    },
  }
}
