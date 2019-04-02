/*************************************/
/* modify and return the data nicely */
/*************************************/

// do setup
init();

// playlists by mood, with the mood name as the key and the spotify uri as the value
var emotionsAndPlaylistURIs = {
    "inspired": "16FifVITGI0ud84IuTgj03",
    "mystical": "4mtsECh01GM83NtxaGMfJh",
    "nervous": "2iBCVCTuASBm02g21RkDHh",
    "light": "2KZUim6CyNZUlGW7y31rzQ",
    "romantic": "0eJTbFi2rdb04nTPFGUBRS", 
    "crying": "5LAuDL2OeTaEkBPyoPnCNQ",
    "cool": "1t1dfglm1foJ15PiQF5MQs",
    "melancholy": "3goh9esdYY5plQy2fpRceS",
    "angry":"24XMcBTtHV7gPKazDHTwNc"
}

var emotionsAndColors = {
    "inspired": "rgb(104, 99, 43)",
    "mystical": "rgb(54, 27, 89)",
    "nervous": "rgb(122, 80, 53)",
    "light": "rgb(94, 134, 145)",
    "romantic": "rgb(114, 81, 101)", 
    "crying": "rgb(0, 23, 109)",
    "cool": "rgb(73, 96, 48)",
    "melancholy": "rgb(44, 60, 124)",
    "angry":"rgb(109, 32, 32)" /* red */
}

function buttonClick(emotionName) {
    openModal(emotionName);

    // get playlisturi for emotionname
    let playlistURI = getURI(emotionName);

    // post the recommendation
    fetchAndPostSong(playlistURI);
}

// get URI
function getURI(emotionName) {
    // get key for matching val
    for(playlist in emotionsAndPlaylistURIs) {
        if(playlist == emotionName) {
            return emotionsAndPlaylistURIs[playlist];
        }
    }
}

// get color
function getColor(emotionName) {
    // get key for matching val
    for(emotion in emotionsAndColors) {
        if(emotion == emotionName) {
            return emotionsAndColors[emotion];
        }
    }
}


// assign a click event for each box to return the name of the associated playlist
function init() {
    // set box listeners
    var boxes = document.querySelectorAll(".box");
    boxes.forEach(function addListeners(thisBox) {
        thisBox.addEventListener('click', function(event) {
            var emotionName = event.target.querySelector('.emotion-title').innerText;
            buttonClick(emotionName);
        });
    });
    // set close button listener on modal
    var closeBtn = document.querySelector(".modal-close");
    var modal = document.getElementById("song-modal");

    closeBtn.addEventListener('click', function(event) { closeModal(event);});
    modal.addEventListener('click', function(event) { closeModal(event); });
}

// opens the modal on the page
function openModal(emotionName) {
    var modal = document.getElementById("song-modal");
    var songRecText = document.getElementById("song-rec-text");
    let emoColor = getColor(emotionName);
    
    document.querySelector(".emotion-modal-label").innerText = emotionName;
    modal.style.backgroundImage = `radial-gradient(${emoColor}, black)`;
    document.body.style.overflow = "hidden";
    modal.style.opacity = "1";
    modal.style.pointerEvents = "all";
    songRecText.style.opacity = "1";
}

// closes down the modal
function closeModal(event) {
    var modal = document.getElementById("song-modal");
    var songRecText = document.getElementById("song-rec-text");

    modal.style.opacity = "0";
    modal.style.pointerEvents = "none";
    songRecText.style.opacity = "0";
    songRecText.innerText = ``;
    document.body.style.overflow = "auto";
}

// helper to get a random number between the min and max, inclusive
function getRandomInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; 
  }

/*************************************/
/* here are the fetch functions      */
/*************************************/

// the auth key
var authKey = "Bearer BQCp-Iytu2oiQA4IC9kcLMQv81zkIZ4Fh809bjT2-KHZslTA8eIEAFvFcFjlQXHWrwxbJ1TZw_OiERFax_vhTD932ZRrdgxuV-zhfWVX2vJw9oXtBLONimTSqIu6QwDfvg1WbvVHNfOh4lvn07yr3UiMCR-eHdaL2g";

// fetch the length and roll into the getTrack method
function fetchAndPostSong(playlistURI) {
    let fetchFromURL = 'https://api.spotify.com/v1/playlists/' + playlistURI + '?fields=tracks(total)';
    fetch(fetchFromURL, { method: "GET", headers: { "Authorization": authKey } 
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(myJSON) {
        return myJSON.tracks.total;
    }).then(function (playlistLength) {
        getTrack(playlistURI, playlistLength)
    });
}

// get a random track between the first and the last song on the playlist
function getTrack(playlistURI, playlistLength) {
    // do fetch with playlist length and new url
    let songIndex = getRandomInRange(0, playlistLength - 1);

    let fetchFromURL = "https://api.spotify.com/v1/playlists/" + playlistURI + "/tracks?fields=items(track(name,album,artists,id))&limit=1&offset=" + songIndex;

    fetch(fetchFromURL, { method: "GET", headers: { "Authorization": authKey } 
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(myJSON) {
        let songName = myJSON.items[0].track.name;
        let songArtist = myJSON.items[0].track.artists[0].name;
        let albumArtURL = myJSON.items[0].track.album.images[0].url;
        let songRecText = document.getElementById("song-rec-text");
        let songID = myJSON.items[0].track.id;

        // print the rec
        songRecText.innerHTML = 
        `<iframe class="spotify-player" src="https://open.spotify.com/embed/track/${songID}" width="80" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        <img class="album-art" src="${albumArtURL}"/>
        <p class="song-name">${songName}</p>
        <p class="artist-name">- ${songArtist}</p>`;
    });
}