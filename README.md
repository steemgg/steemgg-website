![](https://github.com/steemgg/ui-resource/blob/master/image/steemgg-website-readme/i-love-coding.gif)

# steemgg-website

The Official Web Site of [steemgg](https://steemgg.com)

[![Build Status](https://travis-ci.org/steemgg/steemgg-website.svg?branch=develop)](https://travis-ci.org/steemgg/steemitgame-website)

# Technology Stack

* Programming Language: [Javascript](https://en.wikipedia.org/wiki/JavaScript)
* Backend: [Node.js](https://nodejs.org)
* Frontend: [Vue.js](https://vuejs.org)
* Database: [Redis](https://redis.io)/[MySQL](https://www.mysql.com)
* Blockchain: [STEEM](https://steem.io)
* CDN: [IPFS](https://ipfs.io)

# How to run the UI
```bash
# get source code
$git clone https://github.com/steemgg/steemgg-website.git
# cd to the ui folder  
$cd steemgg-website/ui
# install package dependencies
$npm install 
# start ui
$npm run start 
```
* Visit http://localhost:8080 or http://127.0.0.1:8080

# How to run the backend

#### Using Docker Compose

* Pre-requisite: Install and set up [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/) on your machine.

```bash
# get source code
$git clone https://github.com/steemgg/steemgg-website.git
# enter docker-compose folder
$cd steemgg-website/docker
# start server
$docker-compose up -d
```
* Visit http://localhost/api/v1/game or http://127.0.0.1/api/v1/game

#### How to contribute

* Github: https://github.com/steemgg/steemgg-website
* Fork the `develop` branch (NO master branch, as master branch is ONLY for hot-fixing purpose)
* Create your feature branch (or bug fix): `git checkout -b my-new-feature (or my-bug-fix)`
* Commit your changes: `git commit -am 'Add some feature' (or 'fix some bug')`
* Push to the branch: `git push origin my-new-feature (or my-bug-fix)`
* Submit a pull request

#### License

* MIT
* YES, it's MIT. So you could use it for Free open source project or Commercial proprietary purpose.
* We still encourage you to embrace open source, to make our community better.
* If possible, we still wish you could keep beneficiaries to [@steemgg](https://steemit.com/@steemgg) no less than 2% in your project, to support both of us.
```javascript
    let extensions = [[0, {
        beneficiaries: [
            {
                account: 'steemgg',
                weight: 200
            }
        ]
    }]];
```
