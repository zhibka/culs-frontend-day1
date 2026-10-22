// Loads the herbs from data/herbs.json and shows each one as a card.

const detail = document.querySelector("#herb-detail");
const main = document.querySelector("#herbs-main");

function focusContent(target) {
  if (!target) return;
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  target.scrollIntoView();
}

function showImageFallback(image) {
  if (!image.isConnected) return;
  const fallback = element("span", "image-fallback", "Image unavailable");
  if (image.alt) {
    fallback.setAttribute("role", "img");
    fallback.setAttribute("aria-label", `${image.alt}. Image unavailable.`);
  } else {
    fallback.setAttribute("aria-hidden", "true");
  }
  image.replaceWith(fallback);
}

// Image errors do not bubble; capture them before a broken image is displayed.
document.addEventListener("error", (event) => {
  if (event.target instanceof HTMLImageElement) {
    showImageFallback(event.target);
  }
}, true);

// The header logo may have failed before this deferred script started.
document.querySelectorAll("img[src]").forEach((image) => {
  if (image.complete && image.naturalWidth === 0) showImageFallback(image);
});

async function loadHerbs() {
  const response = await fetch("data/herbs.json");
  if (!response.ok) {
    throw new Error(`Could not load ${response.url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function loadHerb(id) {
  const response = await fetch(`data/${id}.json`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("HERB_NOT_FOUND");
    }

    throw new Error("SERVER_ERROR");
  }
  return response.json();
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function elementLink(className, text, link) {
  const node = element("a", className, text);
  node.href=link;
  return node;
}

function getCurrentSeason(date = new Date()) {
  const month = date.getMonth();

  if (month === 11 || month < 2) return "winter";
  if (month < 5) return "spring";
  if (month < 8) return "summer";
  return "autumn";
}

function seasonName(season) {
  return season[0].toUpperCase() + season.slice(1);
}

function card(herb, currentSeason) {
  const item = element("li", "card", "");
  item.dataset.seasons = herb.seasons.join(" ");
  const heading = element("h3", "name", "");
  heading.append(
    elementLink("", herb.name, `#${herb.id}`)
  );
  const availableNow = herb.seasons.includes(currentSeason);
  item.append(
    heading,
    element("p", "latin", herb.latin),
    element("p", "use", herb.use),
    element("p", "life", herb.life),
    element("p", "season", `Usually available: ${herb.seasons.map(seasonName).join(", ")}`),
    element(
      "p",
      `season-current${availableNow ? " is-available" : ""}`,
      availableNow ? "Available this season" : "Not usually available this season"
    )
  );
  return item;
}

async function renderHerbList() {
  const list = document.querySelector("#herbs-list");
  const count = document.querySelector(".count");
  const herbs = await loadHerbs();
  const currentSeason = getCurrentSeason();
  const currentSeasonFilter = document.querySelector("#current-season-filter");
  const usualSeasonFilter = document.querySelector("#usual-season-filter");

  list.replaceChildren(...herbs.map((herb) => card(herb, currentSeason)));
  currentSeasonFilter.addEventListener("change", updateVisibleHerbs);
  usualSeasonFilter.addEventListener("change", updateVisibleHerbs);

  function updateVisibleHerbs() {
    let visibleCount = 0;

    for (const herbCard of list.children) {
      const seasons = herbCard.dataset.seasons.split(" ");
      const matchesCurrentSeason = !currentSeasonFilter.checked || seasons.includes(currentSeason);
      const matchesUsualSeason = !usualSeasonFilter.value || seasons.includes(usualSeasonFilter.value);
      herbCard.hidden = !matchesCurrentSeason || !matchesUsualSeason;
      if (!herbCard.hidden) visibleCount += 1;
    }

    count.textContent = visibleCount
      ? `Showing ${visibleCount} of ${herbs.length} herbs. Current season: ${seasonName(currentSeason)}.`
      : `No herbs match these filters. Current season: ${seasonName(currentSeason)}.`;
  }

  updateVisibleHerbs();
}

function showHerbMain(){
  detail.innerHTML = "";
    main.innerHTML=`
    <section class="intro">
        <div>
          <h1>Herbs you can smell, taste and grow</h1>
          <p>A small garden with herbs for the kitchen, for tea and for the bees.
            See <a href="#herbs">what grows here</a></p>
        </div>
        <img class="hero" src="images/garden.svg" alt="Two raised beds full of herbs, with a bee">
      </section>

      <section id="herbs">
        <h2>What grows here</h2>
        <p class="count" role="status" aria-live="polite">Loading the herbs…</p>
        <div class="season-filters">
          <label class="current-season-filter">
            <input id="current-season-filter" type="checkbox">
            Available in the current season (${seasonName(getCurrentSeason())})
          </label>
          <label for="usual-season-filter">Usually available in</label>
          <select id="usual-season-filter">
            <option value="">Any season</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="autumn">Autumn</option>
            <option value="winter">Winter</option>
          </select>
        </div>
        <ul id="herbs-list" class="cards"></ul>
      </section>

      <div id="visit-slot"></div>

      <section id="about">
        <h2>About</h2>
        <p>The Little Herb Garden is a guide to herbs for cooking, tea and
          pollinators. Explore each herb's growing seasons, uses and growing
          tips to find the right plants for your garden.</p>
      </section>
    `;
}

async function renderGardens() {
  const slot = document.querySelector("#visit-slot");
  if (!slot) return;
  slot.replaceWith(document.querySelector("#visit-template").content.cloneNode(true));
  const list = document.querySelector("#gardens-list");
  const status = document.querySelector("#gardens-status");
  try {
    const response = await fetch("data/gardens.json");
    if (!response.ok) throw new Error("Could not load gardens: " + response.status);
    const gardens = await response.json();
    if (!list.isConnected) return;
    list.replaceChildren(...gardens.map((garden) => {
      const card = document.querySelector("#garden-card-template").content.cloneNode(true);
      const image = card.querySelector("img");
      image.alt = garden.imageAlt;
      image.src = garden.image;
      card.querySelector(".garden-area").textContent = garden.area;
      card.querySelector(".garden-name").textContent = garden.name;
      card.querySelector(".garden-local-name").textContent = garden.localName;
      card.querySelector(".garden-description").textContent = garden.description;
      const map = card.querySelector(".garden-map");
      map.href = garden.map;
      map.setAttribute("aria-label", "Find " + garden.name + " on Google Maps");
      card.querySelector(".garden-source").href = garden.source;
      return card;
    }));
    status.textContent = gardens.length + " gardens to explore in Prague.";
    status.classList.add("visually-hidden");
  } catch (error) {
    status.textContent = "The gardens could not be loaded. Please refresh the page to try again.";
    console.error(error);
  }
}

function fillList(element, items) {
  const listItems = items.map(item => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  });
  element.replaceChildren(...listItems);
}

