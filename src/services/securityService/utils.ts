export const generateAvatarColor = (): string => {
  return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
};

export const getInitials = (name: string): string => {
  return name?.slice(0, 2).toUpperCase() || "";
};
