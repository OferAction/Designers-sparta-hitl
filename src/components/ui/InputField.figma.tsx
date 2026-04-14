import { Input } from "./input"
import figma from "@figma/code-connect"

figma.connect(
  Input,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2732%3A15509",
  {
    props: {
      placeholder: figma.string("↳ Content"),
      disabled: figma.enum("State", {
        Disabled: true,
        Default: false,
        Focus: false,
        Error: false,
      }),
    },
    example: ({ placeholder, disabled }) => (
      <Input placeholder={placeholder} disabled={disabled} />
    ),
  },
)
