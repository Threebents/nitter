# Nitter

[![Test Matrix](https://github.com/zedeus/nitter/workflows/Tests/badge.svg)](https://github.com/zedeus/nitter/actions/workflows/run-tests.yml)
[![Test Matrix](https://github.com/zedeus/nitter/workflows/Docker/badge.svg)](https://github.com/zedeus/nitter/actions/workflows/build-docker.yml)
[![License](https://img.shields.io/github/license/zedeus/nitter?style=flat)](#license)

> [!NOTE]
> Running a Nitter instance now requires real accounts, since Twitter removed the previous methods. \
> This does not affect users. \
> For instructions on how to obtain session tokens, see [Creating session tokens](https://github.com/zedeus/nitter/wiki/Creating-session-tokens).

A free and open source alternative Twitter front-end focused on privacy and
performance. \
Inspired by the [Invidious](https://github.com/iv-org/invidious) project.

- No JavaScript or ads
- All requests go through the backend, client never talks to Twitter
- Prevents Twitter from tracking your IP or JavaScript fingerprint
- Uses Twitter's unofficial API (no developer account required)
- Lightweight (for [@nim_lang](https://nitter.net/nim_lang), 60KB vs 784KB from twitter.com)
- RSS feeds
- Themes
- Mobile support (responsive design)
- AGPLv3 licensed, no proprietary instances permitted

<details>
<summary>Donations</summary>
Liberapay: https://liberapay.com/zedeus<br>
Patreon: https://patreon.com/nitter<br>
BTC: bc1qpqpzjkcpgluhzf7x9yqe7jfe8gpfm5v08mdr55<br>
ETH: 0x24a0DB59A923B588c7A5EBd0dBDFDD1bCe9c4460<br>
XMR: 42hKayRoEAw4D6G6t8mQHPJHQcXqofjFuVfavqKeNMNUZfeJLJAcNU19i1bGdDvcdN6romiSscWGWJCczFLe9RFhM3d1zpL<br>
SOL: ANsyGNXFo6osuFwr1YnUqif2RdoYRhc27WdyQNmmETSW<br>
ZEC: u1vndfqtzyy6qkzhkapxelel7ams38wmfeccu3fdpy2wkuc4erxyjm8ncjhnyg747x6t0kf0faqhh2hxyplgaum08d2wnj4n7cyu9s6zhxkqw2aef4hgd4s6vh5hpqvfken98rg80kgtgn64ff70djy7s8f839z00hwhuzlcggvefhdlyszkvwy3c7yw623vw3rvar6q6evd3xcvveypt
</details>

## Roadmap

- Embeds
- Account system with timeline support
- Archiving tweets/profiles
- Developer API

## New Features

- Likes tab

## Resources

The wiki contains
[a list of instances](https://github.com/zedeus/nitter/wiki/Instances) and
[browser extensions](https://github.com/zedeus/nitter/wiki/Extensions)
maintained by the community.

## Why?

It's impossible to use Twitter without JavaScript enabled, and as of 2024 you
need to sign up. For privacy-minded folks, preventing JavaScript analytics and
IP-based tracking is important, but apart from using a VPN and uBlock/uMatrix,
it's impossible. Despite being behind a VPN and using heavy-duty adblockers,
you can get accurately tracked with your [browser's
fingerprint](https://restoreprivacy.com/browser-fingerprinting/), [no
JavaScript required](https://noscriptfingerprint.com/). This all became
particularly important after Twitter [removed the
ability](https://www.eff.org/deeplinks/2020/04/twitter-removes-privacy-option-and-shows-why-we-need-strong-privacy-laws)
for users to control whether their data gets sent to advertisers.

Using an instance of Nitter (hosted on a VPS for example), you can browse
Twitter without JavaScript while retaining your privacy. In addition to
respecting your privacy, Nitter is on average around 15 times lighter than
Twitter, and in most cases serves pages faster (eg. timelines load 2-4x faster).

In the future a simple account system will be added that lets you follow Twitter
users, allowing you to have a clean chronological timeline without needing a
Twitter account.

## Screenshot

![nitter](/screenshot.png)

## Installation

### Dependencies

- libpcre
- libsass
- redis/valkey

To compile Nitter you need a Nim installation, see
[nim-lang.org](https://nim-lang.org/install.html) for details. It is possible
to install it system-wide or in the user directory you create below.

To compile the scss files, you need to install `libsass`. On Ubuntu and Debian,
you can use `libsass-dev`.

Redis is required for caching and in the future for account info. As of 2024
Redis is no longer open source, so using the fork Valkey is recommended. It
should be available on most distros as `redis` or `redis-server`
(Ubuntu/Debian), or `valkey`/`valkey-server`. Running it with the default
config is fine, Nitter's default config is set to use the default port and
localhost.

Here's how to create a `nitter` user, clone the repo, and build the project
along with the scss and md files.

```bash
# useradd -m nitter
# su nitter
$ git clone https://github.com/zedeus/nitter
$ cd nitter
$ nimble build -d:danger --mm:refc
$ nimble scss
$ nimble md
$ cp nitter.example.conf nitter.conf
```

Edit `twitter_oauth.sh` with your Twitter account name and password.

```
$ ./twitter_oauth.sh | tee -a guest_accounts.jsonl
```

Set your hostname, port, HMAC key, https (must be correct for cookies), and
Redis info in `nitter.conf`. To run Redis, either run
`redis-server --daemonize yes`, or `systemctl enable --now redis` (or
redis-server depending on the distro). Run Nitter by executing `./nitter` or
using the systemd service below. You should run Nitter behind a reverse proxy
such as [Nginx](https://github.com/zedeus/nitter/wiki/Nginx) or
[Apache](https://github.com/zedeus/nitter/wiki/Apache) for security and
performance reasons.

### Docker

Page for the Docker image: https://hub.docker.com/r/zedeus/nitter

#### NOTE: For ARM64 support, please use the separate ARM64 docker image: [`zedeus/nitter:latest-arm64`](https://hub.docker.com/r/zedeus/nitter/tags).

To run Nitter with Docker, you'll need to install and run Redis separately
before you can run the container. See below for how to also run Redis using
Docker.

To build and run Nitter in Docker:

```bash
docker build -t nitter:latest .
docker run -v $(pwd)/nitter.conf:/src/nitter.conf -d --network host nitter:latest
```

Note: For ARM64, use this Dockerfile: [`Dockerfile.arm64`](https://github.com/zedeus/nitter/blob/master/Dockerfile.arm64).

A prebuilt Docker image is provided as well:

```bash
docker run -v $(pwd)/nitter.conf:/src/nitter.conf -d --network host zedeus/nitter:latest
```

Using docker-compose to run both Nitter and Redis as different containers:
Change `redisHost` from `localhost` to `nitter-redis` in `nitter.conf`, then run:

```bash
docker-compose up -d
```

Note the Docker commands expect a `nitter.conf` file in the directory you run
them.

### systemd

To run Nitter via systemd you can use this service file:

```ini
[Unit]
Description=Nitter (An alternative Twitter front-end)
After=syslog.target
After=network.target

[Service]
Type=simple

# set user and group
User=nitter
Group=nitter

# configure location
WorkingDirectory=/home/nitter/nitter
ExecStart=/home/nitter/nitter/nitter

Restart=always
RestartSec=15

[Install]
WantedBy=multi-user.target
```

Then enable and run the service:
`systemctl enable --now nitter.service`

### Logging

Nitter currently prints some errors to stdout, and there is no real logging
implemented. If you're running Nitter with systemd, you can check stdout like
this: `journalctl -u nitter.service` (add `--follow` to see just the last 15
lines). If you're running the Docker image, you can do this:
`docker logs --follow *nitter container id*`

## Repository origin

This repository was developed based on both `zedeus/nitter` and its fork `PrivacyDevel/nitter`.
For development history and reference, both repositories were used as sources of inspiration.

## Contact

Feel free to join our [Matrix channel](https://matrix.to/#/#nitter:matrix.org).
You can email me at zedeus@pm.me if you wish to contact me personally.
