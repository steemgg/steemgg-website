import steem from 'steem'

steem.api.setOptions({ url: 'https://api.steemit.com' })

export default steem.api
