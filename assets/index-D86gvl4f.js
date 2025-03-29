var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZmI3ZDk0OTFkZWI0ZWQwYjcwNDY0YTY1Yzg1MDRkZiIsIm5iZiI6MTY5OTk1MjA1Mi4zMjgsInN1YiI6IjY1NTMzNWI0OTY1M2Y2MTNmNjI5N2IwMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.H063uQ08FDEdOPviEtLxSe3y82lmVsJcxNrjD0yq7ig";
class HTTPClient {
  constructor(baseUrl) {
    __publicField(this, "baseUrl", "");
    __publicField(this, "apiKey", "");
    this.baseUrl = baseUrl;
  }
  async get(url) {
    const headers = {
      "Content-Type": "application/json",
      ...this.apiKey && { Authorization: `Bearer ${this.apiKey}` }
    };
    const response = await fetch(this.baseUrl + url, {
      headers
    });
    return response.json();
  }
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
}
const tmdbClient = new HTTPClient(BASE_URL);
tmdbClient.setApiKey(TMDB_API_KEY);
const getPopularMovieList = async (page) => {
  const response = await tmdbClient.get(
    `/movie/popular?language=ko-KR&page=${page}`
  );
  if ("status_message" in response) {
    throw new Error(response.status_message);
  }
  return response;
};
const createElement = (tag, props = {}) => {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      Array.isArray(value) ? element.classList.add(...value) : element.classList.add(value);
      continue;
    }
    if (key === "dataset") {
      for (const [dataKey, dataValue] of Object.entries(value)) {
        element.setAttribute(`data-${dataKey}`, dataValue);
      }
      continue;
    }
    element[key] = value;
  }
  return element;
};
const wrapFragment = (children) => {
  const fragment = document.createDocumentFragment();
  fragment.append(...children);
  return fragment;
};
const removeBanner = () => {
  const $header2 = document.querySelector("header");
  $header2.classList.remove("banner-open");
  const $banner = document.querySelector(".background-container");
  $banner == null ? void 0 : $banner.remove();
};
const $Banner = () => {
  const $backgroundContainer = createElement("div", {
    className: "background-container"
  });
  $backgroundContainer.innerHTML = `
  <div class="overlay" aria-hidden="true"></div>
  <div class="top-rated-container">
    <div class="rate">
      <img src="./star_empty.png" class="star" />
      <span class="rate-value">9.5</span>
    </div>
    <div class="title">인사이드 아웃2</div>
  </div>`;
  return $backgroundContainer;
};
const asyncErrorBoundary = async ({
  asyncFn,
  fallbackComponent
}) => {
  try {
    await asyncFn();
  } catch (error) {
    if (error instanceof Error) {
      fallbackComponent(error.message);
    }
  }
};
const getSearchedMovieList = async (query, page) => {
  const response = await tmdbClient.get(
    `/search/movie?query=${query}&language=ko-KR&page=${page}`
  );
  if ("status_message" in response) {
    throw new Error(response.status_message);
  }
  return response;
};
const $EmptyList = () => {
  const $emptyPlanet = createElement("img", {
    src: "./empty-planet.svg",
    className: "empty-planet",
    alt: "검색 결과가 없습니다."
  });
  const $emptyText = createElement("h2", {
    textContent: "검색 결과가 없습니다."
  });
  const $box = createElement("div", {
    className: "empty-box"
  });
  $box.append($emptyPlanet, $emptyText);
  return $box;
};
const getMovieDetail = async (movieId) => {
  const response = await tmdbClient.get(`/movie/${movieId}?language=ko-KR`);
  if ("status_message" in response) {
    throw new Error(response.status_message);
  }
  return response;
};
const defaultPosterPath = "./default-poster.svg";
const imagePathPreFix = "https://image.tmdb.org/t/p/w440_and_h660_face";
const $MoviePoster = ({ className, title, poster_path }) => {
  const $poster = createElement("img", {
    className,
    src: "./placeholder-poster.svg",
    alt: title,
    loading: "lazy",
    onerror: "this.src='./error-poster.svg'",
    onload: function() {
      this.src = poster_path ? imagePathPreFix + poster_path : defaultPosterPath;
    }
  });
  return $poster;
};
const STORAGE_KEY = {
  rateValue: "rateValue"
};
function storageController(storage) {
  function getStorage2(key) {
    const item = storage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  }
  function setStorage2(key, value) {
    storage.setItem(key, JSON.stringify(value));
  }
  function removeStorage2(key) {
    storage.removeItem(key);
  }
  function clearStorage() {
    storage.clear();
  }
  return {
    getStorage: getStorage2,
    setStorage: setStorage2,
    removeStorage: removeStorage2,
    clearStorage
  };
}
const { getStorage, setStorage } = storageController(localStorage);
const fillStarIcon = (starIcon) => {
  const $path = starIcon.querySelector("path");
  $path.setAttribute("fill", "#FFC700");
};
const unFillStarIcon = (starIcon) => {
  const $path = starIcon.querySelector("path");
  $path.setAttribute("fill", "none");
};
const $StarIcon = ({ className, fill }) => {
  const $starIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  $starIcon.classList.add(className);
  $starIcon.innerHTML = `
    <path d="M16.5514 24.0789L22.8558 28.0731C23.6617 28.5837 24.6622 27.8243 24.4231 26.8836L22.6016 19.7183C22.5503 19.5188 22.5564 19.3088 22.6191 19.1125C22.6819 18.9162 22.7987 18.7417 22.9563 18.6089L28.6097 13.9034C29.3525 13.2851 28.9691 12.0523 28.0147 11.9904L20.6318 11.5112C20.4329 11.497 20.2422 11.4266 20.0818 11.3082C19.9214 11.1898 19.7979 11.0283 19.7258 10.8424L16.9722 3.90828C16.8974 3.71101 16.7643 3.54117 16.5906 3.42133C16.417 3.30149 16.211 3.2373 16 3.2373C15.789 3.2373 15.583 3.30149 15.4094 3.42133C15.2357 3.54117 15.1026 3.71101 15.0278 3.90828L12.2742 10.8424C12.2021 11.0283 12.0786 11.1898 11.9182 11.3082C11.7578 11.4266 11.5671 11.497 11.3682 11.5112L3.98525 11.9904C3.03087 12.0523 2.64746 13.2851 3.3903 13.9034L9.04371 18.6089C9.20126 18.7417 9.31813 18.9162 9.38088 19.1125C9.44362 19.3088 9.4497 19.5188 9.39841 19.7183L7.70918 26.3634C7.42222 27.4922 8.62287 28.4034 9.58991 27.7907L15.4486 24.0789C15.6134 23.974 15.8047 23.9183 16 23.9183C16.1953 23.9183 16.3866 23.974 16.5514 24.0789V24.0789Z" stroke="#FFC700" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="${fill}"/>
  `;
  return $starIcon;
};
const rateMessage = {
  0: "-",
  2: "최악이예요",
  4: "별로예요",
  6: "보통이에요",
  8: "재미있어요",
  10: "명작이에요"
};
const getRateValue = () => {
  return getStorage(STORAGE_KEY.rateValue) ?? {};
};
const getInitialRateValue = (id) => {
  const rateValueObject = getRateValue();
  const rateValue = rateValueObject[id] ?? 0;
  return rateValue;
};
const setRateValue = (id, rateValue) => {
  const rateValueObject = getRateValue();
  const newRateValue = { ...rateValueObject, [id]: rateValue };
  setStorage(STORAGE_KEY.rateValue, newRateValue);
};
const getRateValueDataset = (element) => {
  return Number(element.dataset.rateValue);
};
const setRateMessage = (rateValue) => {
  const $rateMessage = document.querySelector(".rate-message");
  $rateMessage.textContent = rateMessage[rateValue];
  const $rateValueMessage = document.querySelector(
    ".rate-value-message"
  );
  $rateValueMessage.textContent = `(${rateValue}/10)`;
};
const controlRateStarIconFill = (targetRateValue) => {
  const $rateButtons = document.querySelectorAll(
    ".rate-button"
  );
  $rateButtons.forEach(($rateButton) => {
    const rateValue = getRateValueDataset($rateButton);
    const $starIcon = $rateButton.querySelector(".star-icon");
    if (rateValue <= targetRateValue) {
      fillStarIcon($starIcon);
      return;
    }
    unFillStarIcon($starIcon);
  });
};
const handleRateButtonClick = (e, id) => {
  const $targetRateButton = e.currentTarget;
  const targetRateValue = getRateValueDataset(
    $targetRateButton
  );
  controlRateStarIconFill(targetRateValue);
  setRateMessage(targetRateValue);
  setRateValue(id, targetRateValue);
};
const $RateBox = (id) => {
  const initialRateValue = getInitialRateValue(id);
  const [_, ...rateValue] = Object.keys(rateMessage);
  const $rateButtonList = rateValue.map((rate) => {
    const $rateButton = createElement("button", {
      type: "button",
      className: "rate-button",
      dataset: {
        "rate-value": rate
      }
    });
    $rateButton.appendChild(
      $StarIcon({
        className: "star-icon",
        fill: Number(rate) <= initialRateValue ? "#FFC700" : "none"
      })
    );
    $rateButton.addEventListener(
      "click",
      (e) => handleRateButtonClick(e, id)
    );
    return $rateButton;
  });
  const $rateButtonBox = createElement("div", {
    className: "rate-button-box"
  });
  $rateButtonBox.append(...$rateButtonList);
  const $rateMessageBox = createElement("div", {
    className: "rate-message-box"
  });
  const $rateMessage = createElement("p", {
    className: "rate-message",
    textContent: rateMessage[initialRateValue]
  });
  const $rateValueMessage = createElement("span", {
    className: "rate-value-message",
    textContent: initialRateValue ? `${initialRateValue}/10` : "(0/10)"
  });
  $rateMessageBox.append($rateMessage, $rateValueMessage);
  const $rateContentBox = createElement("div", {
    className: "rating-content-box"
  });
  $rateContentBox.append($rateButtonBox, $rateMessageBox);
  const $rateTitle = createElement("h3", {
    className: "rate-title",
    textContent: "내 별점"
  });
  const $rateBox = createElement("div", {
    className: "rate-box"
  });
  $rateBox.append($rateTitle, $rateContentBox);
  return $rateBox;
};
const openModal = (content) => {
  const $modal = document.querySelector(".modal");
  const $modalContent = $modal.querySelector(".modal-content");
  $modalContent.replaceChildren(content);
  $modal.showModal();
};
const closeModal = () => {
  const $modal = document.querySelector(".modal");
  $modal.close();
};
const handleModalClick = (e) => {
  const target = e.target;
  const $closeModalButton = target.closest(".close-modal");
  if (target.classList.contains("modal") || $closeModalButton) {
    closeModal();
  }
};
const $Modal = () => {
  const $modal = createElement("dialog", {
    className: "modal"
  });
  const $closeButton = createElement("button", {
    type: "button",
    className: "close-modal"
  });
  $closeButton.appendChild(
    createElement("img", { src: "./modal_button_close.png", alt: "모달 닫기" })
  );
  const $modalContent = createElement("div", {
    className: "modal-content"
  });
  $modal.append($closeButton, $modalContent);
  $modal.addEventListener("click", handleModalClick);
  return $modal;
};
const $SkeletonMovieDetail = () => {
  const $detailModal = createElement("div", {
    className: "skeleton-detail-movie"
  });
  const $imageBox = createElement("div", {
    className: "skeleton-modal-image-box"
  });
  const $image = createElement("div", {
    className: "skeleton-modal-image"
  });
  $imageBox.appendChild($image);
  const $detailBox = createElement("div", {
    className: "detail-movie-box"
  });
  const $title = createElement("h2", {
    className: "skeleton-detail-movie-title"
  });
  const $category = createElement("p", {
    className: "skeleton-detail-movie-category"
  });
  const $movieRate = createElement("p", {
    className: "skeleton-detail-movie-rate"
  });
  const $rateBox = createElement("div", {
    className: "skeleton-rate-box"
  });
  const $descriptionBox = createElement("div", {
    className: "skeleton-detail-movie-description-box"
  });
  $detailBox.append($title, $category, $movieRate, $rateBox, $descriptionBox);
  $detailModal.append($imageBox, $detailBox);
  return $detailModal;
};
const parseReleaseDate = (releaseDate) => {
  const date = new Date(releaseDate);
  return date.getFullYear();
};
const parseGenre = (genres) => {
  return genres.map(({ name }) => name).join(", ");
};
const renderMovieDetailModal = async ({
  fetchFn
}) => {
  openModal($SkeletonMovieDetail());
  const movieDetail = await fetchFn();
  openModal($MovieDetailModal(movieDetail));
};
const $MovieDetailModal = ({
  id,
  poster_path,
  release_date,
  genres,
  title,
  overview,
  vote_average
}) => {
  const $detailModal = createElement("div", {
    className: "detail-movie"
  });
  const $imageBox = createElement("div", {
    className: "modal-image"
  });
  $imageBox.appendChild(
    $MoviePoster({
      className: "detail-movie-poster",
      title,
      poster_path
    })
  );
  const $detailBox = createElement("div", {
    className: "detail-movie-box"
  });
  const $title = createElement("h2", {
    className: "detail-movie-title",
    textContent: title
  });
  const $category = createElement("p", {
    className: "detail-movie-category",
    textContent: `${parseReleaseDate(release_date)} · ${parseGenre(genres)}`
  });
  const $movieRate = createElement("p", {
    className: "detail-movie-rate"
  });
  const $rateSpan = createElement("span", { textContent: "평균" });
  const $rateImage = createElement("img", {
    src: "./star_filled.png",
    className: "rate-star",
    alt: "평점"
  });
  const $rateText = createElement("span", {
    className: "rate-text",
    textContent: vote_average.toFixed(1)
  });
  $movieRate.append($rateSpan, $rateImage, $rateText);
  const $descriptionBox = createElement("div", {
    className: "detail-movie-description-box"
  });
  const $descriptionTitle = createElement("p", {
    className: "detail-movie-description-title",
    textContent: "줄거리"
  });
  const $descriptionContent = createElement("p", {
    className: "detail-movie-description-content",
    textContent: overview || "제공된 줄거리 정보가 없습니다."
  });
  $descriptionBox.append($descriptionTitle, $descriptionContent);
  $detailBox.append(
    $title,
    $category,
    $movieRate,
    $RateBox(id),
    $descriptionBox
  );
  $detailModal.append($imageBox, $detailBox);
  return $detailModal;
};
const addErrorBox = ({
  selector,
  errorMessage
}) => {
  const $container = document.querySelector(selector);
  if (!$container) {
    throw new Error(`${selector}가 존재하지 않습니다.`);
  }
  $container.replaceChildren($ErrorBox({ errorMessage }));
};
const $ErrorBox = ({ errorMessage }) => {
  const $errorPlanet = createElement("img", {
    src: "./empty-planet.svg",
    className: "empty-planet",
    alt: errorMessage
  });
  const $emptyText = createElement("h2", {
    textContent: errorMessage
  });
  const $box = createElement("div", {
    className: "error-box"
  });
  $box.append($errorPlanet, $emptyText);
  return $box;
};
const $MovieItem = ({ id, title, poster_path, vote_average }) => {
  const $rate = createElement("p", {
    className: "rate"
  });
  const $star = createElement("img", {
    src: "./star_empty.png",
    className: "star"
  });
  const $rateValue = createElement("span", {
    textContent: `${vote_average.toFixed(1)}`
  });
  $rate.append($star, $rateValue);
  const $movieTitle = createElement("strong", {
    className: "movie-title",
    textContent: title
  });
  const $description = createElement("div", {
    className: "item-desc"
  });
  $description.append($rate, $movieTitle);
  const $item = createElement("li", {
    className: "item"
  });
  const $posterBox = createElement("div", {
    className: "thumbnail-box"
  });
  $posterBox.appendChild(
    $MoviePoster({ className: "thumbnail", title, poster_path })
  );
  $item.append($posterBox, $description);
  $item.addEventListener("click", async () => {
    asyncErrorBoundary({
      asyncFn: () => renderMovieDetailModal({ fetchFn: () => getMovieDetail(id) }),
      fallbackComponent: (errorMessage) => addErrorBox({ selector: ".modal-content", errorMessage })
    });
  });
  return $item;
};
const addMovieItem = (movieList) => {
  const $movieList = document.querySelector(
    ".thumbnail-list"
  );
  const movieListFragment = wrapFragment(
    movieList.map((movieItemData) => $MovieItem(movieItemData))
  );
  $movieList.appendChild(movieListFragment);
};
const $MovieList = (movieList) => {
  if (!movieList.length) {
    return $EmptyList();
  }
  const $movieList = createElement("ul", {
    className: "thumbnail-list"
  });
  $movieList.append(
    ...movieList.map((movieItemData) => $MovieItem(movieItemData))
  );
  return $movieList;
};
const $SkeletonItem = () => {
  const $skeletonItem = createElement("li", {
    className: "skeleton-item"
  });
  const $skeletonPoster = createElement("div", {
    className: "skeleton-poster"
  });
  const $skeletonDescription = createElement("div", {
    className: "skeleton-description"
  });
  $skeletonItem.append($skeletonPoster, $skeletonDescription);
  return $skeletonItem;
};
const replaceSkeletonList = () => {
  const $movieListSection = document.querySelector(
    ".movie-list-section"
  );
  $movieListSection.replaceChildren($SkeletonList());
};
const addSkeletonList = () => {
  const $movieListSection = document.querySelector(
    ".movie-list-section"
  );
  $movieListSection.appendChild($SkeletonList());
};
const removeSkeletonList = () => {
  const $skeletonList = document.querySelector(".skeleton-list");
  $skeletonList == null ? void 0 : $skeletonList.remove();
};
const $SkeletonList = () => {
  const $skeletonList = createElement("ul", { className: "skeleton-list" });
  $skeletonList.append(...Array.from({ length: 20 }, () => $SkeletonItem()));
  return $skeletonList;
};
const removeObserver = ({ condition }) => {
  if (!condition) {
    return;
  }
  const $observer = document.querySelector(".observer");
  $observer == null ? void 0 : $observer.remove();
};
const renderMoreMovieList = async ({
  currentPage,
  fetchFn
}) => {
  addSkeletonList();
  const { page, total_pages, results } = await fetchFn(currentPage);
  removeObserver({ condition: page === total_pages });
  removeSkeletonList();
  addMovieItem(results);
};
const $MovieListBoxRender = () => {
  const movieState = {
    type: "popular",
    keyword: "",
    page: 1
  };
  const setMovieListState2 = ({ type, keyword, page }) => {
    movieState.type = type;
    movieState.keyword = keyword;
    movieState.page = page;
  };
  const loadMoreMovies = async () => {
    movieState.page += 1;
    if (movieState.type === "popular") {
      asyncErrorBoundary({
        asyncFn: () => renderMoreMovieList({
          currentPage: movieState.page,
          fetchFn: getPopularMovieList
        }),
        fallbackComponent: (errorMessage) => addErrorBox({ selector: ".movie-list-section", errorMessage })
      });
      return;
    }
    asyncErrorBoundary({
      asyncFn: () => renderMoreMovieList({
        currentPage: movieState.page,
        fetchFn: (page) => getSearchedMovieList(movieState.keyword, page)
      }),
      fallbackComponent: (errorMessage) => addErrorBox({ selector: ".movie-list-section", errorMessage })
    });
  };
  const $MovieListBox2 = ({ title, movieResult }) => {
    const $fragment = document.createDocumentFragment();
    const $title = createElement("h2", {
      className: "movie-list-title",
      textContent: title
    });
    const $movieList = $MovieList(movieResult.results);
    $fragment.append($title, $movieList);
    if (movieResult.page !== movieResult.total_pages) {
      const $observer = createElement("div", {
        className: "observer"
      });
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMoreMovies();
        }
      });
      observer.observe($observer);
      $fragment.appendChild($observer);
    }
    const $movieListBox = createElement("div", {
      className: "movie-list-box"
    });
    $movieListBox.appendChild($fragment);
    return $movieListBox;
  };
  return { setMovieListState: setMovieListState2, $MovieListBox: $MovieListBox2 };
};
const { setMovieListState, $MovieListBox } = $MovieListBoxRender();
const handleSearchFormSubmit = async (event) => {
  event.preventDefault();
  const target = event.target;
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
      movieResult: searchResult
    });
    setMovieListState({
      type: "search",
      keyword: searchValue,
      page: 1
    });
  } catch (error) {
    if (error instanceof Error) {
      addErrorBox({
        selector: ".movie-list-section",
        errorMessage: error.message
      });
    }
  }
};
const $SearchForm = () => {
  const $searchForm = createElement("form", {
    className: "search-form"
  });
  const $searchInput = createElement("input", {
    className: "search-input",
    name: "search-input",
    type: "text",
    placeholder: "검색어를 입력하세요"
  });
  const $searchButton = createElement("button", {
    type: "submit"
  });
  const $searchIcon = createElement("img", {
    src: "./search.svg",
    alt: "search"
  });
  $searchButton.appendChild($searchIcon);
  $searchForm.append($searchInput, $searchButton);
  $searchForm.addEventListener("submit", handleSearchFormSubmit);
  return $searchForm;
};
const $HeaderBox = () => {
  const $headerBox = createElement("div", {
    className: "header-box"
  });
  const $logoLink = createElement("a", { href: "/javascript-movie-review" });
  const $logoImage = createElement("img", {
    src: "./logo.png",
    alt: "MovieList"
  });
  $logoLink.appendChild($logoImage);
  $headerBox.append($logoLink, $SearchForm());
  return $headerBox;
};
const handleScrollToTopButtonClick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
const $ScrollToTopButton = () => {
  const $button = createElement("button", {
    type: "button",
    className: "scroll-to-top-button",
    textContent: "⬆"
  });
  $button.addEventListener("click", handleScrollToTopButtonClick);
  return $button;
};
const replaceMovieListBox = ({
  title,
  movieResult
}) => {
  const $movieListSection = document.querySelector(
    ".movie-list-section"
  );
  $movieListSection.replaceChildren(
    $MovieListBox({
      title,
      movieResult
    })
  );
};
const initPopularMovieListRender = async () => {
  replaceSkeletonList();
  const popularMovieListResult = await getPopularMovieList(1);
  replaceMovieListBox({
    title: "인기있는 영화",
    movieResult: popularMovieListResult
  });
};
const $header = document.querySelector("header");
$header.append($Banner(), $HeaderBox());
const $app = document.querySelector("#app");
$app.append($ScrollToTopButton(), $Modal());
asyncErrorBoundary({
  asyncFn: () => initPopularMovieListRender(),
  fallbackComponent: (errorMessage) => addErrorBox({ selector: ".movie-list-section", errorMessage })
});
