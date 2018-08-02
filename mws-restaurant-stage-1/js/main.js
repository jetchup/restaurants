/*******
******** Add Service Worker here
*******/

/* from https://developers.google.com/web/fundamentals/primers/service-workers/ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js').then(function(registration) {
        // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
        // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

/******
******* End Service Worker
*******/

/*eslint indent: "error"*/

let restaurants,
    neighborhoods,
    cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap(); // added
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        option.setAttribute('aria-hidden', 'true');
        // option.setAttribute('tabindex', '-1');
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (cuisines = self.cuisines, hiddenElements = 'true') => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        option.setAttribute('aria-hidden', hiddenElements);
        // option.setAttribute('tabindex', '-1');
        select.append(option);
    });
    // we check if the list is open, modified from https://stackoverflow.com/questions/30729501/check-if-select-is-displaying-options
    // select.addEventListener('click', function(e) {
    //     const selectChildren = document.getElementById('cuisines-select').children;
    //     var isAriaHidden = selectChildren[1].attributes['aria-hidden'].value;
    //
    //     if (selectChildren[1].hasAttribute('aria-hidden') && isAriaHidden === 'true') {
    //         for (i =0; i < selectChildren.length; i++) {
    //             selectChildren[i].setAttribute('aria-hidden', 'false');
    //         }
    //     } else {
    //         console.log(isAriaHidden, e.target);
    //     }
    // });
};

let changeAriaHidden = (e) =>  {

    //change aria attributes for cuisine selector and options
    const select = document.getElementById('cuisines-select');

    // we change aria-expanded, as seen on https://inclusive-components.design/collapsible-sections/
    select.onclick = (e) => {
        let expanded = select.getAttribute('aria-expanded') === 'true' || false;

        select.setAttribute('aria-expanded', !expanded);
        changeOptions(e);
    };

    // because apparently onclick doesn't work with <option>
    select.onchange = (e) => {
        let expanded = select.getAttribute('aria-expanded') === 'true' || false;

        select.setAttribute('aria-expanded', !expanded);
        changeOptions(e);
    };

    // set the aria attributes for neighborhood selection and its options
    const selectNeighborhoods = document.getElementById('neighborhoods-select');

    // we change aria-expanded, as seen on https://inclusive-components.design/collapsible-sections/
    selectNeighborhoods.onclick = (e) => {
        let expandedNeighborhoods = selectNeighborhoods.getAttribute('aria-expanded') === 'true' || false;

        selectNeighborhoods.setAttribute('aria-expanded', !expandedNeighborhoods);
        changeOptionsNeighborhoods(e);
    };
    // because apparently onclick doesn't work with <option>
    selectNeighborhoods.onchange = (e) => {
        let expandedNeighborhoods = selectNeighborhoods.getAttribute('aria-expanded') === 'true' || false;

        selectNeighborhoods.setAttribute('aria-expanded', !expandedNeighborhoods);
        changeOptionsNeighborhoods(e);
    };
};

// detecting keys, adapted from https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
let navKeys = (e) => {
    e = e || window.event;
    let select = document.activeElement.children;
    // let lastChild = document.activeElement.lastElementChild;
    // let firstChild = document.activeElement.firstElementChild;

    // focus on the selected element
    // let selectedOption = (e) => {
    //     for (let i=0; i < select.length; i++) {
            // if (select[i].selected && i === 0) {
            //     lastChild.setAttribute('tabindex', 0);
            //     lastChild.focus();
            //     console.log(lastChild.value);
            // }
            // if (select[i].selected && i === (select.length)) {
            //     firstChild.setAttribute('tabindex', 0);
            //     firstChild.focus();
            //     console.log(firstChild.value + ' this is the first child');
            // }
            // if (select[i].selected) {
            //     select[i].previousElementSibling.setAttribute('tabindex', 0);
            //     select[i].previousElementSibling.focus();
            //     console.log(select[i].previousElementSibling.value + ' this is the previous element');
            // } else {
            //     select[i].setAttribute('tabindex', '-1');
            // }
            // if (i === 0) {
            //  aria-activedescendant="IDREF"
            // }
    //     }
    // };

    // adapted from hacky https://stackoverflow.com/questions/19183715/keydown-event-in-drop-down-list
    let checkIfExpanded = (e) => {
        const selectCuisine = document.getElementById('cuisines-select');
        let expanded = selectCuisine.getAttribute('aria-expanded') === 'true' || false;
        var lastval=null;

        $(document).keyup(function(e){
            // checks if the selection is not expanded
            if(!expanded && lastval!=null) {

                if (e.which == 13) {
                    console.log('you pressed enter');
                }
                // it resets the aria-expanded of the select so that keys don't affect my whole concept
                //console.log("you pressed a key inside the select");
                selectCuisine.setAttribute('aria-expanded', 'false');
                changeOptions(e);

            } else {
                console.log(expanded);
            }
        });

        $(document).on('change', selectCuisine, function (e) {
            var cr = $(this).val();
            if (expanded) {
                selectCuisine.each(function () {
                    $(this).val(cr);
                });
            } else {
                lastval=cr;
            }
        });
    };




    if (e.keyCode == '38') {
        // up arrow
        checkIfExpanded(e);
    }
    else if (e.keyCode == '40') {
        // down arrow
        checkIfExpanded(e);
    }
    else if (e.keyCode == '37') {
        // left arrow
        checkIfExpanded(e);
    }
    else if (e.keyCode == '39') {
        // right arrow
        checkIfExpanded(e);
    }
    else if (e.keyCode == '13') {
        // enter
        checkIfExpanded(e);
    }
};
document.onkeydown = navKeys;

