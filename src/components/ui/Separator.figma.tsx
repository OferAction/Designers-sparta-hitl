import { Separator } from "./separator"
import figma from "@figma/code-connect"

figma.connect(
  Separator,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2753%3A10017",
  {
    props: {
      orientation: figma.enum("Vert. / Horz.", {
        True: "vertical",
        False: "horizontal",
      }),
    },
    example: ({ orientation }) => (
      <Separator orientation={orientation} />
    ),
  },
)
