# steemgg-website
The Official Web Site of [steemgg](https://steemgg.com)

[![Build Status](https://travis-ci.org/steemgg/steemgg-website.svg?branch=develop)](https://travis-ci.org/steemgg/steemitgame-website)



# How to run the UI locally
cd to the /ui directory  
1. `npm install`  
2. `npm run start`  
3. visit http://localhost:8080

# How to run the backend

#### Using Docker Compose

Pre-requisite: Install and set up [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/) on your machine.

```bash
# get source code
git clone https://github.com/steemgg/steemgg-website.git
# enter docker-compose folder
cd steemgg-website/docker
# start server
docker-compose up -d
```
* Open http://127.0.0.1/api/v1/game on your browser to see it's work
