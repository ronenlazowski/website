document.addEventListener('DOMContentLoaded', function() {
    const discordStatus = document.getElementById('discord-status') || document.getElementById('discord-status-mini');
    
    const DISCORD_USER_ID = '445899149997768735';
    const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
    
    let discordData = {
        username: "Ronen L",
        avatar: "images/logo.svg",
        status: "offline",
        activity: null,
        spotify: null
    };
    
    let currentTrackId = null;
    let progressUpdateInterval = null;
    
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function updateDiscordStatus(element, data) {
        if (!element) return;
        
        const statusColors = {
            online: '#23a55a',
            idle: '#f0b232',
            dnd: '#f23f42',
            offline: '#80848e'
        };
        
        const statusTexts = {
            online: 'Online',
            idle: 'Away',
            dnd: 'Do Not Disturb',
            offline: 'Offline'
        };
        
        let activityContent = '';
        
        if (data.spotify && data.spotify.track_id) {
            let progressBar = '';
            if (data.spotify.timestamps) {
                const now = Date.now();
                const start = data.spotify.timestamps.start;
                const end = data.spotify.timestamps.end;
                
                if (start && end) {
                    const duration = end - start;
                    const elapsed = now - start;
                    const progress = Math.min(Math.max((elapsed / duration) * 100, 0), 100);
                    
                    const elapsedFormatted = formatTime(elapsed);
                    const durationFormatted = formatTime(duration);
                    
                    progressBar = `
                        <div class="spotify-progress">
                            <div class="spotify-timestamps">
                                <span class="spotify-time-elapsed">${elapsedFormatted}</span>
                                <span class="spotify-time-total">${durationFormatted}</span>
                            </div>
                            <div class="spotify-progress-bar">
                                <div class="spotify-progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    `;
                }
            }
            
            activityContent = `
                <div class="discord-activity spotify-activity">
                    <div class="activity-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        <span>Listening to Spotify</span>
                    </div>
                    <div class="spotify-content">
                        ${data.spotify.album_art_url ? `<img src="${data.spotify.album_art_url}" alt="Album Art" class="spotify-album-art" loading="lazy">` : ''}
                        <div class="spotify-details">
                            <div class="spotify-song">${data.spotify.song}</div>
                            <div class="spotify-artist">by ${data.spotify.artist}</div>
                            ${data.spotify.album ? `<div class="spotify-album">on ${data.spotify.album}</div>` : ''}
                            ${progressBar}
                        </div>
                    </div>
                </div>
            `;
        }

        else if (data.activity && data.activity.type !== 4) {
            activityContent = `
                <div class="discord-activity">
                    <div class="activity-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span>${data.activity.type === 0 ? 'Playing' : data.activity.type === 2 ? 'Listening to' : data.activity.type === 3 ? 'Watching' : 'Activity'}</span>
                    </div>
                    <div class="activity-content">
                        <div class="activity-details">
                            <div class="activity-name">${data.activity.name}</div>
                            ${data.activity.details ? `<div class="activity-detail">${data.activity.details}</div>` : ''}
                            ${data.activity.state ? `<div class="activity-state">${data.activity.state}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        const showToggle = activityContent.trim() !== '';
        
        const needsRebuild = !element.querySelector('.discord-status-header') || 
                            (showToggle && !element.querySelector('.discord-status-content')) ||
                            (!showToggle && element.querySelector('.discord-status-content'));
        
        if (needsRebuild) {
            element.innerHTML = `
                <div class="discord-status-header">
                    <div class="discord-status-avatar">
                        <img src="${data.avatar}" alt="${data.username}" loading="lazy">
                        <div class="discord-status-indicator" style="background-color: ${statusColors[data.status]}"></div>
                    </div>
                    <div class="discord-status-info">
                        <div class="discord-status-username">${data.username}</div>
                        <div class="discord-status-text" style="color: ${statusColors[data.status]}">${statusTexts[data.status]}</div>
                    </div>
                    ${showToggle ? '<button class="discord-status-toggle" title="Toggle Discord status"></button>' : ''}
                </div>
                ${showToggle ? `<div class="discord-status-content">${activityContent}</div>` : ''}
            `;
        } else {
            const avatarImg = element.querySelector('.discord-status-avatar img');
            const statusIndicator = element.querySelector('.discord-status-indicator');
            const username = element.querySelector('.discord-status-username');
            const statusText = element.querySelector('.discord-status-text');
            const contentDiv = element.querySelector('.discord-status-content');
            
            if (avatarImg && avatarImg.src !== data.avatar) {
                avatarImg.src = data.avatar;
                avatarImg.alt = data.username;
            }
            
            if (statusIndicator) {
                statusIndicator.style.backgroundColor = statusColors[data.status];
            }
            
            if (username) {
                username.textContent = data.username;
            }
            
            if (statusText) {
                statusText.textContent = statusTexts[data.status];
                statusText.style.color = statusColors[data.status];
            }
            
            if (contentDiv && showToggle) {
                const currentContent = contentDiv.innerHTML.trim();
                const newContent = activityContent.trim();
                
                if (currentContent !== newContent) {
                    if (data.spotify && data.spotify.track_id) {
                        const spotifyActivity = contentDiv.querySelector('.spotify-activity');
                        const spotifySong = contentDiv.querySelector('.spotify-song');
                        const spotifyArtist = contentDiv.querySelector('.spotify-artist');
                        
                        const isSameSong = spotifyActivity && 
                                         spotifySong && spotifySong.textContent === data.spotify.song &&
                                         spotifyArtist && spotifyArtist.textContent === `by ${data.spotify.artist}`;
                        
                        if (isSameSong) {
                            const progressContainer = contentDiv.querySelector('.spotify-progress');
                            if (progressContainer && data.spotify.timestamps) {
                                const now = Date.now();
                                const start = data.spotify.timestamps.start;
                                const end = data.spotify.timestamps.end;
                                
                                if (start && end) {
                                    const duration = end - start;
                                    const elapsed = now - start;
                                    const progress = Math.min(Math.max((elapsed / duration) * 100, 0), 100);
                                    
                                    const elapsedFormatted = formatTime(elapsed);
                                    const durationFormatted = formatTime(duration);
                                    
                                    const progressFill = progressContainer.querySelector('.spotify-progress-fill');
                                    const timeElapsed = progressContainer.querySelector('.spotify-time-elapsed');
                                    const timeTotal = progressContainer.querySelector('.spotify-time-total');
                                    
                                    if (progressFill) progressFill.style.width = `${progress}%`;
                                    if (timeElapsed) timeElapsed.textContent = elapsedFormatted;
                                    if (timeTotal) timeTotal.textContent = durationFormatted;
                                }
                            }
                        } else {
                            contentDiv.innerHTML = activityContent;
                        }
                    } else {
                        contentDiv.innerHTML = activityContent;
                    }
                }
            }
        }
        
        const toggleBtn = element.querySelector('.discord-status-toggle');
        if (toggleBtn) {
            const isCollapsed = localStorage.getItem('discord-status-collapsed') === 'true';
            
            if (isCollapsed) {
                element.classList.add('collapsed');
            }
            
            const existingToggleHandler = toggleBtn.getAttribute('data-handler-attached');
            if (!existingToggleHandler) {
                toggleBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    element.classList.toggle('collapsed');
                    const collapsed = element.classList.contains('collapsed');
                    localStorage.setItem('discord-status-collapsed', collapsed);
                });
                toggleBtn.setAttribute('data-handler-attached', 'true');
            }
            
            const existingClickHandler = element.getAttribute('data-click-handler-attached');
            if (!existingClickHandler) {
                element.addEventListener('click', function(e) {
                    if (element.classList.contains('collapsed') && !e.target.closest('.discord-status-toggle')) {
                        element.classList.remove('collapsed');
                        localStorage.setItem('discord-status-collapsed', 'false');
                    }
                });
                element.setAttribute('data-click-handler-attached', 'true');
            }
        } else {
            element.classList.remove('collapsed');
            element.classList.add('no-content');
            element.removeAttribute('data-click-handler-attached');
        }
        
        if (showToggle) {
            element.classList.remove('no-content');
        } else {
            element.classList.add('no-content');
        }
        
        element.style.display = 'block';
    }
    
    function updateSpotifyProgress() {
        if (!discordData.spotify || !discordData.spotify.timestamps || !discordStatus) return;
        
        const progressFill = discordStatus.querySelector('.spotify-progress-fill');
        const timeElapsed = discordStatus.querySelector('.spotify-time-elapsed');
        
        if (!progressFill || !timeElapsed) return;
        
        const now = Date.now();
        const start = discordData.spotify.timestamps.start;
        const end = discordData.spotify.timestamps.end;
        
        if (start && end) {
            const duration = end - start;
            const elapsed = now - start;
            const progress = Math.min(Math.max((elapsed / duration) * 100, 0), 100);
            
            const elapsedFormatted = formatTime(elapsed);
            
            progressFill.style.width = `${progress}%`;
            timeElapsed.textContent = elapsedFormatted;
        }
    }
    
    async function fetchDiscordStatus() {
        try {
            const response = await fetch(LANYARD_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.data) {
                const presenceData = data.data;
                
                if (!presenceData.discord_user) {
                    throw new Error('Invalid user data received');
                }
                
                discordData.username = presenceData.discord_user.display_name || presenceData.discord_user.username || 'Unknown User';
                discordData.status = presenceData.discord_status || 'offline';
                
                if (presenceData.discord_user && presenceData.discord_user.avatar) {
                    const userId = presenceData.discord_user.id;
                    const avatarHash = presenceData.discord_user.avatar;
                    const isAnimated = avatarHash.startsWith('a_');
                    const extension = isAnimated ? 'gif' : 'png';
                    discordData.avatar = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=128`;
                } else if (presenceData.discord_user && presenceData.discord_user.discriminator) {
                    const defaultAvatarIndex = parseInt(presenceData.discord_user.discriminator) % 5;
                    discordData.avatar = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
                }
                
                if (presenceData.spotify) {
                    const newTrackId = presenceData.spotify.track_id;
                    
                    if (currentTrackId && currentTrackId !== newTrackId) {
                        console.log('Song changed detected!');
                        currentTrackId = newTrackId;
                    } else if (!currentTrackId) {
                        currentTrackId = newTrackId;
                    }
                    
                    discordData.spotify = {
                        track_id: presenceData.spotify.track_id || null,
                        song: presenceData.spotify.song || 'Unknown Song',
                        artist: presenceData.spotify.artist || 'Unknown Artist',
                        album: presenceData.spotify.album || null,
                        album_art_url: presenceData.spotify.album_art_url || null,
                        timestamps: presenceData.spotify.timestamps || null
                    };
                    
                    if (!progressUpdateInterval && presenceData.spotify.timestamps) {
                        progressUpdateInterval = setInterval(updateSpotifyProgress, 1000);
                    }
                } else {
                    discordData.spotify = null;
                    currentTrackId = null;
                    
                    if (progressUpdateInterval) {
                        clearInterval(progressUpdateInterval);
                        progressUpdateInterval = null;
                    }
                }
                
                if (presenceData.activities && presenceData.activities.length > 0) {
                    const activity = presenceData.activities.find(act => act.name !== 'Spotify' && act.type !== 4);
                    if (activity) {
                        discordData.activity = {
                            name: activity.name,
                            type: activity.type,
                            details: activity.details,
                            state: activity.state,
                            application_id: activity.application_id,
                            timestamps: activity.timestamps
                        };
                    } else {
                        discordData.activity = null;
                    }
                } else {
                    discordData.activity = null;
                }
                
                updateStatusDisplay();
                
                console.log('Discord status updated successfully');
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Failed to fetch Discord status:', error);
            updateStatusDisplay();
        }
    }
    
    function updateStatusDisplay() {
        if (discordData.status === 'online' || discordData.status === 'idle' || discordData.status === 'dnd') {
            if (discordStatus) updateDiscordStatus(discordStatus, discordData);
        } else {
            if (discordStatus) discordStatus.style.display = 'none';
        }
    }
    
    fetchDiscordStatus();
    
    setInterval(fetchDiscordStatus, 5000);
});