/**
***** modifiying cuisine's and neighborhood's attributes to change aria values
**/

// change cuisinie option's aria-hidden value
let changeOptions = (e) => {

    //change aria attributes for cuisine selector and options
    const select = document.getElementById('cuisines-select');
    var isAriaExpanded = select.attributes['aria-expanded'].value;

    //trigger changes on the aria attributes
    letsChangeAriaExpanded(isAriaExpanded, select);
};

// change neighborhood option's aria-hidden value
let changeOptionsNeighborhoods = (e) => {

    // set the aria attributes for neighborhood selection and its options
    const selectNeighborhoods = document.getElementById('neighborhoods-select');
    var isAriaNeighborhoodsExpanded = selectNeighborhoods.attributes['aria-expanded'].value;

    //trigger changes on the aria attributes
    letsChangeAriaExpanded(isAriaNeighborhoodsExpanded, selectNeighborhoods);
};

// changes the ariahidden of the selected / not selected options
let letsChangeAriaHidden =  (i, select) => {
    if (select.children[i].selected) {
        select.children[i].setAttribute('aria-hidden', 'false');
        select.children[i].setAttribute('aria-selected', 'true');
    } else {
        select.children[i].setAttribute('aria-selected', 'false');
        select.children[i].setAttribute('aria-hidden', 'true');
    }
};

//trigger changes on the aria attributes
let letsChangeAriaExpanded = (isAriaExpanded, select) => {

    if (select.hasAttribute('aria-haspopup') && isAriaExpanded === 'false') {
        for (let i =0; i < select.children.length; i++) {
            select.children[i].setAttribute('aria-hidden', 'true');

            // and change the option's aria-selected value
            letsChangeAriaHidden(i, select);
            updateRestaurants();
        }
    } else if (select.hasAttribute('aria-haspopup') && isAriaExpanded === 'true') {
        for (let i =0; i < select.children.length; i++) {
            select.children[i].setAttribute('aria-hidden', 'false');
        }
    }
};
/**
***** end neighborhood aria attributes
**/

/**
 * Initialize leaflet map, called from HTML.
 */
let initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiamV0Y2h1cCIsImEiOiJjamplYmxuOHY0bXQ2M2tvNnU1dHh0OW03In0.aX6qMW0KNSOfBde5rMadVQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(newMap);

    updateRestaurants();
};
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = (e) => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;
    //we change the aria-hidden value of the options
    $(function () {changeAriaHidden(e);});

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    })
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    if (self.markers) {
        self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    const div = document.createElement('div');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.setAttribute('alt', restaurant.name);
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    li.append(image);

    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    div.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    div.append(neighborhood);

    const lineBreak = document.createElement('br');
    neighborhood.append(lineBreak);

    const address = document.createElement('span');
    address.innerHTML = restaurant.address;
    neighborhood.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    div.append(more)

    li.append(div);

    return li
};

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on('click', onClick);
        function onClick() {
            window.location.href = marker.options.url;
        }
        self.markers.push(marker);
    });
};
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
