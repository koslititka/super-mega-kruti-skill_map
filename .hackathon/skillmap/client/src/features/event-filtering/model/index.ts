export interface FilterState {
  search: string;
  categories: number[];
  format: string;
  ageGroups: number[];
  eventType: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  sort: string;
}

export const initialFilters: FilterState = {
  search: '',
  categories: [],
  format: '',
  ageGroups: [],
  eventType: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  sort: 'date_asc',
};

export const filtersToParams = (filters: FilterState): Record<string, string> => {
  const params: Record<string, string> = {};

  if (filters.search) params.search = filters.search;
  if (filters.categories.length) params.categories = filters.categories.join(',');
  if (filters.format) params.format = filters.format;
  if (filters.ageGroups.length) params.ageGroups = filters.ageGroups.join(',');
  if (filters.eventType) params.eventType = filters.eventType;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  params.page = String(filters.page);
  params.sort = filters.sort;

  return params;
};
