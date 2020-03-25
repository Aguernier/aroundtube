const map = L.map('map');
var positionMarkers = [];
var tubeMarkers = [];
var circles = [];
const $searchGeolocation = $('#searchGeolocation');
const $searchAroundTube =  $('#searchAroundTube');
var apiKey;
var clientId;
init();

function init() {
    initMap();
    searchGeolocationOnSubmit();

    setConfig();
}

function setConfig() {
    let client = new XMLHttpRequest();
    client.open('GET', '/config/config.json', false);
    client.onreadystatechange = function() {
        let data = JSON.parse(client.responseText);
        apiKey = data.apiKey;
        clientId = data.clientId;
    }
    client.send();
}

function initMap() {
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        function(position) {
            updateMap(position.coords.latitude, position.coords.longitude);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        
            
            fillForm(position.coords.latitude, position.coords.longitude);

        }, function(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }, options)
    } else {
        alert('Geoloc non disponible');
    }
}

function updateMap(lat, lng, zoom = 12) {
    removeLayers(positionMarkers);
    removeLayers(circles);
    map.setView([lat, lng], zoom);

    let marker = new L.marker([lat, lng]);

    positionMarkers.push(marker);

    map.addLayer(marker);
    marker
        .bindPopup('Votre position: ' + lat + ',' + lng)
        .openPopup()
    ;

    createPositionCircle(lat, lng, getUserDistance());
}

function fillForm(lat, lng) {
    var latitudeField = document.getElementById('userLatitude');
    var longitudeField = document.getElementById('userLongitude');

    latitudeField.value = lat;
    longitudeField.value = lng;
}

function searchGeolocationOnSubmit() {
    $searchGeolocation.on('submit', function(e) {
        e.preventDefault();
        $('ul', $(this)).remove();
        const $searchAddress = $('#searchAddress');
        if ($searchAddress.val().length < 10) {
            return;
        }
        const q = encodeURIComponent( $searchAddress.val().split(' ').join('+'));
    
        $.ajax({
            url: 'https://api-adresse.data.gouv.fr/search/?q='+q,
            method: 'get'
        }).done(function(data) {
            const ul = $('<ul>', {
                class: 'list-group'
            });
            data.features.forEach(element => {
                //let template = `<li>${element.properties.label}</li>`;
                const li = $('<li>', {
                    class: 'list-group-item',
                    text: element.properties.label
                });
                li.on('click', function() {
                    $searchAddress.val(element.properties.label);
                    fillForm(element.geometry.coordinates[1], element.geometry.coordinates[0])
                    updateMap(element.geometry.coordinates[1], element.geometry.coordinates[0])
                    ul.remove();
                });
    
                ul.append(li);
            });
            $searchAddress.after(ul);
        }).fail(function() {
            alert('Impossible de récupérer les informations sur l\'adresse renseignée.')
        })
    })
}

function createPositionCircle(lat, lng, radius = 10000) {
    var circle = new L.circle([lat, lng], {
        color: '#007bff',
        fillColor: '#17a2b8',
        fillOpacity: 0.2,
        radius: radius
    });
    map.addLayer(circle);  
    circles.push(circle);  
}

function removeLayers(layersArray) {
    for(i = 0; i < layersArray.length; i++) {
        map.removeLayer(layersArray[i]);
    } 
}

function getUserDistance() {
    return parseInt($('#distance').val()*1000);
}

const authorizeButton = document.getElementById('authorizeButton');
const signoutButton = document.getElementById('signoutButton');

// https://github.com/google/google-api-javascript-client/blob/master/docs/auth.md 
// https://github.com/google/google-api-javascript-client/blob/master/samples/authSample.html
// on charge le client Auth2
gapi.load("client:auth2", function () {
    gapi.auth2.init({ 
        apiKey: apiKey,
        clientId: clientId,
        //scope: 'https://www.googleapis.com/auth/youtube.readonly',
        scope: 'https://www.googleapis.com/auth/youtube.readonly'
    }).then(
        function (data) {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        },
        function (err) { 
            console.error("Error signing in", err); 
        }
    );
});

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        //https://developers.google.com/identity/sign-in/web/reference
        const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        showProfile(profile);
        loadYouTubeClient();
        showSearchAroundTubeForm();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        hideProfile();
        hideSearchAroundTubeForm();
    }
}

