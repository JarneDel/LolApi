export default (local: string): string => {
  switch (local) {
    case "tr1":
    case "ru":
    case "eun1":
    case "euw1":
      return "europe";
    case "na1":
    case "la1":
    case "la2":
    case "oc1":
    case "br1":
      return "americas";
    case "jp1":
    case "kr":
      return "asia";
    default:
      return "europe";
  }
};
