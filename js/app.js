// Biến toàn cục
let currentTrackIndex = 0;
let audio = new Audio();
let isPlaying = false;
let progressInterval;
let recentTracks = [];
let touchStartX = 0;
let touchStartY = 0;

// Khởi tạo trình phát nhạc
function initPlayer() {
  // Render giao diện
  renderRecentTracks();
  renderPopularTracks();
  renderPopularArtists();
  renderPopularAlbums();
  updatePlayerBar();
  
  // Gắn sự kiện
  document.getElementById('library-button').addEventListener('click', openMusicList);
  document.getElementById('close-modal').addEventListener('click', closeMusicList);
  document.getElementById('progress-bar').addEventListener('click', seek);
  
  // Tự động phát bài đầu tiên sau khi tải
  setTimeout(() => {
    playTrack(0);
  }, 500);
  
  // Xử lý sự kiện kết thúc bài hát
  audio.addEventListener('ended', playNext);
  
  // Xử lý safe area cho iPhone
  handleSafeArea();
}

// Xử lý safe area cho iPhone
function handleSafeArea() {
  const safeAreaInsetBottom = getSafeAreaInsetBottom();
  document.documentElement.style.setProperty('--safe-area-inset-bottom', `${safeAreaInsetBottom}px`);
}

// Lấy giá trị safe area bottom
function getSafeAreaInsetBottom() {
  if (CSS.supports('padding-bottom: env(safe-area-inset-bottom)')) {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0;
  }
  return 0;
}

// Mở danh sách nhạc
function openMusicList() {
  document.getElementById('music-list-modal').classList.add('active');
  renderMusicList();
}

// Đóng danh sách nhạc
function closeMusicList() {
  document.getElementById('music-list-modal').classList.remove('active');
}

// Render danh sách nhạc trong modal
function renderMusicList() {
  const musicList = document.getElementById('music-list');
  musicList.innerHTML = '';
  
  // Sắp xếp theo thứ tự bài hát đang phát lên đầu
  const sortedTracks = [...tracks];
  if (currentTrackIndex > 0) {
    const currentTrack = sortedTracks.splice(currentTrackIndex, 1)[0];
    sortedTracks.unshift(currentTrack);
  }
  
  sortedTracks.forEach((track, index) => {
    const isCurrent = index === 0 && currentTrackIndex !== 0;
    const musicItem = document.createElement('div');
    musicItem.className = `music-item ${isCurrent ? 'active' : ''}`;
    musicItem.innerHTML = `
      <img class="music-item-img" src="${track.artwork}" alt="${track.name}">
      <div class="music-item-info">
        <div class="music-item-title">${track.name}</div>
        <div class="music-item-artist">${track.artist}</div>
      </div>
      ${isCurrent ? `<i class="fas fa-play" style="color: var(--highlight);"></i>` : ''}
    `;
    musicItem.addEventListener('click', () => {
      currentTrackIndex = tracks.findIndex(t => t.path === track.path);
      playTrack(currentTrackIndex);
      closeMusicList();
    });
    musicList.appendChild(musicItem);
  });
}

// Render bài hát nghe gần đây
function renderRecentTracks() {
  const recentContainer = document.getElementById('recent-tracks');
  recentContainer.innerHTML = '';
  
  // Lấy 4 bài hát nghe gần đây (giả lập)
  const recent = tracks.slice(0, 4);
  
  recent.forEach((track, index) => {
    const recentCard = document.createElement('div');
    recentCard.className = 'recent-card';
    recentCard.innerHTML = `
      <img class="recent-img" src="${track.artwork}" alt="${track.name}">
      <div>
        <p class="card-title">${track.name}</p>
        <p class="card-subtitle">${track.artist}</p>
      </div>
    `;
    recentCard.addEventListener('click', () => {
      currentTrackIndex = index;
      playTrack(currentTrackIndex);
    });
    recentContainer.appendChild(recentCard);
  });
}

