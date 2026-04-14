const defaultInitialPythonCode = `def main(data) -> dict:
    """
    All input variables are available in the \`data\` dict.
    For example:
        my_value = data.get("input_example")
        return {
            "output_example": my_value
        }
    """
    return {}`;

export const defaultInitialCodes = {
  python: defaultInitialPythonCode,
  json: `{
    
}`,
  yaml: "",
};
