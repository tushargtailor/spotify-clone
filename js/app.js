console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

     // show all thesongs in the play list 
     let songUL  = document.querySelector(".songList").getElementsByTagName("ul")[0]
     songUL.innerHTML=""
     for (const song of songs) {
         songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ").replaceAll("%5BNCS" , " ").replaceAll("%5D", " ").replace("%26", "&")}</div>
                        <div>Tushar</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div> </li>`;
     }
 
     // Attach an event listner to each song
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
         e.addEventListener("click", element => {
             console.log(e.querySelector(".info").firstElementChild.innerHTML)
             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
 
         })
     })

     return songs
    
}

const playMusic = (track, pause=false) => {
    // let audio= new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    console.log("Displaying albums...");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    if (!cardContainer) {
        console.error("Card container not found!");
        return;
    }

    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            // Extract the folder name correctly
            let parts = e.href.split("/").filter(Boolean);
            let folder = parts[parts.length - 1];  // Correctly get the folder name

            // If the folder name is "songs", skip it (this should not be treated as an album)
            if (folder === 'songs') {
                continue;
            }

            console.log("Fetching album info for folder:", folder);

            try {
                // Fetch the album info
                let infoResponse = await fetch(`/songs/${folder}/info.json`);

                // Log if the folder name was extracted correctly
                console.log("Info JSON URL:", `/songs/${folder}/info.json`);

                if (!infoResponse.ok) {
                    throw new Error(`Failed to fetch info for album: ${folder}`);
                }

                let infoData = await infoResponse.json();
                console.log("Album info data:", infoData);

                // Create and append the card to the container
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="black">
                                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="Album Cover" />
                        <h2>${infoData.title}</h2>
                        <p>${infoData.description}</p>
                    </div>`;

                // No need to attach event listeners to individual cards anymore, because we will use event delegation
            } catch (err) {
                console.error(`Error fetching info for album ${folder}:`, err);
            }
        }
    }

    // Event delegation: attach a single click event listener to the card container
    cardContainer.addEventListener("click", async (e) => {
        // Check if the clicked element is a card
        let card = e.target.closest(".card");
        if (card) {
            let folder = card.getAttribute("data-folder");
            console.log("Fetching songs for album:", folder);
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]); // Play the first song when the album is clicked
        }
    });
}



async function main(){

    // Get the List of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // display all the allbum name 
    await displayAlbums();

   

    //Attach an event listner to play, next and previous 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

    
 
}

main() 