function renderFacts(facts) {
  return facts.map((fact) => {
    const card = document.createElement("div");
    card.className = "fact-card";
    const label = document.createElement("dt");
    label.textContent = fact.label;
    const value = document.createElement("dd");
    value.textContent = fact.value;
    card.append(label, value);
    return card;
  });
}

function showHerbDetail(){
  main.innerHTML="";
  detail.innerHTML = `
          <article>
            <header class="intro herb-intro">
              <div>
                <p class="eyebrow">Meet the herbs</p>
                <h1 id="dherb-name"></h1>
                <p class="latin"><i lang="la" id="dherb-latin"></i></p>
                <p id="dherb-description"></p>
                <a href="#growing" id="growing-link">Explore how it grows</a>
              </div>

              <figure class="herb-figure">
                <img class="hero" id="dherb-img" width="600" height="400">
                <figcaption id="dherb-imgdescr"></figcaption>
              </figure>
            </header>

            <section aria-labelledby="facts-heading">
              <h2 id="facts-heading"></h2>
              <p id="facts-status" role="status">Loading facts…</p>
              <dl id="dherb-facts" class="facts-grid"></dl>
              <noscript><p>Enable JavaScript to see the extra facts. The growing guide below is available without it.</p></noscript>
            </section>

            <div class="herb-sections">
              <section id="growing" class="card" aria-labelledby="growing-heading">
                <h2 id="growing-heading"></h2>
                <ul id="dherb-growing"></ul>
              </section>

              <section class="card" aria-labelledby="uses-heading">
                <h2 id="uses-heading"></h2>
                <ul id="dherb-enjoyment"></ul>
              </section>
            </div>

            <section class="video-section" aria-labelledby="video-heading">
              <h2 id="video-heading">Watch the video</h2>
              <div class="video-player">
                <iframe id="dherb-video" width="480" height="270"
                  loading="lazy" referrerpolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen></iframe>
              </div>
              <p><a id="dherb-link">Watch this video on YouTube</a>.</p>
            </section>

            <section aria-labelledby="garden-heading">
              <h2 id="garden-heading">Back to the garden</h2>
                <p><span id="garden-note"></span><a href="#herbs">Explore all herbs</a>.</p>
            </section>
          </article>
    `;
}

