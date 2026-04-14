import { Toggle } from "./toggle"
import figma from "@figma/code-connect"

figma.connect(
  Toggle,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2768%3A28168",
  {
    props: {
      variant: figma.enum("Outlined", {
        True: "outline",
        False: "default",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "default",
        lg: "lg",
      }),
      children: figma.string("↳ Label"),
      pressed: figma.enum("Pressed", {
        True: true,
        False: false,
      }),
    },
    example: ({ variant, size, children, pressed }) => (
      <Toggle variant={variant} size={size} pressed={pressed}>
        {children}
      </Toggle>
    ),
  },
)
