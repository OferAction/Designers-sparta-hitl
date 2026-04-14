import { Badge } from "./badge"
import figma from "@figma/code-connect"

figma.connect(
  Badge,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=136%3A1178",
  {
    props: {
      variant: figma.enum("Type", {
        Default: "default",
        Secondary: "secondary",
        Destructive: "destructive",
        Outline: "outline",
      }),
      children: figma.string("Label"),
    },
    example: ({ variant, children }) => (
      <Badge variant={variant}>{children}</Badge>
    ),
  },
)
