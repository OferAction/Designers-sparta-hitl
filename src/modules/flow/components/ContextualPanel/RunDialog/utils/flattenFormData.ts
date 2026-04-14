export const flattenFormData = (data: Record<string, string>): Record<string, any> => {
  const flattened: Record<string, any> = {};

  Object.entries(data).forEach(([nodeKey, nodeInputs]) => {
    if (typeof nodeInputs === "object" && nodeInputs !== null && !Array.isArray(nodeInputs)) {
      Object.entries(nodeInputs).forEach(([inputKey, inputValue]) => {
        flattened[`${nodeKey}.${inputKey}`] = inputValue;
      });
    } else {
      flattened[nodeKey] = nodeInputs;
    }
  });

  return flattened;
};
