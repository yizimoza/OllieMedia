# OllieMedia

A self-hosted LAN media browser. Browse your local library of movies, TV, anime, music, and podcasts from any device on your home network. Runs as a single Docker container on a Synology NAS (or any Linux host).

![OllieMedia screenshot](screenshot.png)

## Features

- Dark, cinematic card-based UI
- Auto-discovers categories from your media folder structure
- Reads local poster art (`poster.jpg`, `backdrop.jpg`, `cover.jpg`) for card thumbnails
- Reads Kodi-format `.nfo` files for title, year, rating, genres, and synopsis
- **Play** button — opens video files directly in VLC via M3U playlist
- **Download** button — saves the file to your device
- Inline HTML5 audio player for music and podcasts
- Live search within each category
- Rescans library without a container restart

## Requirements

- Docker + Docker Compose on the host
- Media mounted at `/volume1/media/` (configurable via `MEDIA_ROOT` env var)
- VLC installed on client devices for the Play button

## Quick Start

```bash
git clone https://github.com/yizimoza/OllieMedia.git
cd OllieMedia
docker-compose up --build -d
```

Then open `http://YOUR-HOST-IP:3000` in a browser.

## Media Folder Structure

```
/volume1/media/
  Movies/
    Title (Year)/
      Title (Year).mkv
      poster.jpg        ← card art
      backdrop.jpg      ← detail background
      movie.nfo         ← Kodi XML metadata
  TV/
    Show Name/
      poster.jpg
      tvshow.nfo
      Season 01/
        Show - S01E01 - Title.mkv
  Anime/             ← same structure as TV
  Music/
    Artist/
      Album (Year)/
        cover.jpg
        01 - Track.mp3
  Podcasts/
    Podcast Name/
      cover.jpg
      2024-01-15 - Episode.mp3
```

See the **Setup Guide** page in the app sidebar for the full NFO format reference.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `MEDIA_ROOT` | `/volume1/media` | Path to your media library |
| `PORT` | `3000` | Port the server listens on |

## Rescan Library

After adding new media, trigger a fresh scan without restarting:

```bash
curl -X POST http://YOUR-HOST-IP:3000/api/rescan
```

## First-time Play button setup

The Play button downloads a tiny `.m3u` playlist file that points VLC at the video stream. On first use, your browser will ask what to open `.m3u` files with — select VLC and check "always use this app" to make future clicks seamless.
