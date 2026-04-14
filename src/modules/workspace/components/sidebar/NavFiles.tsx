// Commented out code to avoid errors as NavFiles component is not being used
// import { useState } from "react";

// import { FolderOpen, Plus } from "@phosphor-icons/react";
// import { ChevronRight } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useShallow } from "zustand/shallow";

// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// import {
//   SidebarGroup,
//   SidebarGroupAction,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuAction,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
// } from "@/components/ui/sidebar";
// import { useFileActions } from "@/modules/workspace/hooks";
// import { useWorkspaceStore, WorkspaceStore } from "@/modules/workspace/store";
// import { type FileItem, Folder } from "@/modules/workspace/types";

// const FileItem = ({ file, isSubmenu }: { file: FileItem; isActive?: boolean; isSubmenu?: boolean }) => {
//   const MenuItem = isSubmenu ? SidebarMenuItem : SidebarMenuSubItem;
//   const MenuButton = isSubmenu ? SidebarMenuButton : SidebarMenuSubButton;
//   return (
//     <MenuItem className="hover:bg-sidebar-accent rounded-lg">
//       <MenuButton asChild>
//         <a href="#">
//           <span>{file.name}</span>
//         </a>
//       </MenuButton>
//     </MenuItem>
//   );
// };

// const FolderItem = ({ folder, onClick }: { folder: Folder; onClick: () => void }) => {
//   const { folderId } = useParams();
//   const isActive = folderId === folder.id;
//   const [open, setOpen] = useState(false);

//   const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation();
//     if (isActive || !open) {
//       setOpen((open) => !open);
//     }
//     onClick();
//   };

//   return (
//     <Collapsible open={open} onOpenChange={setOpen} asChild>
//       <SidebarMenuItem className="hover:bg-muted hover:bg-opacity-40 hover:outline hover:outline-1 hover:outline-sidebar-accent" isActive={isActive}>
//         <CollapsibleTrigger asChild className="group">
//           <div>
//             <SidebarMenuButton onClick={onButtonClick} tooltip={folder.name}>
//               <FolderOpen weight="fill" />
//               <span>{folder.name}</span>
//             </SidebarMenuButton>
//             {!!folder.files?.length && (
//               <SidebarMenuAction>
//                 <ChevronRight className="transition-transform duration-200 group-data-[state=open]:rotate-90" />
//                 <span className="sr-only">Toggle</span>
//               </SidebarMenuAction>
//             )}
//           </div>
//         </CollapsibleTrigger>
//         {folder.files?.length ? (
//           <CollapsibleContent className="origin-top overflow-hidden transition-all duration-300 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp group-data-[collapsible=icon]:!h-0">
//             <SidebarMenuSub>
//               {folder.files?.map((subItem) => <FileItem key={subItem.id} file={{ ...subItem, type: "file" }} isSubmenu />)}
//             </SidebarMenuSub>
//           </CollapsibleContent>
//         ) : null}
//       </SidebarMenuItem>
//     </Collapsible>
//   );
// };

// const EmptyItem = () => (
//   <SidebarMenuItem className="text-sm group-data-[collapsible=icon]:hidden">
//     <SidebarMenuButton asChild className="pointer-events-none overflow-ellipsis text-nowrap">
//       <span>No folders yet</span>
//     </SidebarMenuButton>
//   </SidebarMenuItem>
// );

// const selector = ({ workspace }: WorkspaceStore) => ({
//   workspace,
// });

// export function NavFiles() {
//   const { folderId } = useParams();
//   const { workspace } = useWorkspaceStore(useShallow(selector));
//   const { addUntitledFile } = useFileActions();
//   const navigate = useNavigate();
//   const onFolderClick = (id: string) => {
//     navigate(`/folder/${id}`);
//   };
//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel>
//         All Files
//         <SidebarGroupAction title="Add File" onClick={() => addUntitledFile()}>
//           <Plus /> <span className="sr-only">Add File</span>
//         </SidebarGroupAction>
//       </SidebarGroupLabel>
//       <SidebarMenu>
//         {workspace.length ? (
//           workspace.map((item) =>
//             item.type === "folder" ? (
//               <FolderItem key={`folder${item.id}`} folder={item} onClick={() => onFolderClick(item.id)} />
//             ) : (
//               <FileItem key={item.id} file={item} isActive={folderId === item.id} />
//             )
//           )
//         ) : (
//           <EmptyItem />
//         )}
//       </SidebarMenu>
//     </SidebarGroup>
//   );
// }
