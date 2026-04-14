import moment from "moment";

export const getHumanizedDate = (date: string) => {
  const versionDate = moment(date);
  const now = moment();

  if (versionDate.isSame(now, "day")) {
    return "Today";
  } else if (versionDate.isSame(moment().subtract(1, "day"), "day")) {
    return "Yesterday";
  } else if (versionDate.isAfter(moment().subtract(7, "days"))) {
    return versionDate.format("dddd");
  } else if (versionDate.isSame(now, "year")) {
    return versionDate.format("MMM D");
  } else {
    return versionDate.format("MMM D, YYYY");
  }
};
