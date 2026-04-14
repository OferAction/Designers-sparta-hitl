import { CodeSection } from "./CodeSection";
import { InputsSection } from "./InputsSection";

export const CodeAgentConfiguration = () => {
  return (
    <>
      <InputsSection />
      <CodeSection />
    </>
  );
};

export default CodeAgentConfiguration;

export { default as CodeAgentOutputs } from "./OutputsSection";
