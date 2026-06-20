import type { ReactNode } from 'react';
import { Alert, Center, Loader } from '@mantine/core';
import { toApiError } from '../api/client';

interface QueryBoundaryProps {
  isLoading: boolean;
  error: unknown;
  children: ReactNode;
}

/** Standard loading spinner / error alert wrapper for query-backed views. */
export function QueryBoundary({
  isLoading,
  error,
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return (
      <Center mih={200}>
        <Loader />
      </Center>
    );
  }
  if (error) {
    return (
      <Alert color="red" title="Something went wrong">
        {toApiError(error).message}
      </Alert>
    );
  }
  return <>{children}</>;
}
