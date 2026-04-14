import { ArchiveIcon, ClockCounterClockwiseIcon, GaugeIcon, LayoutIcon, ChartBarIcon } from "@phosphor-icons/react";

export const SidebarItems = {
  user: {
    name: "Profile Name",
    email: "email@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      name: "Recents",
      url: "/",
      pattern: "^/(folder/.*)?$",
      icon: ClockCounterClockwiseIcon,
      isActive: true,
    },
    {
      name: "Subflows & Exceptions",
      url: "/templates",
      pattern: "^/templates$",
      icon: LayoutIcon,
    },
    {
      name: "Overview",
      url: "#",
      icon: GaugeIcon,
    },
    {
      name: "HQ Dashboard",
      url: "/hq",
      pattern: "^/hq(/.*)?$",
      icon: ChartBarIcon,
    },
    {
      name: "Archive",
      url: "/archive",
      pattern: "^/archive(/folder/.*)?$",
      icon: ArchiveIcon,
    },
  ],
  navSecondary: [],
};
