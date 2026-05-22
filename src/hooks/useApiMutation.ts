"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

type UseApiMutationOptions<TData, TVariables, TContext> = UseMutationOptions<
  TData,
  Error,
  TVariables,
  TContext
> & {
  invalidateKeys?: QueryKey[];
};

export function useApiMutation<
  TData,
  TVariables = void,
  TContext = unknown,
>({
  invalidateKeys,
  onSuccess,
  ...options
}: UseApiMutationOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await onSuccess?.(data, variables, onMutateResult, context);
      if (invalidateKeys?.length) {
        await Promise.all(
          invalidateKeys.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }
    },
  });
}
