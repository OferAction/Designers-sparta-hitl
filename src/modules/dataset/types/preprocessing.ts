export const DataType = {
  String: 1,
  Number: 2,
  List: 3,
} as const;

export type ParameterType = "None" | "List" | "Regex" | "Number";

export interface PreprocessingFunction {
  id: string;
  name: string;
  parameterType: ParameterType;
  dataType: keyof typeof DataType;
}

export interface PreprocessingFunctionWithParams {
  functionId: string;
  functionName: string;
  parameterType: ParameterType;
  parameters?: string;
}

export type PreprocessingFunctionsResponse = PreprocessingFunction[];