// Keep the herb route in the URL when moving to its growing section.
detail.addEventListener("click", (event) => {
  const link = event.target.closest("#growing-link");
  if (!link) return;

  event.preventDefault();
  const growing = detail.querySelector("#growing");
  growing.tabIndex = -1;
  growing.focus({ preventScroll: true });
  growing.scrollIntoView();
});

function renderHerb(data){
const name = document.querySelector("#dherb-name");
  const latin = document.querySelector("#dherb-latin");
  const description = document.querySelector("#dherb-description");
  const image = document.querySelector("#dherb-img");
  const imgdescr = document.querySelector("#dherb-imgdescr");
  const factsheading = document.querySelector("#facts-heading");
  const facts = document.querySelector("#dherb-facts");
  const status = document.querySelector("#facts-status");
  const growingheading=document.querySelector('#growing-heading');
  const growing=document.querySelector('#dherb-growing');
  const enjoymentheading=document.querySelector('#uses-heading');
  const enjoyment=document.querySelector('#dherb-enjoyment');
  const video = document.querySelector("#dherb-video");
  const link = document.querySelector("#dherb-link");
  const cards = renderFacts(data.facts);
  
  facts.replaceChildren(...cards);
  status.textContent = `${data.name} facts loaded.`;
  status.classList.add("visually-hidden");
  factsheading.textContent=`${data.name} at a glance`;

  document.querySelector("#garden-note").textContent = data.gardenNote ? `${data.gardenNote} ` : "";
  name.textContent=data.name;
  latin.textContent=data.latin;
  description.textContent=data.description;
  image.alt=data.img.alt;
  image.src=data.img.src;
  imgdescr.textContent=data.img.caption;

  growingheading.textContent=`Growing ${data.name}`;
  fillList(growing, data.grow);
  enjoymentheading.textContent=`Enjoying ${data.name}`;
  fillList(enjoyment, data.enjoy);

  video.src=data.video.embedurl;
  video.title=data.video.title;
  link.href=data.video.url;

  focusContent(detail.querySelector("h1"));
}

function showError(title, message) {
  main.innerHTML = "";

  detail.innerHTML = `
    <article>
      <h1></h1>
      <p class="error-message"></p>
      <p><a href="#herbs">Back to the herb garden</a></p>
    </article>
  `;

  detail.querySelector("h1").textContent = title;
  detail.querySelector(".error-message").textContent = message;
  focusContent(detail.querySelector("h1"));
}

async function show() {
  const id = location.hash.slice(1);

  const mainSections = ["herbs", "visit", "about"];

//filled Main section
  if (!id || mainSections.includes(id)) {
    showHerbMain();
    renderGardens();

    try {
      await renderHerbList();
    } catch (error) {
      showError(
        "Could not load herbs",
        "The herb list is currently unavailable."
      );
      console.error(error);
      return;
    }

    if (id) focusContent(document.getElementById(id)?.querySelector("h2"));

    return;
  }

//filled herb detail section
  try {
    const herb = await loadHerb(id);
    showHerbDetail();
    renderHerb(herb);

  } catch (error) {
    console.error(error);

    if (error.message === "HERB_NOT_FOUND") {
      showError(
        "Herb not found",
        `Sorry, we don't know the herb "${id}".`
      );
    } else {
      showError(
        "Could not load herb",
        "The herb information is currently unavailable. Please try again later."
      );
    }
  }
}

document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  focusContent(document.querySelector("#main-content"));
});

window.addEventListener("hashchange", show);

show();