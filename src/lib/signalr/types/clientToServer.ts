type NonEmptyString = `${string & {}}${string}`;

export type Topic =
  | `engine_events:job_id:${NonEmptyString}`
  | `genone_events:session_id:${NonEmptyString}`
  | `configuration_events:file_id:${NonEmptyString}`
  | `engine_events:file_id:${NonEmptyString}`
  | "DummyEvent"
  | `node_results:job_id:${NonEmptyString}`
  | `evaluation_events:file_id:${NonEmptyString}`;
export interface ClientToServerEvents {
  SubscribeTopic: Topic;
  UnsubscribeTopic: Topic;
  SendMessage: any[];
}
