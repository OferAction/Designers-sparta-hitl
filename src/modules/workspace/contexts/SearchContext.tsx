import { createContext, useContext, useState, useMemo, ReactNode } from "react";

import debounce from "lodash.debounce";

interface SearchContextType {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debouncedUpdate = useMemo(
    () =>
      debounce(
        (value: string) => {
          setDebouncedSearch(value);
        },
        300,
        {
          leading: false,
          trailing: true,
        }
      ),
    []
  );

  return <SearchContext.Provider value={{ searchValue: debouncedSearch, setSearchValue: debouncedUpdate }}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
