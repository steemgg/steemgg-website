import axios from 'axios'
// import steemApi from './steemAPI'

export default class SteemService {
  getAccount (account) {
    return axios.get('https://api.steemjs.com/get_accounts?names=[' + '"steemitgame.test"' + ']').then(response => {
      console.log(response)
      let accountInfo = response.data[0]
      accountInfo.json_metadata = JSON.parse(accountInfo.json_metadata)
      return accountInfo
    })
  }

  vote (catetory, author, permlink) {

  }
}
