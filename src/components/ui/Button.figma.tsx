import { Button } from "./button"
import figma from "@figma/code-connect"

figma.connect(
  Button,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2718%3A8237",
  {
    props: {
      variant: figma.enum("Type", {
        Primary: "default",
        Outline: "outline",
        Secondary: "secondary",
        Ghost: "ghost",
        Link: "link",
      }),
      size: figma.enum("Size", {
        xs: "xs",
        sm: "sm",
        md: "default",
        lg: "lg",
      }),
      children: figma.string("Button Text"),
    },
    example: ({ variant, size, children }) => (
      <Button variant={variant} size={size}>
        {children}
      </Button>
    ),
  },
)
