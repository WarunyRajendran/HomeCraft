export const queryKeys = {
  furniture: {
    all: ['furniture'] as const,
    list: () => [...queryKeys.furniture.all, 'list'] as const,
    byCategory: (id: string) => [...queryKeys.furniture.all, 'category', id] as const,
    search: (query: string) => [...queryKeys.furniture.all, 'search', query] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },
  partners: {
    all: ['partners'] as const,
    list: () => [...queryKeys.partners.all, 'list'] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (userId: string) => [...queryKeys.projects.all, 'list', userId] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
  },
};
