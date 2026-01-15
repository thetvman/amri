# Jellyfin Setup Guide

This guide will help you add Jellyfin to your existing Sonarr/Radarr/NZBGet Docker setup.

## Option 1: Use the Unified Docker Compose File (Recommended)

If you want all services in one file, use the provided `docker-compose.yml` that includes everything.

### Steps:

1. **Backup your current setup** (if you have existing containers):
   ```bash
   # List your current containers
   docker ps -a
   
   # Note down your current volume paths and ports
   ```

2. **Stop existing containers** (if running separately):
   ```bash
   docker stop sonarr radarr nzbget
   ```

3. **Create Jellyfin directories**:
   ```bash
   sudo mkdir -p /mnt/raid/media/jellyfin/{config,cache}
   sudo chown -R 1000:1000 /mnt/raid/media/jellyfin
   sudo chmod -R 775 /mnt/raid/media/jellyfin
   ```

4. **Edit the docker-compose.yml**:
   ```bash
   cd /root/amri
   nano docker-compose.yml
   ```
   
   Replace `YOUR_SERVER_IP` with your actual server IP (e.g., `216.106.177.106`)
   Update timezone if needed (currently `America/New_York`)

5. **Start all services**:
   ```bash
   docker compose up -d
   ```

6. **Verify all containers are running**:
   ```bash
   docker ps
   ```
   
   You should see: `sonarr`, `radarr`, `nzbget`, and `jellyfin` all running.

---

## Option 2: Add Jellyfin to Existing Setup

If you prefer to keep your existing setup and just add Jellyfin:

### Steps:

1. **Create Jellyfin directories**:
   ```bash
   sudo mkdir -p /mnt/raid/media/jellyfin/{config,cache}
   sudo chown -R 1000:1000 /mnt/raid/media/jellyfin
   sudo chmod -R 775 /mnt/raid/media/jellyfin
   ```

2. **Create a separate Jellyfin compose file** or run it directly:
   ```bash
   docker run -d \
     --name jellyfin \
     --restart unless-stopped \
     -e JELLYFIN_PublishedServerUrl=http://YOUR_SERVER_IP:8096 \
     -e TZ=America/New_York \
     -v /mnt/raid/media/jellyfin/config:/config \
     -v /mnt/raid/media/jellyfin/cache:/cache \
     -v /mnt/raid/media/library/movies:/media/movies:ro \
     -v /mnt/raid/media/library/tv:/media/tv:ro \
     -p 8096:8096 \
     -p 8920:8920 \
     jellyfin/jellyfin:latest
   ```
   
   Replace `YOUR_SERVER_IP` with your actual server IP.

---

## Initial Jellyfin Configuration

1. **Access Jellyfin**:
   - Open `http://YOUR_SERVER_IP:8096` in your browser
   - You'll see the setup wizard

2. **Complete Setup Wizard**:
   - **Language**: Choose your language
   - **Username**: Create an admin username
   - **Password**: Set a secure password
   - **Libraries**: Skip for now (we'll add them manually)

3. **Add Media Libraries**:
   - Go to **Dashboard** (⚙️ icon) → **Libraries** → **Add Media Library**
   - **Movies Library**:
     - Content Type: `Movies`
     - Display Name: `Movies`
     - Folders: Click **+** → Navigate to `/media/movies` → **OK**
     - Click **OK** to save
   - **TV Shows Library**:
     - Content Type: `Shows`
     - Display Name: `TV Shows`
     - Folders: Click **+** → Navigate to `/media/tv` → **OK**
     - Click **OK** to save

4. **Configure Transcoding** (Optional but Recommended):
   - Go to **Dashboard** → **Playback**
   - **Transcoding**:
     - Enable hardware acceleration if you have a GPU
     - Set max concurrent transcodes (default: 2-4)
   - **Streaming**:
     - Enable "Allow video playback that requires transcoding"
     - Set quality profiles as needed

5. **Start Media Scan**:
   - Go to **Dashboard** → **Libraries**
   - Click the **⋯** menu on each library → **Scan All Libraries**
   - Jellyfin will scan and add metadata for all your media

---

## Accessing Your Services

After setup, you can access:

- **Jellyfin**: `http://YOUR_SERVER_IP:8096`
- **Sonarr**: `http://YOUR_SERVER_IP:8989`
- **Radarr**: `http://YOUR_SERVER_IP:7878`
- **NZBGet**: `http://YOUR_SERVER_IP:6789`
- **amriM**: `http://YOUR_SERVER_IP:3000`

---

## Troubleshooting

### Jellyfin can't see media files:
- Check permissions: `sudo chown -R 1000:1000 /mnt/raid/media/library`
- Verify volumes are mounted: `docker exec jellyfin ls -la /media/movies`

### Transcoding not working:
- Check if FFmpeg is available: `docker exec jellyfin ffmpeg -version`
- Enable hardware acceleration if you have a GPU (uncomment devices section in compose file)

### Port conflicts:
- If port 8096 is already in use, change it in the compose file:
  ```yaml
  ports:
    - "8097:8096"  # Use 8097 on host instead
  ```

### Container won't start:
- Check logs: `docker logs jellyfin`
- Verify directory permissions: `ls -la /mnt/raid/media/jellyfin`

---

## Next Steps

1. **Integrate with amriM** (optional):
   - You can use Jellyfin's API to stream content through amriM
   - Or keep them separate - amriM for browsing, Jellyfin for playback

2. **Configure Users**:
   - Go to **Dashboard** → **Users** → **Add User**
   - Create user accounts for family/friends
   - Set permissions and parental controls

3. **Install Mobile Apps**:
   - Jellyfin has official apps for iOS, Android, and other platforms
   - Download from app stores and connect to your server

---

## Notes

- Jellyfin uses the same media files as Sonarr/Radarr (read-only mounts)
- All metadata and config is stored in `/mnt/raid/media/jellyfin/config`
- Transcoding cache is stored in `/mnt/raid/media/jellyfin/cache`
- Jellyfin will automatically detect new media added by Sonarr/Radarr (if auto-scan is enabled)
