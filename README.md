# RTMP_NGINX_SHOW

A web-based interface for viewing and managing RTMP (Real-Time Messaging Protocol) streams from your Nginx server with nginx-rtmp-module.

Created by E7d

## Overview

RTMP_NGINX_SHOW is a lightweight PHP and HTML application that provides a user-friendly web interface to monitor, view, and manage live RTMP streams running on an Nginx server with the nginx-rtmp-module. It features automatic device detection for optimal playback (Flash for desktop, HTML5 for mobile devices) and includes stream recording capabilities.

## Features

- **Live Stream Viewing**: Watch RTMP streams directly in your browser
- **Responsive Design**: Bootstrap-based UI that works on desktop and mobile devices
- **Device Detection**: Automatically uses HTML5 player for mobile devices (iOS/Android) and Flash for desktop
- **Stream Recording**: Start and stop recording of live streams
- **Download Recordings**: Download recorded stream files
- **Real-time Statistics**: Monitor stream status and channel information
- **JSON API**: RESTful API for programmatic access to stream data
- **Multiple Channel Support**: View and manage multiple RTMP streams simultaneously

## Prerequisites

- **Nginx** with **nginx-rtmp-module** installed and configured
- **PHP** (version 5.4 or higher recommended)
- **Web Server** (Apache or Nginx with PHP support)
- **RTMP statistics endpoint** enabled in your Nginx RTMP configuration

## Installation

1. **Clone or download** this repository to your web server's document root:
   ```bash
   git clone https://github.com/random-robbie/RTMP_NGINX_SHOW.git
   cd RTMP_NGINX_SHOW
   ```

2. **Configure your Nginx RTMP module** to enable statistics:
   ```nginx
   rtmp {
       server {
           listen 1935;
           application live {
               live on;

               # Enable statistics
               on_publish http://localhost/control/publish;
               on_publish_done http://localhost/control/publish_done;

               # Enable recording (optional)
               record all;
               record_path /var/tmp/rec;
               record_unique on;
           }
       }
   }

   # HTTP server configuration
   http {
       server {
           listen 80;

           location /stat {
               rtmp_stat all;
               rtmp_stat_stylesheet stat.xsl;
           }

           location /stat.xsl {
               root /path/to/RTMP_NGINX_SHOW;
           }

           location /control {
               rtmp_control all;
           }
       }
   }
   ```

3. **Set proper permissions** for the recording directory:
   ```bash
   sudo mkdir -p /var/tmp/rec
   sudo chown www-data:www-data /var/tmp/rec
   sudo chmod 755 /var/tmp/rec
   ```

4. **Configure your web server** to serve the application (if using Apache, ensure PHP is enabled)

5. **Access the application** via your web browser:
   ```
   http://your-server-ip/
   ```

## Configuration

### RTMP Class Configuration

The application uses the `RTMP` class (located in `lib/RTMP.class.php`) to communicate with your Nginx RTMP module. You may need to adjust the RTMP statistics URL endpoint if your configuration differs from the default.

### Recording Path

If you want to use the recording feature, ensure the path in `index.php` matches your Nginx RTMP recording path:
```php
$file = "/var/tmp/rec/".$_GET["download"];
```

## Usage

### Viewing Streams

1. Navigate to the application URL in your browser
2. Available live channels will be displayed automatically
3. Click on a channel to start playback

### Recording Streams

- Use the recording controls in the web interface to start/stop recording
- Recordings are saved to the configured recording directory
- Download recorded files using the download feature

### API Endpoints

The application provides a JSON API via `json.php`:

- **Get all channels**: `json.php`
- **Check if channel is live**: `json.php?action=ping&channel=CHANNEL_NAME`
- **Start recording**: `json.php?action=record&start&channel=CHANNEL_NAME`
- **Stop recording**: `json.php?action=record&stop&channel=CHANNEL_NAME`
- **Pretty print**: Add `&pretty` parameter to any request for formatted JSON

Example:
```bash
curl "http://your-server/json.php?action=ping&channel=stream1&pretty"
```

## File Structure

```
RTMP_NGINX_SHOW/
├── index.php           # Main application file
├── json.php            # JSON API endpoint
├── stat.xsl            # XSL stylesheet for RTMP statistics
├── 50x.html            # Error page
├── css/                # Bootstrap and custom styles
├── js/                 # JavaScript libraries
├── fonts/              # Font files
├── img/                # Images and icons
├── lib/                # PHP classes
│   ├── RTMP.class.php      # RTMP stream handler
│   └── MediaInfo.class.php # Media information handler
└── info/               # Additional information files
```

## Streaming to Your Server

To stream to your Nginx RTMP server:

**Using OBS Studio:**
1. Set Server: `rtmp://your-server-ip/live`
2. Set Stream Key: `your_channel_name`

**Using FFmpeg:**
```bash
ffmpeg -re -i input.mp4 -c:v libx264 -c:a aac -f flv rtmp://your-server-ip/live/your_channel_name
```

## Browser Compatibility

- **Desktop**: Chrome, Firefox, Safari, Edge (requires Flash for RTMP playback)
- **Mobile**: iOS Safari, Chrome Mobile, Android Browser (uses HTML5)

## Troubleshooting

**Streams not showing:**
- Verify Nginx RTMP module is installed and configured correctly
- Check that the `/stat` endpoint is accessible
- Ensure PHP has permission to access the RTMP statistics

**Recording not working:**
- Verify the recording path exists and has proper permissions
- Check Nginx RTMP configuration for recording settings
- Ensure the `control` endpoint is configured correctly

**Playback issues:**
- For desktop: Ensure Flash Player is installed and enabled
- For mobile: Verify HTML5 video codec support
- Check firewall settings for RTMP port (default 1935)

## Security Considerations

- This application should be used in trusted networks or behind authentication
- The recording directory should have restricted access
- Consider implementing authentication for the web interface
- Restrict access to the `/control` endpoint in production environments

## Credits

- **Created by**: E7d
- **nginx-rtmp-module**: https://github.com/arut/nginx-rtmp-module
- **Bootstrap**: Front-end framework
- **Nginx**: HTTP and RTMP server

## License

Please refer to the original author for licensing information.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## Support

For issues related to:
- **nginx-rtmp-module**: Visit the [nginx-rtmp-module GitHub](https://github.com/arut/nginx-rtmp-module)
- **This interface**: Open an issue in this repository
