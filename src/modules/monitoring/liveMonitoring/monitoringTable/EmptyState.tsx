interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className="flex items-center justify-center h-full w-full p-8 text-center text-muted-foreground">{message}</div>;
}
