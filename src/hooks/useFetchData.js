import { useEffect, useState } from "react";

/**
 * Normalize countries.dev response to the shape the rest of the app expects
 * (similar to old restcountries v3.1).
 */
const normalizeCountry = (country) => {
  if (!country) return null;

  const nameStr =
    typeof country.name === "string"
      ? country.name
      : country.name?.common || "";
  const capital =
    typeof country.capital === "string"
      ? [country.capital]
      : Array.isArray(country.capital)
        ? country.capital
        : country.capital
          ? [String(country.capital)]
          : [];

  // currencies: array -> object keyed by code
  let currencies = {};
  if (Array.isArray(country.currencies)) {
    country.currencies.forEach((c) => {
      if (c?.code) {
        currencies[c.code] = {
          name: c.name || c.code,
          symbol: c.symbol || "",
        };
      }
    });
  } else if (country.currencies && typeof country.currencies === "object") {
    currencies = country.currencies;
  }

  // languages: array -> object
  let languages = {};
  if (Array.isArray(country.languages)) {
    country.languages.forEach((lang, idx) => {
      const key = lang.iso639_1 || lang.iso639_2 || `lang${idx}`;
      languages[key] = lang.name || lang.nativeName || key;
    });
  } else if (country.languages && typeof country.languages === "object") {
    languages = country.languages;
  }

  const tld = country.topLevelDomain || country.tld || [];

  return {
    name: {
      common: nameStr,
      official: country.nativeName || nameStr,
    },
    flags: {
      svg: country.flags?.svg || country.flag || "",
      png: country.flags?.png || "",
      alt: `Flag of ${nameStr}`,
    },
    region: country.region || "",
    subregion: country.subregion || "",
    capital,
    population: country.population ?? 0,
    tld: Array.isArray(tld) ? tld : [tld].filter(Boolean),
    currencies,
    languages,
    alpha2Code: country.alpha2Code,
    alpha3Code: country.alpha3Code,
  };
};

export const useFetchData = (country) => {
  const [result, setResult] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchDataFromAPI(country);
  }, [country]);

  const fetchDataFromAPI = (countryName) => {
    // countries.dev is free, no key, and has CORS enabled
    let url = "https://countries.dev/countries";

    if (countryName) {
      url = `https://countries.dev/name/${encodeURIComponent(countryName)}`;
    }

    setIsLoading(true);
    setIsError(false);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (countryName) {
          const list = Array.isArray(data) ? data : [data];
          const normalized = normalizeCountry(list[0]);
          if (!normalized) {
            throw new Error("Country not found");
          }
          setResult(normalized);
        } else {
          const list = Array.isArray(data) ? data : [];
          const normalizedList = list.map(normalizeCountry).filter(Boolean);

          setResult(normalizedList);
          setFilteredCountries(normalizedList);
          localStorage.setItem("countrys", JSON.stringify(normalizedList));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem("countrys");
        if (saved && !countryName) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setResult(parsed);
              setFilteredCountries(parsed);
              return;
            }
          } catch {
            // ignore
          }
        }
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  };

  return {
    result,
    filteredCountries,
    setFilteredCountries,
    isLoading,
    isError,
  };
};
