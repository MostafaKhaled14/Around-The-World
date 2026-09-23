import CountryList from "../../components/CountryList/CountryList";
import RegionMenu from "../../components/RegionMenu/RegionMenu";
import SearchInput from "../../components/SearchInput/SearchInput";
import ShowMessage from "../../components/ShowMessage/ShowMessage";
import { useFetchData } from "../../hooks/useFetchData";

const Home = () => {
  const {
    result,
    filteredCountries,
    isError,
    isLoading,
    setFilteredCountries,
  } = useFetchData();

  return (
    <>
      {isError && <ShowMessage message="Something went wrong!" />}
      {isLoading && <ShowMessage message="Loading countries data...!" />}
      {!isError && !isLoading && (
        <>
          <div className="flex flex-col justify-between gap-10 md:h-14 md:flex-row md:gap-0">
            <SearchInput
              countriesList={result}
              filterCountriesList={setFilteredCountries}
            />
            <RegionMenu
              countriesList={result}
              filterCountriesList={setFilteredCountries}
            />
          </div>
          <CountryList data={filteredCountries} />
        </>
      )}
    </>
  );
};

export default Home;
