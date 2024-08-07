let isSongPlaying = false;
let currentAudio = null;
let currentQueue = [];
let originalQueue = [];
let isLoopPlaylistOn = false;
let isLoopTrackOn = false;
let isPaused = false;

// Function to update the volume of the current audio
function updateVolume() {
    const musicVolume = document.getElementById('musicVolume').value;
    const volumePercentage = document.getElementById('volumePercentage');

    if (currentAudio) {
        currentAudio.audio.volume = musicVolume / 100;
    }

    // Update the volume percentage display
    volumePercentage.textContent = `${musicVolume}%`;
}

document.getElementById('musicVolume').addEventListener('input', updateVolume);
document.getElementById('musicVolume').addEventListener('change', updateVolume); // For mobile browsers
document.getElementById('musicVolume').addEventListener('touchmove', updateVolume); // For touch events

function stopAllSound() {
    document.getElementById('currentSound').innerText = "None";
    if (currentAudio) {
        currentAudio.audio.pause();
        currentAudio.audio.currentTime = 0;
        isSongPlaying = false;
    }
}

function playSound(filename, soundName, menuId) {
    if (currentAudio) {
        currentAudio.audio.pause();
        currentAudio.audio.currentTime = 0;
    }
    const audio = new Audio(filename);
    currentAudio = { audio, menuId };

    // Set initial volume based on the main music slider value
    updateVolume();

    audio.addEventListener('timeupdate', updateAudioProgress);
    audio.addEventListener('timeupdate', updateTime);

    audio.addEventListener('ended', function() {
        if (isLoopTrackOn) {
            audio.currentTime = 0;
            audio.play();
        } else if (currentQueue.length === 0) {
            if (isLoopPlaylistOn) {
                currentQueue = [...originalQueue];
                playNextInQueue();
            } else {
                originalQueue = [];
                currentAudio = null;
                document.getElementById('audioProgress').style.width = '0';
                document.getElementById('currentSound').innerText = 'None';
                document.getElementById('timeDisplay').innerText = "0:00";
                isSongPlaying = false;
            }
        } else {
            playNextInQueue();
        }
    });

    audio.play();
    isSongPlaying = true;
    isPaused = false;
    updatePlayPauseButton();
    document.getElementById('currentSound').innerText = soundName;
}

function playNextInQueue() {
    if (currentQueue.length > 0) {
        const nextTrack = currentQueue.shift();
        playSound(nextTrack.filename, nextTrack.soundName, nextTrack.menuId);
    }
}

function updateAudioProgress() {
    const progressBar = document.getElementById('audioProgress');
    const percentage = (currentAudio.audio.currentTime / currentAudio.audio.duration) * 100;
    progressBar.style.width = `${percentage}%`;
}

function updateTime() {
    const timeDisplay = document.getElementById('timeDisplay');
    const currentTime = Math.round(currentAudio.audio.currentTime);
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

// Scrubbing functionality
document.getElementById('audioProgressBar').addEventListener('click', function(event) {
    if (!isSongPlaying) {
        return;
    }
    const x = event.pageX - this.offsetLeft;
    const clickedValue = x * currentAudio.audio.duration / this.offsetWidth;
    currentAudio.audio.currentTime = clickedValue;
});

// Dragging state for progress bar
let isDragging = false;
document.getElementById('audioProgressBar').addEventListener('mousedown', function(event) {
    if (!isSongPlaying) {
        return;
    }
    event.preventDefault();
    isDragging = true;
    updateProgressBar(event);
});

document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        event.preventDefault();
        updateProgressBar(event);
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});

function updateProgressBar(event) {
    if (currentAudio === null) {
        return;
    }

    const x = event.pageX - document.getElementById('audioProgressBar').offsetLeft;
    const clickedValue = x * currentAudio.audio.duration / document.getElementById('audioProgressBar').offsetWidth;
    const percentage = (clickedValue / currentAudio.audio.duration) * 100;
    currentAudio.audio.currentTime = clickedValue;
    document.getElementById('audioProgress').style.width = `${percentage}%`;
}

function randomizeArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function populateQueue(classType, submenuId, currentFilename) {
  currentQueue = [];
  originalQueue = [];

  if (submenuId === 'menu14') {
      // Do not autoplay for menu14, just add the selected sound
      return;
  }

  let sourceMenuId = submenuId;

  if (submenuId === 'menu3') {
      // For menu3, populate from menu2 instead
      sourceMenuId = 'menu2';
  }

  if (classType === 'sound-button' || classType === 'playlist-button') {
      const menu = document.getElementById(sourceMenuId);
      const buttons = menu.querySelectorAll(`.${classType}`);
      const buttonArray = Array.from(buttons);

      // Filter out the initial song
      const filteredButtons = buttonArray.filter(button => button.getAttribute('data-filename') !== currentFilename);

      // Shuffle the remaining songs
      for (let i = filteredButtons.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [filteredButtons[i], filteredButtons[j]] = [filteredButtons[j], filteredButtons[i]];
      }

      // Populate the queue with the shuffled list (excluding the initial song)
      filteredButtons.forEach(button => {
          const filename = button.getAttribute('data-filename');
          const soundName = button.getAttribute('data-soundname');
          currentQueue.push({ filename, soundName, menuId: sourceMenuId });
      });

      // Populate the original queue with the initial song followed by the shuffled list
      originalQueue = [{ filename: currentFilename, soundName: document.querySelector(`[data-filename='${currentFilename}']`).getAttribute('data-soundname'), menuId: submenuId }, ...currentQueue];
  }
}



