import { Checkbox } from "./checkbox"
import figma from "@figma/code-connect"

figma.connect(
  Checkbox,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=1%3A117",
  {
    props: {
      disabled: figma.enum("Disabled", {
        True: true,
        False: false,
      }),
    },
    example: ({ disabled }) => (
      <Checkbox disabled={disabled} />
    ),
  },
)