// Render bài hát phổ biến
function renderPopularTracks() {
  const popularContainer = document.getElementById('popular-tracks');
  popularContainer.innerHTML = '';
  
  // Lấy 8 bài hát phổ biến (giả lập)
  const popular = tracks.slice(0, 8);
  
  popular.forEach((track, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-container">
        <img class="card-img" src="${track.artwork}" alt="${track.name}">
        <div class="play-icon">
          <i class="fas fa-play"></i>
        </div>
      </div>
      <p class="card-title">${track.name}</p>
      <p class="card-subtitle">${track.artist}</p>
    `;
    card.addEventListener('click', () => {
      currentTrackIndex = index;
      playTrack(currentTrackIndex);
    });
    popularContainer.appendChild(card);
  });
}

// Render nghệ sĩ phổ biến
function renderPopularArtists() {
  const artistsContainer = document.getElementById('popular-artists');
  artistsContainer.innerHTML = '';
  
  // Lấy 4 nghệ sĩ phổ biến (giả lập)
  const artists = [
    { name: "Sơn Tùng M-TP", image: "https://storage.googleapis.com/a1aa/image/af5c7164-b18f-410a-d652-81e02ad89803.jpg" },
    { name: "SOOBIN", image: "https://storage.googleapis.com/a1aa/image/4145a2aa-1ef0-44db-99e7-ed9e37a81937.jpg" },
    { name: "HIEUTHUHAI", image: "https://storage.googleapis.com/a1aa/image/73acdf8f-3734-452b-f322-cb361c736fba.jpg" },
    { name: "Đức Phúc", image: "https://i.scdn.co/image/ab6761610000e5eb5da361915b1fa48895d4f23f" }
  ];
  
  artists.forEach(artist => {
    const artistCard = document.createElement('div');
    artistCard.className = 'artist-card';
    artistCard.innerHTML = `
      <div class="artist-img-container">
        <img class="artist-img" src="${artist.image}" alt="${artist.name}">
      </div>
      <p class="card-title">${artist.name}</p>
      <p class="card-subtitle">Nghệ sĩ</p>
    `;
    artistsContainer.appendChild(artistCard);
  });
}

// Render album phổ biến
function renderPopularAlbums() {
  const albumsContainer = document.getElementById('popular-albums');
  albumsContainer.innerHTML = '';
  
  // Lấy 4 album phổ biến (giả lập)
  const albums = tracks.slice(4, 8);
  
  albums.forEach((album, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-container">
        <img class="card-img" src="${album.artwork}" alt="${album.name}">
        <div class="play-icon">
          <i class="fas fa-play"></i>
        </div>
      </div>
      <p class="card-title">${album.name}</p>
      <p class="card-subtitle">${album.artist}</p>
    `;
    card.addEventListener('click', () => {
      currentTrackIndex = index + 4;
      playTrack(currentTrackIndex);
    });
    albumsContainer.appendChild(card);
  });
}

// Cập nhật player bar
function updatePlayerBar() {
  const track = tracks[currentTrackIndex];
  const playerBar = document.getElementById('player-bar');
  playerBar.innerHTML = `
    <img class="player-img" src="${track.artwork}" alt="${track.name}">
    <div class="player-info">
      <p class="player-title">${track.name}</p>
      <p class="player-artist">${track.artist}</p>
    </div>
    <div class="player-controls">
      <button aria-label="Like"><i class="fas fa-heart" style="color: var(--highlight);"></i></button>
      <button aria-label="Previous"><i class="fas fa-step-backward"></i></button>
      <button class="play-button" aria-label="Play"><i class="fas fa-pause"></i></button>
      <button aria-label="Next"><i class="fas fa-step-forward"></i></button>
    </div>
  `;

  // Gắn sự kiện cho các nút trong player bar
  playerBar.querySelector('.play-button').addEventListener('click', togglePlay);
  playerBar.querySelector('button[aria-label="Previous"]').addEventListener('click', playPrevious);
  playerBar.querySelector('button[aria-label="Next"]').addEventListener('click', playNext);
  playerBar.querySelector('button[aria-label="Like"]').addEventListener('click', toggleLike);
}

