import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog"
import figma from "@figma/code-connect"

figma.connect(
  Dialog,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=154%3A1731",
  {
    props: {},
    example: () => (
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    ),
  },
)
