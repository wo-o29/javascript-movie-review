import "./searchForm.css";
import getSearchedMovieList from "../../apis/getSearchedMovieList";
import { replaceMovieListBox } from "../../main";
import { removeBanner } from "../Banner/Banner";
import { setMovieListState } from "../MovieListBox/MovieListBox";
import { replaceSkeletonList } from "../MovieListBox/Skeleton/MovieList/SkeletonList";
import { addErrorBox } from "../ErrorBox/ErrorBox";

const handleSearchFormSubmit = async (event: Event) => {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const searchValue = target["search-input"].value;

  if (searchValue === "") {
    alert("검색어를 입력해주세요.");
    return;
  }

  try {
    removeBanner();
    replaceSkeletonList();
    const searchResult = await getSearchedMovieList(searchValue, 1);
    replaceMovieListBox({
      title: `"${searchValue}" 검색 결과`,
      movieResult: searchResult,
    });

    setMovieListState({
      type: "search",
      keyword: searchValue,
      page: 1,
    });
  } catch (error) {
    if (error instanceof Error) {
      addErrorBox({
        selector: ".movie-list-section",
        errorMessage: error.message,
      });
    }
  }
};

const $SearchForm = () => {
  const $searchForm = createElement("form", {
    className: "search-form",
  });
  const $searchInput = createElement("input", {
    className: "search-input",
    name: "search-input",
    type: "text",
    placeholder: "검색어를 입력하세요",
  });
  const $searchButton = createElement("button", {
    type: "submit",
  });
  const $searchIcon = createElement("img", {
    src: "./search.svg",
    alt: "search",
  });
  $searchButton.appendChild($searchIcon);

  $searchForm.append($searchInput, $searchButton);
  $searchForm.addEventListener("submit", handleSearchFormSubmit);
  return $searchForm;
};

export default $SearchForm;
