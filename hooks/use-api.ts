import { useEffect, useState, useCallback } from "react";

export const hitApi = async (apiPath: string, init?: RequestInit) => {
  const f = async () =>
    await fetch(`http://localhost:3001/api${apiPath}`, {
      ...init,
      headers: {
        ...init?.headers,
      },
      credentials: "include",
    });
  const resp = await f();

  return resp;
};

interface UseApiOptions {
  skip?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  initialLoading?: boolean;
}

interface ExecuteOptions extends UseApiOptions {
  endpoint?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  execute: (options?: Partial<ExecuteOptions>) => Promise<T | null>;
}

export function useApi<T>(
  endpoint: string,
  options?: UseApiOptions,
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(options?.initialLoading ?? true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (overrideOptions?: Partial<ExecuteOptions>) => {
      const mergedOptions = { ...options, ...overrideOptions };
      const targetEndpoint = overrideOptions?.endpoint || endpoint;

      // Only skip if skip is true AND no override options provided (initial mount)
      if (mergedOptions.skip && !overrideOptions) {
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const requestOptions: RequestInit = {
          method: mergedOptions.method || "GET",
          credentials: mergedOptions.credentials || "include",
          headers: mergedOptions.headers || {},
        };

        if (mergedOptions.body) {
          if (mergedOptions.body instanceof FormData) {
            requestOptions.body = mergedOptions.body;
          } else if (typeof mergedOptions.body === "string") {
            requestOptions.body = mergedOptions.body;
          } else {
            requestOptions.body = JSON.stringify(mergedOptions.body);
            requestOptions.headers = {
              "Content-Type": "application/json",
              ...requestOptions.headers,
            };
          }
        }

        const response = await hitApi(targetEndpoint, requestOptions);
        console.log("response", response);

        if (response.ok) {
          const result = await response.json();
          const responseData = result.data || null;
          setData(responseData);
          return responseData;
        } else {
          const errorMessage = `Failed to ${
            mergedOptions.method || "GET"
          } data`;
          setError(errorMessage);
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error processing request";
        setError(errorMessage);
        console.error(`Error with ${targetEndpoint}:`, err);
        return null;
      } finally {
        console.log("here");
        setIsLoading(false);
      }
    },
    [endpoint, options],
  );

  useEffect(() => {
    console.log("check skip", options?.skip);
    if (!options?.skip) {
      fetchData();
    }
  }, [fetchData, options?.skip]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    execute: fetchData,
  };
}
