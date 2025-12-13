export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; [key: string]: any }>;
};

export function getGraphQLEndpoint(): string {
  return (import.meta as any).env?.VITE_GRAPHQL_ENDPOINT || 'http://localhost:5001/graphql';
}

export async function fetchGraphQL<T>(params: {
  query: string;
  variables?: Record<string, any>;
  signal?: AbortSignal;
}): Promise<GraphQLResponse<T>> {
  const res = await fetch(getGraphQLEndpoint(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: params.query, variables: params.variables }),
    signal: params.signal,
  });

  return (await res.json()) as GraphQLResponse<T>;
}


