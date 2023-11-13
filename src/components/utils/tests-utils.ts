import { QueryClient } from "@tanstack/react-query";

export const createTestQueryClient = () => {
  const queryClient = new QueryClient();
  return queryClient;
};
