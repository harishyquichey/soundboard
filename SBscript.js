let isSongPlaying = false;


function stopAllSound() {
// Reset the "Now Playing" text
document.getElementById('currentSound').innerText = "None";
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    isSongPlaying = false;
  }
}

let currentAudio = null;

// Modify existing playSound function
function playSound(filename, soundName) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(filename);

  // Existing event listeners for time update
  currentAudio.addEventListener('timeupdate', updateAudioProgress);
  currentAudio.addEventListener('timeupdate', updateTime);
  
  // Combine existing logic with new functionality
  currentAudio.addEventListener('ended', function() {
    if (currentQueue.length === 0) {
      document.getElementById('audioProgress').style.width = '0';
      document.getElementById('currentSound').innerText = 'None';
      document.getElementById('timeDisplay').innerText = "0:00";
      isSongPlaying = false;
    } else {
      playNextInQueue();
    }
  });

  currentAudio.play();
  isSongPlaying = true;
  document.getElementById('currentSound').innerText = soundName;
}

// Function to play the next song in the queue
function playNextInQueue() {
  if (currentQueue.length > 0) {
    const nextSong = currentQueue.shift();
    playSound(nextSong.filename, nextSong.soundName);
  }
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

document.addEventListener("DOMContentLoaded", function() {
  // Existing code to stop propagation for sub-menu clicks
  const subMenus = document.querySelectorAll(".sub-menu");
  subMenus.forEach((menu) => {
    menu.addEventListener("click", function(event) {
      event.stopPropagation();
    });
  });

  // Existing code to handle other DOMContentLoaded tasks
  document.getElementById("nowPlaying").addEventListener("click", function(event) {
    event.stopPropagation();
  });

  document.addEventListener("click", function(event) {
    closeAllMenus();
  });

  document.getElementById('mainMenu').style.display = 'grid';

  // Add event listeners to buttons of class 'sound-button'
  const soundButtons = document.querySelectorAll('.sound-button');

  soundButtons.forEach((button) => {
    button.addEventListener('click', function(event) {
      event.stopPropagation();  // Prevent the click from closing the menu
      const submenuId = this.closest('.sub-menu').id;
      const currentFilename = this.getAttribute('data-filename');
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


function updateAudioProgress() {
  const progressBar = document.getElementById('audioProgress');
  const percentage = (currentAudio.currentTime / currentAudio.duration) * 100;
  progressBar.style.width = `${percentage}%`;
}

// Initialize audio progress bar and time
if (currentAudio) {
  currentAudio.addEventListener('timeupdate', updateAudioProgress);
  currentAudio.addEventListener('timeupdate', updateTime);
}

function updateAudioProgress() {
  const progressBar = document.getElementById('audioProgress');
  const percentage = (currentAudio.currentTime / currentAudio.duration) * 100;
  progressBar.style.width = `${percentage}%`;
}

function updateTime() {
  const timeDisplay = document.getElementById('timeDisplay');
  const currentTime = Math.round(currentAudio.currentTime);  // Round to the nearest second
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}


// Add scrubbing functionality
document.getElementById('audioProgressBar').addEventListener('click', function(event) {
  if (!isSongPlaying) {
    return; // Do nothing if there's no current song playing
  }
  const x = event.pageX - this.offsetLeft;
  const clickedValue = x * currentAudio.duration / this.offsetWidth;
  currentAudio.currentTime = clickedValue;
});

// Add variables to track dragging state
let isDragging = false;  // Flag to check if dragging is active

// Add mousedown event to set isDragging flag to true
document.getElementById('audioProgressBar').addEventListener('mousedown', function(event) {
  if (!isSongPlaying) {
    return; // Do nothing if there's no current audio
  }
  event.preventDefault(); // Prevent text and other elements from being highlighted
  isDragging = true;
  updateProgressBar(event);
});

// Add mousemove event to update the progress bar if dragging is active
document.addEventListener('mousemove', function(event) {
  if (isDragging) {
    event.preventDefault(); // Prevent text and other elements from being highlighted
    updateProgressBar(event);
  }
});

// Add mouseup event to set isDragging flag to false
document.addEventListener('mouseup', function() {
  isDragging = false;
});

// Function to update the progress bar and audio currentTime
function updateProgressBar(event) {
  if (currentAudio === null) {
    return; // Do nothing if there's no current audio
  }
  
  const x = event.pageX - document.getElementById('audioProgressBar').offsetLeft;
  const clickedValue = x * currentAudio.duration / document.getElementById('audioProgressBar').offsetWidth;
  const percentage = (clickedValue / currentAudio.duration) * 100;
  currentAudio.currentTime = clickedValue;
  document.getElementById('audioProgress').style.width = `${percentage}%`;
}

// Function to randomize an array
function randomizeArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Initialize an empty array to hold the current queue of songs
let currentQueue = [];

// Function to populate the queue based on the submenu and class of clicked button
function populateQueue(classType, submenuId, currentFilename) {
  // Initialize or clear the current queue
  currentQueue = [];

  if (classType === 'sound-button' || classType === 'playlist-button') {
    const menu = document.getElementById(submenuId);
    const buttons = menu.querySelectorAll(`.${classType}`);
    const buttonArray = Array.from(buttons);

    // Shuffle the array
    for (let i = buttonArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [buttonArray[i], buttonArray[j]] = [buttonArray[j], buttonArray[i]];
    }

    // Populate the queue
    buttonArray.forEach(button => {
      const filename = button.getAttribute('data-filename');
      const soundName = button.getAttribute('data-soundname');
      if (filename !== currentFilename) {  // Exclude the first song
        currentQueue.push({ filename, soundName });
      }
    });
  }
}

// Add event listeners to buttons
document.addEventListener('click', function(event) {
  const target = event.target;
  const classType = target.className;
  const submenuId = target.closest('.sub-menu').id;

  // Populate the queue and start playing
  populateQueue(classType, submenuId);
});

function openVolumeMixer() {
  closeAllMenus();  // Close all other menus
  const menu = document.getElementById('volumeMixer');
  menu.style.display = 'grid';
  setTimeout(function() {
    menu.classList.add('final');
  }, 100);
  event.stopPropagation();
}