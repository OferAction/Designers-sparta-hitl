import { Switch } from "./switch"
import figma from "@figma/code-connect"

figma.connect(
  Switch,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2769%3A29914",
  {
    props: {
      disabled: figma.enum("Disabled", {
        True: true,
        False: false,
      }),
      checked: figma.enum("Left / Right", {
        True: false,
        False: true,
      }),
    },
    example: ({ disabled, checked }) => (
      <Switch disabled={disabled} checked={checked} />
    ),
  },
)
