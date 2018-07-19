# steemgg-website

The Official Web Site of [steemgg](https://steemgg.com)

[![Build Status](https://travis-ci.org/steemgg/steemgg-website.svg?branch=develop)](https://travis-ci.org/steemgg/steemitgame-website)

# How to run the UI
* cd to the /ui directory  
* `npm install`  
* `npm run start`  
* Visit http://localhost:8080 or http://127.0.0.1:8080

# How to run the backend

#### Using Docker Compose

* Pre-requisite: Install and set up [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/) on your machine.

```bash
# get source code
git clone https://github.com/steemgg/steemgg-website.git
# enter docker-compose folder
cd steemgg-website/docker
# start server
docker-compose up -d
```
* Visit http://localhost/api/v1/game or http://127.0.0.1/api/v1/game

#### How to contribute

* Github: https://github.com/steemgg/steemgg-website
* Fork the `develop` branch (NO master branch, as master branch is ONLY for hot-fixing purpose)
* Create your feature branch (or bug fix): `git checkout -b my-new-feature (or my-bug-fix)`
* Commit your changes: `git commit -am 'Add some feature' (or 'fix some bug')`
* Push to the branch: `git push origin my-new-feature (or my-bug-fix)`
* Submit a pull request
