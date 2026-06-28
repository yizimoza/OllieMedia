export default function HelpPage() {
  return (
    <div className="help-page">
      <div className="help-brand">
        <img src="/ollie.jpg" className="help-beagle" alt="OllieMedia" />
        <div>
          <h1 className="help-title">OllieMedia</h1>
          <p className="help-subtitle">Setup Guide</p>
        </div>
      </div>
      <p className="help-intro">
        OllieMedia reads directly from your <code>/volume1/media/</code> folder.
        Follow the conventions below to get cover art and metadata displaying correctly.
      </p>

      <section className="help-section">
        <h2>Folder Structure</h2>
        <pre className="help-code">{`/volume1/media/
  Movies/
    The Dark Knight (2008)/
      The Dark Knight (2008).mkv
      poster.jpg          ← portrait card art  (2:3 ratio)
      backdrop.jpg        ← widescreen hero    (16:9 ratio)
      movie.nfo           ← Kodi XML metadata

  TV/
    Breaking Bad/
      poster.jpg
      backdrop.jpg
      tvshow.nfo
      Season 01/
        Breaking Bad - S01E01 - Pilot.mkv

  Anime/
    (same structure as TV)

  Music/
    Artist Name/
      Album Title (2020)/
        cover.jpg         ← square album art
        01 - Track Name.mp3

  Podcasts/
    Podcast Name/
      cover.jpg
      2024-01-15 - Episode Title.mp3`}
        </pre>
      </section>

      <section className="help-section">
        <h2>Artwork Filenames</h2>
        <table className="help-table">
          <thead>
            <tr><th>File</th><th>Used for</th><th>Ideal size</th></tr>
          </thead>
          <tbody>
            <tr><td><code>poster.jpg</code></td><td>Card thumbnail (Movies, TV, Anime)</td><td>680 × 1000 px</td></tr>
            <tr><td><code>backdrop.jpg</code></td><td>Detail view background</td><td>1920 × 1080 px</td></tr>
            <tr><td><code>cover.jpg</code></td><td>Card thumbnail (Music, Podcasts)</td><td>800 × 800 px</td></tr>
            <tr><td><code>fanart.jpg</code></td><td>Backdrop fallback</td><td>1920 × 1080 px</td></tr>
          </tbody>
        </table>
        <p className="help-note">
          JPEG, PNG, and WebP are all accepted. Filenames are case-sensitive on Linux (the Docker host).
        </p>
      </section>

      <section className="help-section">
        <h2>NFO Metadata (Kodi format)</h2>
        <p>Place a <code>.nfo</code> file in the item folder. Any filename ending in <code>.nfo</code> is picked up.</p>

        <h3>movie.nfo</h3>
        <pre className="help-code">{`<?xml version="1.0" encoding="UTF-8"?>
<movie>
  <title>The Dark Knight</title>
  <year>2008</year>
  <plot>Batman raises the stakes in his war on crime…</plot>
  <rating>9.0</rating>       <!-- 0–10 scale -->
  <genre>Action</genre>
  <genre>Drama</genre>
  <studio>Warner Bros.</studio>
  <runtime>152</runtime>     <!-- minutes -->
</movie>`}
        </pre>

        <h3>tvshow.nfo</h3>
        <pre className="help-code">{`<?xml version="1.0" encoding="UTF-8"?>
<tvshow>
  <title>Breaking Bad</title>
  <year>2008</year>
  <plot>A chemistry teacher turned drug manufacturer…</plot>
  <rating>9.5</rating>
  <genre>Crime</genre>
  <genre>Drama</genre>
  <studio>AMC</studio>
</tvshow>`}
        </pre>
      </section>

      <section className="help-section">
        <h2>Open Folder (Windows Explorer)</h2>
        <p>
          Movie and TV detail panels include an <strong>Open Folder</strong> button. Clicking it
          opens the item's folder directly in Windows Explorer via a <code>file://</code> network
          link. It also copies the UNC path to your clipboard as a fallback.
        </p>
        <p>
          To enable this, set the <code>SMB_PATH</code> variable in your <code>docker-compose.yml</code>
          to the SMB root of your media share:
        </p>
        <pre className="help-code">{`environment:
  - SMB_PATH=\\\\192.168.1.120\\media`}</pre>
        <p>
          Replace <code>192.168.1.120</code> with your NAS IP and <code>media</code> with
          your actual share name. On Synology, the share name is set up in
          Control Panel → Shared Folders.
        </p>
        <p className="help-note">
          <strong>Browser compatibility:</strong> Edge opens <code>file://</code> network links
          by default. In Chrome, go to <code>chrome://flags</code> and enable
          <em> Allow file:// access for pages loaded over network</em>. Firefox blocks these
          links — use the copied UNC path instead (paste into Explorer's address bar).
        </p>
        <p className="help-note">
          If Windows prompts for credentials when you first open the share, enter your NAS
          username and password and check <em>Remember my credentials</em>.
        </p>
      </section>

      <section className="help-section">
        <h2>Rescanning</h2>
        <p>
          The library is scanned once when the server starts. After adding new media,
          trigger a fresh scan without restarting the container:
        </p>
        <pre className="help-code">curl -X POST http://YOUR-NAS-IP:3000/api/rescan</pre>
      </section>
    </div>
  );
}
