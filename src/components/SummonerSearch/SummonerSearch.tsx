import styles from "./SummonerSearch.module.css";
import notch from "@/styles/notch.module.css";

const SummonerSearch = () => {
  const regions = [
    { value: "euw1", label: "EUW" },
    { value: "na1", label: "NA" },
    { value: "eun1", label: "EUNE" },
    { value: "br1", label: "BR" },
    { value: "jp1", label: "JP" },
    { value: "kr", label: "KR" },
    { value: "la1", label: "LAN" },
    { value: "la2", label: "LAS" },
    { value: "oc1", label: "OCE" },
    { value: "tr1", label: "TR" },
    { value: "ru", label: "RU" },
  ];

  const searchForUser = (e: any) => {
    e.preventDefault();

  }

  return (
    <div className="o-row">
      <div className="u-horizontal u-center">
        <form onSubmit={searchForUser} className={styles.userForm}>
          <label htmlFor="user-username" className="u-hidden">
            username
          </label>
          <div className={styles.searchBar + " " + notch.notchedBorder}>
            <input
              type="text"
              name="username"
              className={styles.searchBarInput}
              required
              placeholder="Summoner"
            />
            <label htmlFor="region" aria-hidden="true"></label>
            <select
              name="region select"
              className={styles.searchBarRegion + " u-focus-border"}
              aria-label="Select region"
            >
              {regions.map((region) => {
                return (
                  <option value={region.value} key={region.value}>
                    {region.label}
                  </option>
                );
              })}
            </select>
            <button
              type="submit"
              value="Submit"
              className={styles.searchBarSubmit + " u-focus-border"}
              name="submit search for user"
              aria-label="submit query"
            >
              <svg
                className={styles.searchBarSearchIcon}
                viewBox="0 0 24 24"
              >
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
              <svg
                className={styles.searchBarValid}
                viewBox="0 0 24 24"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SummonerSearch;
