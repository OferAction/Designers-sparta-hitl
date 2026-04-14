import { Alert, AlertTitle, AlertDescription } from "./alert"
import figma from "@figma/code-connect"

figma.connect(
  Alert,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=152%3A2375",
  {
    props: {
      variant: figma.enum("Type", {
        Default: "default",
        Destructive: "destructive",
      }),
    },
    example: ({ variant }) => (
      <Alert variant={variant}>
        <AlertTitle>Alert title</AlertTitle>
        <AlertDescription>Alert description</AlertDescription>
      </Alert>
    ),
  },
)
