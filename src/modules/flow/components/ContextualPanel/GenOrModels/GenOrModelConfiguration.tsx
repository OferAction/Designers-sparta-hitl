import { GenOrModelInputsSection } from "./GenOrModelInputsSection";
import { GenOrModelHeaderConfig } from "@/modules/flow/components/ContextualPanel/GenOrModels/GenOrModelHeaderConfig";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";

export function GenOrModelConfiguration() {
  return (
    <>
      <SectionContainer>
        <SectionTitle title="Model" />
        <GenOrModelHeaderConfig />
      </SectionContainer>
      <GenOrModelInputsSection />
    </>
  );
}
