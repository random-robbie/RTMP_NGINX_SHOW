Debian Media Streaming Server
http://projects.e7d.fr/media-streaming/


### Software Used

- NGINX
- nginx-rtmp-module (https://github.com/arut/nginx-rtmp-module)
- MediaInfo CLI
- PHP5 with FastCGI and FPM
- jQuery
- Bootstrap
- JW Player
- Video.js
- MediaElement.js
- Flow Player


### How-To

This software is intended to broadcast RTMP/HLS stream over a local network,
accepting various connections input.

The following recording softwares were tested and therefore are referenced as
100% compatible:
	- Adobe Flash Media Encoder         https://www.adobe.com/go/fmle3/
	- Elgato Game Capture HD            http://www.gamecapture.com/
	- FFsplit                           http://www.ffsplit.com/
	- Open Broadcaster Software         https://obsproject.com/
	- Telestream Wirecast               http://www.telestream.net/wirecast/
	- XSplit Broadcaster & Gamecaster   https://www.xsplit.com/
A reference guide to configure them is provided and available on the project
main website.
Please consider that any other RTMP standard compatible broadcast software may
also work.

Once started this server offers you an RTMP interface for input collection and
output live/VOD playback, and an HTTP interface giving you a website interface with
a wide variety of players, an HLS (HTTP Live Stream) mode for mobile devices
compatibility and a Json API to collect statisics.

RTMP applications:
	- Transcode: rtmp://[streaming-server]/transcode
	- Live: rtmp://[streaming-server]/live
HTTP applications:
	- Wesbite: http://[streaming-server]/
	- VOD archive: http://[streaming-server]/rec
	- HLS playback: http://[streaming-server]/hls
	- DASH playback: http://[streaming-server]/dash
	- API: http://[streaming-server]/api.json
		- Channel ping availability
		- Channel video record
		- Channels detailed information


### Compatible Playback Environments

Using the included playback software, available through the HTTP interface, and
following the transcoding instructions below, you should be able to watch your
stream in great conditions under the following environments:
	- 1080p MKV/MP4 video capable PC and Mac
	- Android device
	- iPod/iPad/iPhone
As a reference, these "old" devices were tested and are reported working:
	- iPod Touch
	- Samsung Galaxy S2


### Recommended Stream Profile

In order to get the best balance between quality and performance on the largest
diversity of devices, here are the recommended specifications regarding the
streaming software transcoding profile:
- Video:
	- Definition: 1920*1080
	- FPS: 30
	- Encoder: x264
	- Profile: main
	- Quality mode: Prefer CBR over VBR
	- Quality balance (VRB only): 8-10
	- Max bitrate: 5Mb/s
	- Buffer size: 5Mb/s
- Audio:
	- Coder: AAC
	- Bitrate: 128kb/s
	- Format: 44.1kHz
	- Channel: Stereo

Using this specification you should obtain a quality stutter free stream on
most playback environments.
