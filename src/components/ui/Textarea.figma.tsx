import { Textarea } from "./textarea"
import figma from "@figma/code-connect"

figma.connect(
  Textarea,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2807%3A10440",
  {
    props: {
      placeholder: figma.string("↳ Content"),
      state: figma.enum("State", {
        Default: "default",
        Error: "error",
        Disabled: "disabled",
      }),
      errorMessage: figma.string("↳ Destructive text"),
    },
    example: ({ placeholder, state, errorMessage }) => (
      <Textarea
        placeholder={placeholder}
        state={state}
        errorMessage={errorMessage}
      />
    ),
  },
)