// Phát bài hát
function playTrack(index) {
  const track = tracks[index];
  
  // Thêm lớp để hiển thị thanh tiến trình
  document.body.classList.add('player-playing');
  
  // Tạo hiệu ứng chuyển tiếp mượt mà
  document.body.classList.add('track-changing');
  setTimeout(() => {
    document.body.classList.remove('track-changing');
  }, 300);
  
  audio.src = track.path;
  audio.play()
    .then(() => {
      isPlaying = true;
      currentTrackIndex = index;
      updatePlayerBar();
      updatePlayButton();
      startProgress();
      addToRecent(track);
    })
    .catch(error => {
      console.log('Play error:', error);
      // Fallback: chuyển bài tiếp theo nếu không phát được
      setTimeout(playNext, 500);
    });
}

// Thêm vào danh sách nghe gần đây
function addToRecent(track) {
  // Chỉ thêm nếu chưa có trong danh sách
  if (!recentTracks.some(t => t.name === track.name)) {
    recentTracks.unshift(track);
    if (recentTracks.length > 4) recentTracks.pop();
    renderRecentTracks();
  }
}

// Chuyển đổi play/pause
function togglePlay() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    clearInterval(progressInterval);
  } else {
    audio.play();
    isPlaying = true;
    startProgress();
  }
  updatePlayButton();
}

// Cập nhật nút play/pause
function updatePlayButton() {
  const playButton = document.querySelector('.play-button i');
  if (playButton) {
    playButton.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  }
}

// Chuyển bài tiếp theo
function playNext() {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  playTrack(currentTrackIndex);
}

// Chuyển bài trước
function playPrevious() {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  playTrack(currentTrackIndex);
}

// Thích bài hát
function toggleLike() {
  const likeButton = document.querySelector('.player-controls button[aria-label="Like"] i');
  if (likeButton.classList.contains('fas')) {
    likeButton.classList.remove('fas');
    likeButton.classList.add('far');
  } else {
    likeButton.classList.remove('far');
    likeButton.classList.add('fas');
  }
}

// Cập nhật thanh tiến trình
function startProgress() {
  clearInterval(progressInterval);
  
  // Hàm cập nhật tiến trình
  const updateProgress = () => {
    if (audio.readyState > 0 && !isNaN(audio.duration)) {
      const progress = (audio.currentTime / audio.duration) * 100;
      document.getElementById('progress').style.width = `${progress}%`;
    }
  };
  
  // Cập nhật ngay lập tức
  updateProgress();
  
  // Cập nhật định kỳ
  progressInterval = setInterval(updateProgress, 500);
  
  // Cập nhật khi bài hát thay đổi thời gian
  audio.addEventListener('timeupdate', updateProgress);
}

// Nhảy đến vị trí trên thanh tiến trình
function seek(e) {
  const progressBar = document.getElementById('progress-bar');
  const rect = progressBar.getBoundingClientRect();
  
  // Tính toán vị trí click chính xác
  let offsetX;
  if (e.type === 'touchstart' || e.type === 'touchmove') {
    offsetX = e.touches[0].clientX - rect.left;
  } else {
    offsetX = e.clientX - rect.left;
  }
  
  const progress = Math.min(Math.max(offsetX / rect.width, 0), 1);
  
  if (audio.duration && !isNaN(audio.duration)) {
    audio.currentTime = progress * audio.duration;
    document.getElementById('progress').style.width = `${progress * 100}%`;
  }
}

// Xử lý sự kiện touch cho thanh tiến trình
function handleProgressTouch(e) {
  e.preventDefault();
  seek(e);
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
  initPlayer();
  
  // Thêm sự kiện touch cho thanh tiến trình trên mobile
  const progressBar = document.getElementById('progress-bar');
  progressBar.addEventListener('touchstart', handleProgressTouch, false);
  progressBar.addEventListener('touchmove', handleProgressTouch, false);
});