function showProfile(profile) {
    $('#userInfo span').text('Hello ' + profile.getName());
    $('#userInfo img').attr('src', profile.getImageUrl());
}

function hideProfile() {
    $('#userInfo span').text('');
    $('#userInfo img').attr('src', '');
}

function showSearchAroundTubeForm() {
    $searchAroundTube.css('display', 'block');
}

function hideSearchAroundTubeForm() {
    $searchAroundTube.css('display', 'none');
}


function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function loadYouTubeClient() {
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(
        function () { 
            initYouTubeApp()
        },
        function (err) { 
            console.error("Error loading GAPI client for API", err); 
        }
    );
}

function initYouTubeApp() {
    nextPageListener();
    prevPageListener();
    $searchAroundTube.on('submit', function(e) {
        e.preventDefault();
        execute();
    })
}

function nextPageListener() {
    $('[data-next-page-token]').on('click', function(e) {
        e.preventDefault();
        execute($(this).data("next-page-token"));
    })
}

function prevPageListener() {
    $('[data-prev-page-token]').on('click', function(e) {
        e.preventDefault();
        execute($(this).data("prev-page-token"));
    })
}

// Make sure the client is loaded and sign-in is complete before calling this method.
/**
 * @return Promise
 * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise
 */
function execute(pageToken = null) {
    removeLayers(tubeMarkers);
    const lat = $('#userLatitude').val();
    const lng = $('#userLongitude').val();
    const distance = $('#distance').val();
    updateMap(lat, lng);
    let args = {
        "part": 'id',
        "location": lat + ',' + lng,
        "locationRadius": distance+'km',
        "type": 'video',
        'maxResults': 50
    }
    if (pageToken !== null) {
        args.pageToken = pageToken;
    }
    gapi.client.youtube.search.list(args).then(function(data) {
        if (typeof(data.result.prevPageToken) !== 'undefined') {
            $('[data-prev-page-token]').data('prev-page-token', data.result.prevPageToken);
        }
        if (typeof(data.result.nextPageToken) !== 'undefined') {
            $('[data-next-page-token]').data('next-page-token', data.result.nextPageToken);
        }
        let videoIds = '';
        data.result.items.forEach(element => {
            videoIds += element.id.videoId+',';
        });
        showVideoOnMap(videoIds.slice(0, -1));
    });
}

/**
 * @return Promise
 * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise
 */
function searchVideoById(videoIds) {
    return gapi.client.youtube.videos.list({
        "part": "recordingDetails, snippet",
        "id": videoIds
    })
}

function showVideoOnMap(videoIds) {
    searchVideoById(videoIds)
    .then(
        function(data) {
            let markers = [];
            var greenIcon = L.icon({
                iconUrl: '/assets/img/youtube_social_circle_red.png',
                iconSize:     [32, 32], // size of the icon
                //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                //shadowAnchor: [4, 62],  // the same for the shadow
                //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
            data.result.items.forEach(element => {
                const lat = element.recordingDetails.location.latitude;
                const lng = element.recordingDetails.location.longitude;
                const key = lat+'_'+lng;
                if (typeof(markers[key]) === 'undefined') {
                    markers[key] = [];
                }
                markers[key].push(element);
            });
            for (const key in markers) {
                const element = markers[key]
                    , latlng = key.split('_')
                    , lat = latlng[0]
                    , lng = latlng[1]
                ;
                let marker = new L.marker([lat, lng], {icon: greenIcon});
                tubeMarkers.push(marker);
                map.addLayer(marker);
                let tpl = `<h3${lat},${lng}</h3>`;
                tpl += '<div class="videoListMarker">';
                element.forEach(video => {
                    tpl += `<div class="media">
                        <img src="${video.snippet.thumbnails.default.url}" class="mr-3" alt="...">
                        <div class="media-body">
                            <h5 class="mt-0">
                                <a target="_blank" href="https://www.youtube.com/watch?v=${video.id}">
                                    ${video.snippet.title}
                                </a>
                            </h5>
                            ${video.snippet.description}
                        </div>
                    </div>`;
                });
                tpl += '</div>';
                var popup = new L.popup().setContent(tpl);
                marker.bindPopup(popup);
            }
        },
        function(err) { 
            console.error("Execute error", err); 
        }
    );
}