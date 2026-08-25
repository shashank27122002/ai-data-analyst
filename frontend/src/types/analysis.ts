export interface AnalysisDetails {
  operation: string;
  column: string;
  group_by: string | null;
  filters: Record<string, string>;
  result: unknown;
}