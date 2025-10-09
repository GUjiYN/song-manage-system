export type PaginationParams = {
  page?: string | number;
  pageSize?: string | number;
};

export type PaginationResult = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function parsePagination({ page, pageSize }: PaginationParams): PaginationResult {
  const parsedPage = Math.max(Number(page ?? DEFAULT_PAGE), 1);
  const parsedSize = Math.min(Math.max(Number(pageSize ?? DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE);

  return {
    page: parsedPage,
    pageSize: parsedSize,
    skip: (parsedPage - 1) * parsedSize,
    take: parsedSize,
  };
}
