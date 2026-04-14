import { useMutation } from "@tanstack/react-query";

import { createTask, deleteTask, updateTask } from "./taskQueries";

export function useCreateTask() {
  return useMutation(createTask());
}

export function useUpdateTask() {
  return useMutation(updateTask());
}

export function useDeleteTask() {
  return useMutation(deleteTask());
}