document.addEventListener('DOMContentLoaded', function() {
    const subMenus = document.querySelectorAll(".sub-menu");
    subMenus.forEach((menu) => {
        menu.addEventListener("click", function(event) {
            event.stopPropagation();
        });
    });

    document.getElementById("nowPlaying").addEventListener("click", function(event) {
        event.stopPropagation();
    });

    document.addEventListener("click", function(event) {
        closeAllMenus();
    });

    document.getElementById('mainMenu').style.display = 'grid';

    const soundButtons = document.querySelectorAll('.sound-button');
    soundButtons.forEach((button) => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const submenuId = this.closest('.sub-menu').id;
            const currentFilename = this.getAttribute('data-filename');
            playSound(currentFilename, this.getAttribute('data-soundname'), submenuId);
            populateQueue('sound-button', submenuId, currentFilename);
        });
    });
});

function closeAllMenus() {
    const subMenus = document.querySelectorAll(".sub-menu.final");
    subMenus.forEach((menu) => {
        menu.classList.remove('final');
        setTimeout(function() {
            menu.style.display = 'none';
        }, 1000);
    });
}

function openMenu(menuId) {
    closeAllMenus();
    const menu = document.getElementById(menuId);
    menu.style.display = 'grid';
    setTimeout(function() {
        menu.classList.add('final');
    }, 100);
    event.stopPropagation();
}

function openVolumeMixer() {
    closeAllMenus();
    const menu = document.getElementById('volumeMixer');
    menu.style.display = 'grid';
    setTimeout(function() {
        menu.classList.add('final');
    }, 100);
    event.stopPropagation();
}

// Mixer button functionalities

function restartTrack() {
    if (currentAudio) {
        currentAudio.audio.currentTime = 0;
        currentAudio.audio.play();
    }
}

function playPauseTrack() {
    if (!currentAudio) return;

    if (isPaused) {
        currentAudio.audio.play();
        isPaused = false;
    } else {
        currentAudio.audio.pause();
        isPaused = true;
    }
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    const button = document.querySelector('.mixer-button[onclick="playPauseTrack()"]');
    if (isPaused) {
        button.style.backgroundColor = '#7a6bff'; // Purple
    } else {
        button.style.backgroundColor = '#1F1F1F'; // Default color
    }
}

function skipTrack() {
    if (isLoopTrackOn) {
        restartTrack();
    } else if (isLoopPlaylistOn && currentQueue.length === 0) {
        currentQueue = [...originalQueue];
        playNextInQueue();
    } else if (currentQueue.length > 0) {
        playNextInQueue();
    } else {
        stopAllSound();
    }
}

function loopPlaylist() {
    isLoopPlaylistOn = !isLoopPlaylistOn;
    isLoopTrackOn = false; // Turn off track loop if playlist loop is on
    updateLoopButtons();
}

function loopTrack() {
    isLoopTrackOn = !isLoopTrackOn;
    isLoopPlaylistOn = false; // Turn off playlist loop if track loop is on
    updateLoopButtons();
}

function clearQueue() {
  if (currentAudio) {
      // Clear the queue
      currentQueue = [];
      // Update originalQueue to only contain the current song
      originalQueue = [{
          filename: currentAudio.audio.src.split('/').pop(), // Extract filename from the audio source
          soundName: document.getElementById('currentSound').innerText,
          menuId: currentAudio.menuId
      }];
  }
}

function updateLoopButtons() {
    const loopPlaylistButton = document.querySelector('.mixer-button[onclick="loopPlaylist()"]');
    const loopTrackButton = document.querySelector('.mixer-button[onclick="loopTrack()"]');

    loopPlaylistButton.style.backgroundColor = isLoopPlaylistOn ? '#7a6bff' : '#1F1F1F'; // Purple or default
    loopTrackButton.style.backgroundColor = isLoopTrackOn ? '#7a6bff' : '#1F1F1F'; // Purple or default
}

// Function to handle button press (turn purple on mousedown and revert on mouseup)
function addButtonPressEffect(button) {
  button.addEventListener('mousedown', function() {
      button.style.backgroundColor = '#7a6bff'; // Purple color when pressed
  });

  button.addEventListener('mouseup', function() {
      button.style.backgroundColor = '#1F1F1F'; // Revert to default color when released
  });

  button.addEventListener('mouseleave', function() {
      button.style.backgroundColor = '#1F1F1F'; // Revert to default color when mouse leaves button
  });
}

// Apply the effect to all mixer buttons except Play/Pause, Loop Playlist, and Loop Song
document.addEventListener('DOMContentLoaded', function() {
  const mixerButtons = document.querySelectorAll('.mixer-button');
  mixerButtons.forEach(button => {
      const action = button.getAttribute('onclick');
      if (action !== 'playPauseTrack()' && action !== 'loopPlaylist()' && action !== 'loopTrack()') {
          addButtonPressEffect(button);
      }
  });
});