import { useCallback, useRef, useState } from "react";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { apiClients } from "@/api/axios-clients";
import API_CONFIGS from "@/config/api.config";

const apiClientKey = "UPLOAD";
const CONFIG = API_CONFIGS[apiClientKey];

type UploadFileParams = {
  files: File[];
};

export function useUploadFile(options?: UseMutationOptions<string[], Error, UploadFileParams>) {
  const [progress, setProgress] = useState<number[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mutation = useMutation({
    ...options,
    mutationFn: async ({ files }: UploadFileParams) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      setProgress([]);

      const promises = files.map((file, index) => {
        const fileNameSplit = file.name.split(".");
        const fileName = fileNameSplit.slice(0, -1).join(".");
        const extension = fileNameSplit.pop() || "";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("FileName", fileName);
        formData.append("Extension", extension);

        return apiClients[apiClientKey].post<{ url: string; fileName: string }>(CONFIG.ENDPOINTS.UPLOAD, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            setProgress((prev) => {
              if (progressEvent.total) {
                const newProgresses = [...prev];
                newProgresses[index] = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                return newProgresses;
              }
              return prev;
            });
          },
          signal: abortControllerRef.current!.signal,
        });
      });

      try {
        const results = await Promise.all(promises);
        return results.map((result) => result.data.fileName);
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(`File upload failed: ${error.response?.statusText}`);
        }
        throw error;
      }
    },
  });

  const reset = useCallback(() => {
    setProgress([]);
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  return { ...mutation, reset, progress };
}
