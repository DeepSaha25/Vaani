console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;
let lastVolume = 1.0;
let likedSongs = []; // --- NEW: Array to store liked songs ---

// --- NEW: SVG path data for the heart icons ---
const heartOutlinePath = "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";
const heartFilledPath = "M12 21.23l-1.06-1.06a5.5 5.5 0 0 1-7.78-7.78l1.06-1.06L12 5.67l1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-1.06 1.06L12 21.23z";


function setDynamicGreeting() {
    const greetingElement = document.getElementById('greeting');
    const currentHour = new Date().getHours();
    let greetingText = "Good morning";

    if (currentHour >= 12 && currentHour < 18) {
        greetingText = "Good afternoon";
    } else if (currentHour >= 18) {
        greetingText = "Good evening";
    }

    if (greetingElement) {
        greetingElement.textContent = greetingText;
    }
}

// --- MODIFIED: Added new songs and albums ---
const folderSongs = {
    "Kiliye Kiliye": ["Kiliye Kiliye.mp3"],
    "O mere Dil ke": ["O mere dil ke chain.mp3"],
    "Lag ja Gale": ["lag ja gale.mp3"],
    "karan aujla": [
        "Admirin You - Karan Aujla.mp3",
        "For A Reason.mp3",
        "Mexico (Original) - Karan Aujla.mp3",
        "Tell Me - Karan Aujla.mp3",
        "Wavy Karan Aujla.mp3",
        "Winning Speech - Karan Aujla.mp3",
        "Boyfriend Karan Aujla.mp3"
    ],
    "Señorita - Shawn Mendes": ["Señorita - Shawn Mendes.mp3"],
    "Main Rang Sharbaton ka": ["Main Rang Sharbaton ka.mp3"],
    "Teri Deewani": ["Teri Deewani.mp3"],
    "Itna na mujhse tu pyar badha": ["Itna na mujhse tu pyar badha.mp3"],
    "Sahiba": ["Sahiba.mp3"],
    "Chikni Chameli": ["Chikni Chameli.mp3"],
    "Jalebi Bai": ["Jalebi Bai.mp3"],
    "JENNIE Hits": [
        "JENNIE - Mantra.mp3", 
        "JENNIE & Dominic Fike.mp3", 
        "JENNIE - like.mp3"
    ],
    "Doja Cat - Woman": ["Doja Cat - Woman.mp3"],
    "Naina": ["Naina.mp3"],
    "Coldplay X BTS - My Universe": ["Coldplay X BTS - My Universe.mp3"],
    "Even When_The Best Part": ["Olivia Rodrigo, Joshua Bassett - Even When_The Best Part.mp3"],
    "Dil Tu Jaan Tu": ["Dil Tu Jaan Tu.mp3"],
    "Varoon": ["Vaaroon - Mirzapur.mp3"]
};
// ------------------------------------------

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    
    // --- MODIFIED: To handle "Liked Songs" virtual folder ---
    if (folder === 'Liked Songs') {
        songs = likedSongs.map(fullPath => fullPath.split('/').pop()); 
        currFolder = 'Liked Songs';
    } else {
        currFolder = folder;
        let folderName = folder.split("/").pop(); 
        songs = folderSongs[folderName] || [];
    }

    if (songs.length === 0 && folder === 'Liked Songs') {
        songUL.innerHTML = `<li style="cursor: default; background: none; border: none;">No liked songs yet.</li>`;
        return songs;
    }

    for (const song of songs) {
        songUL.innerHTML += `
        <li role="button" tabindex="0">
            <img class="invert" width="24" src="img/music.svg" alt="Music icon">
            <div class="info"><div>${song.replaceAll("%20", " ").replace(".mp3", "")}</div></div>
            <div class="playnow">
                <span>Play Now</span>
                <img width="24" class="invert" src="img/play.svg" alt="Play now">
            </div> 
        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        if (e.style.cursor === 'default') return; 
        e.addEventListener("click", () => {
            let trackName = e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3";
            playMusic(trackName);
        });
        e.addEventListener("keydown", (event) => {
            if (event.key === 'Enter' || event.key === ' ') e.click();
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {

    if (!track) {
        document.querySelector(".songinfo").innerHTML = "Error: No track selected";
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
        play.src = "img/play.svg";
        return; 
    }

    function highlightCurrentSong(trackName) {
        const songListLi = document.querySelectorAll(".songList li");
        songListLi.forEach(li => li.classList.remove('active-song'));
        Array.from(songListLi).forEach(li => {
            const liTrackName = li.querySelector(".info").firstElementChild.innerHTML.trim();
            if (decodeURI(trackName).includes(liTrackName)) {
                li.classList.add('active-song');
            }
        });
    }
    
    if (currFolder === 'Liked Songs') {
        let fullPath = likedSongs.find(path => path.endsWith('/' + track));
        if (fullPath) {
            currentSong.src = fullPath;
        } 
        // We don't highlight in 'Liked Songs' view as it might be a different list
    } else {
        currentSong.src = `${currFolder}/${track}`;
        highlightCurrentSong(track);
    }

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.replace(".mp3", ""));
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


// --- NEW: Function to handle liking/unliking an album ---
function toggleLikeAlbum(likeButton) {
    const folderName = likeButton.dataset.folder;
    const songsInAlbum = folderSongs[folderName] || [];
    const isLiked = likeButton.classList.toggle('liked');
    const heartPath = likeButton.querySelector('svg path');

    if (isLiked) {
        heartPath.setAttribute('d', heartFilledPath);
        for (const song of songsInAlbum) {
            const fullPath = `songs/${folderName}/${song}`;
            if (!likedSongs.includes(fullPath)) likedSongs.push(fullPath);
        }
    } else {
        heartPath.setAttribute('d', heartOutlinePath);
        for (const song of songsInAlbum) {
            const fullPath = `songs/${folderName}/${song}`;
            likedSongs = likedSongs.filter(s => s !== fullPath);
        }
    }
    if (currFolder === 'Liked Songs') getSongs('Liked Songs');
}


async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");

    let folders = [
        "Kiliye Kiliye", 
        "O mere Dil ke", 
        "Lag ja Gale", 
        "karan aujla", 
        "Señorita - Shawn Mendes", 
        "Main Rang Sharbaton ka", 
        "Teri Deewani",
        "Itna na mujhse tu pyar badha",
        "Sahiba",
        "Chikni Chameli",
        "Jalebi Bai",
        "JENNIE Hits",
        "Doja Cat - Woman",
        "Naina",
        "Coldplay X BTS - My Universe",
        "Even When_The Best Part",
        "Dil Tu Jaan Tu",
        "Varoon"
    ];

    for (const folder of folders) { 
        try {
            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json(); 
            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card" role="button" tabindex="0">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <div class="like-btn" data-folder="${folder}" role="button" aria-label="Like album">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="${heartOutlinePath}"></path>
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="${response.title}" onerror="this.src='img/cover.jpg'">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        } catch (error) {
            console.error(`Could not load info.json for folder: ${folder}`, error);
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);  
            if (songs.length > 0) playMusic(songs[0]);
            else {
                document.querySelector(".songinfo").innerHTML = "No songs found";
                document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
                play.src = "img/play.svg";
            }
        });
        e.addEventListener("keydown", async (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                songs = await getSongs(`songs/${event.currentTarget.dataset.folder}`);
                if (songs.length > 0) playMusic(songs[0]);
                else {
                    document.querySelector(".songinfo").innerHTML = "No songs found";
                    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
                    play.src = "img/play.svg";
                }
            }
        });
    });

    Array.from(document.getElementsByClassName("like-btn")).forEach(e => {
        e.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleLikeAlbum(event.currentTarget);
        });
    });
}


async function main() {
    setDynamicGreeting();
    await getSongs("songs/Kiliye Kiliye");
    if (songs.length > 0) playMusic(songs[0], true);
    else playMusic(undefined, true);
    await displayAlbums();

    document.getElementById("likedSongsCard").addEventListener("click", () => {
        getSongs("Liked Songs");
        document.querySelector(".left").classList.remove("open");
    });

    play.addEventListener("click", () => {
        if (!currentSong.src || currentSong.src.endsWith("/")) {
            if (songs && songs.length > 0) playMusic(songs[0]);
            return;
        }
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = 
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = 
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // --- THIS IS THE UPDATED BLOCK ---
    currentSong.addEventListener("ended", async () => {
        if (!songs || songs.length === 0) return;

        let currentTrackName = decodeURI(currentSong.src.split("/").pop().split("?")[0]);
        let index = songs.indexOf(currentTrackName);

        // Check for next song in the current list (works for albums AND Liked Songs)
        if (index !== -1 && index + 1 < songs.length) {
            playMusic(songs[index + 1]);
            return;
        }

        // If it's the end of the list, AND we are in "Liked Songs", just stop.
        if (currFolder === 'Liked Songs') {
            document.querySelector(".songinfo").innerHTML = "End of Liked Songs 🎵";
            play.src = "img/play.svg";
            return; // Stop here
        }

        // If we're not in "Liked Songs", proceed to next album logic
        const folderOrder = [
            "Kiliye Kiliye", 
            "O mere Dil ke", 
            "Lag ja Gale", 
            "karan aujla", 
            "Señorita - Shawn Mendes", 
            "Main Rang Sharbaton ka", 
            "Teri Deewani",
            "Itna na mujhse tu pyar badha",
            "Sahiba",
            "Chikni Chameli",
            "Jalebi Bai",
            "JENNIE Hits",
            "Doja Cat - Woman",
            "Naina",
            "Coldplay X BTS - My Universe",
            "Even When_The Best Part",
            "Dil Tu Jaan Tu",
            "Varoon"
        ];

        const currentAlbum = currFolder?.split("/").pop();
        const currentAlbumIndex = folderOrder.indexOf(currentAlbum);

        if (currentAlbumIndex !== -1 && currentAlbumIndex + 1 < folderOrder.length) {
            const nextAlbum = folderOrder[currentAlbumIndex + 1];
            songs = await getSongs(`songs/${nextAlbum}`);
            if (songs.length > 0) playMusic(songs[0]);
            else {
                document.querySelector(".songinfo").innerHTML = "No songs found in next album";
                play.src = "img/play.svg";
            }
        } else {
            document.querySelector(".songinfo").innerHTML = "End of all albums 🎵";
            play.src = "img/play.svg";
        }
    });
    // --- END OF UPDATED BLOCK ---

    document.querySelector(".seekbar").addEventListener("click", e => {
        if (currentSong.duration) {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.add("open");
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.remove("open");
    });

    previous.addEventListener("click", () => {
        if (!currentSong.src || !songs || songs.length === 0) return;
        currentSong.pause();

        // FIX APPLIED HERE
        let currentTrackName = decodeURI(currentSong.src.split("/").pop().split("?")[0]);

        let index = songs.indexOf(currentTrackName);
        if (index === -1) playMusic(songs[0]);
        else if (index - 1 < 0) playMusic(songs[songs.length - 1]);
        else playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        if (!currentSong.src || !songs || songs.length === 0) return;
        currentSong.pause();

        // FIX APPLIED HERE
        let currentTrackName = decodeURI(currentSong.src.split("/").pop().split("?")[0]);

        let index = songs.indexOf(currentTrackName);
        if (index === -1) playMusic(songs[0]);
        else if (index + 1 >= songs.length) playMusic(songs[0]);
        else playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("input", (e) => {
        let newVolume = parseInt(e.target.value) / 100;
        currentSong.volume = newVolume;
        document.querySelector(".volume>img").src = newVolume === 0 ? "img/mute.svg" : "img/volume.svg";
    });

    document.querySelector(".volume>img").addEventListener("click", e => { 
        if (currentSong.volume > 0) {
            lastVolume = currentSong.volume;
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            let restoreVolume = lastVolume > 0 ? lastVolume : 1.0;
            e.target.src = "img/volume.svg";
            currentSong.volume = restoreVolume;
            document.querySelector(".range input").value = restoreVolume * 100;
        }
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.cardContainer .card');
            cards.forEach(card => {
                const title = card.querySelector('h2').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
                card.style.display = isVisible ? '' : 'none';
            });
        });
    }
}

main();