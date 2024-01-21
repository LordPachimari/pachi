
type Pagination = {
  page: number;
  per_page: number;
};

function paginate<T>(data: T[], pagination: Pagination): T[] {
  const { page, per_page } = pagination;
  const offset = page > 0 ? (page - 1) * per_page : 0;
  const paginated = data.slice(offset, offset + per_page);
  return paginated;
}
