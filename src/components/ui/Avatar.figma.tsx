import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import figma from "@figma/code-connect"

figma.connect(
  Avatar,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=8%3A297",
  {
    props: {
      fallbackText: figma.string("Text"),
    },
    example: ({ fallbackText }) => (
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt={fallbackText} />
        <AvatarFallback>{fallbackText}</AvatarFallback>
      </Avatar>
    ),
  },
)
