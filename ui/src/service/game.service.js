/**
 * Created by Erik on 4/12/17.
 */
/* eslint no-eval: 0 */
import axios from 'axios'
import steemApi from './steemAPI'
import Promise from 'bluebird'

console.log(steemApi)
// export const getContentAsyc = Promise.promisify(steamApi.getContent, {
//   context: steamApi
// })

export default class GameService {
  create (game) {
    return axios.post('/v1/game', this.convertGameToJson(game)).then(response => {
      return this.convertJsonToGame(response.data)
    })
  }

  list () {
    return axios.get('v1/game').then(response => {
      return this.handleResponse(response)
    })
  }

  delete (id) {
    return axios.delete('/v1/game/' + id)
  }

  update (game) {
    return axios.put('v1/game/' + game.id, this.convertGameToJson(game))
  }

  getById (id) {
    return axios.get('/v1/game/' + id).then(response => {
      return this.convertJsonToGame(response.data)
    })
  }

  getMyGames (userId) {
    return axios.get('/v1/game?account=' + userId)
  }

  getTopRateGames () {
    return axios.get('/v1/game?sort=rate_desc')
  }

  query (params) {
    return axios.get('v1/game', {
      params: params
    }).then(response => {
      return this.handleResponse(response)
    })
  }

  approve (gameId, comment) {
    return axios.post(`v1/audit/${gameId}`, {
      status: 1,
      comment: comment
    })
  }

  deny (gameId, comment) {
    return axios.post(`v1/audit/${gameId}`, {
      status: 0,
      comment: comment
    })
  }

  report (gameId, comment) {
    return axios.post(`v1/audit/${gameId}`, {
      report: 1,
      comment: comment
    })
  }

  undoReport (gameId, comment) {
    return axios.post(`v1/audit/${gameId}`, {
      report: 0,
      comment: comment
    })
  }

  createActivity (gameId, activity) {
    let clonnedActivity = Object.assign({}, activity)
    clonnedActivity.gameid = gameId
    delete clonnedActivity.award
    delete clonnedActivity.permlink
    return axios.post('v1/post', clonnedActivity).then(response => {
      return response.data
    })
  }

  updateActivity (gameId, activity) {
    return axios.put('v1/post', {'gameId': gameId, 'activity': activity})
  }

  getComments (category, author, permlink) {
    console.log('GameService: get comments', category, author, permlink)
    return steemApi.getStateAsync(`/${category}/@${author}/${permlink}`).then(apiRes => {
      return this.handleComments(apiRes)
    })
  }

  vote (author, permlink, weight) {
    // debugger
    return axios.post(`v1/vote/${author}/${permlink}`, {weight: weight}).then(response => {
      return response.data
    })
  }

  postComment (author, permlink, content) {
    return axios.post(`v1/comment/${author}/${permlink}`, {content: content}).then(response => {
      return response.data
    })
  }

  /**
   * Read <code> activities </code> Array and get comments from steemit for each of them
   * Then store them in a array with reverse order
   * @param game
   */
  fetchAllSteemitComments (game) {
    console.log('Enter: fetchAllSteemitComments')
    let promises = []
    let result = new Array(game.activities.length)
    if (game.activities.length > 0) {
      for (let i = 0; i < game.activities.length; i++) {
        let activity = game.activities[i]
        promises.push(this.getComments('', activity.account, activity.permlink).then(response => {
          // promises.push(this.getContentData('steemitgame.test', activity.permlink).then(response => {
          console.log('get comment for content: ' + activity.permlink, response)
          result[game.activities.length - i - 1] = response.reverse()
        }))
      }
    }
    return Promise.all(promises).then(() => {
      console.log('Exit: fetchAllSteemitComments')
      return result
    })
  }

  /**
   * Read <code> activities </code> Array and get award data from steemit for each of them
   * Then combine them together
   * @param game
   */
  fetchSteemitMetadata (game) {
    console.log('fetchSteemitData')
    let promises = []
    let result = {
      totalPayout: 0,
      activeVotes: [],
      tags: []
    }
    for (let i = 0; i < game.activities.length; i++) {
      let activity = game.activities[i]
      // if (activity.status === 0) {
      //   // already closed, get award directly from backend data
      //   result.totalPayout += activity.payout
      // } else {
      promises.push(this.getContentData(activity.account, activity.permlink).then(response => {
      // promises.push(this.getContentData('steemitgame.test', activity.permlink).then(response => {
        console.log('get data for content: ' + activity.permlink, response)
        result.totalPayout += response.totalPayout
        if (response.tags.length > 0) {
          result.tags = result.tags.concat(response.tags)
        }
        if (response.activeVotes.length > 0) {
          result.activeVotes = result.activeVotes.concat(response.activeVotes)
        }
      }))
      // }
    }

    return Promise.all(promises).then(() => {
      return result
    })
  }

  getContentData (author, permlink) {
    return steemApi.getContentAsync(author, permlink).then(response => {
      let result = {
        totalPayout: 0,
        tags: [],
        activeVotes: []
      }
      if (response.json_metadata) {
        let metadata = JSON.parse(response.json_metadata)
        if (metadata && metadata.tags) {
          if (metadata.tags instanceof Array) {
            result.tags = metadata.tags
          } else if (typeof metadata.tags === 'string') {
            // when there is only one tag, seems it returns a string
            result.tags = [metadata.tags]
          }
        }
      }
      let pendingPayout = Number.parseFloat(response.pending_payout_value ? response.pending_payout_value.replace(' SBD') : 0)
      if (pendingPayout > 0) {
        result.totalPayout = pendingPayout
      } else {
        let totalPayout = Number.parseFloat(response.total_payout_value ? response.total_payout_value.replace(' SBD') : 0)
        result.totalPayout = totalPayout
      }
      if (response.active_votes && response.active_votes.length > 0) {
        result.activeVotes = response.active_votes
      }
      return result
    })
  }

  getCommentsChildrenLists = (apiRes) => {
    const listsById = {}
    Object.keys(apiRes.content).forEach((commentKey) => {
      listsById[apiRes.content[commentKey].id] = apiRes.content[commentKey].replies.map(
        childKey => apiRes.content[childKey].id
      )
    })
    return listsById
  }

  handleComments = (apiRes) => {
    let comments = []
    Object.keys(apiRes.content).forEach((commentKey) => {
      if (apiRes.content[commentKey].depth === 1) {
        comments.push(apiRes.content[commentKey])
      }
      apiRes.content[commentKey].replies = apiRes.content[commentKey].replies.map(
        childKey => apiRes.content[childKey]
      )
    })
    return comments
  }

  getRootCommentsList (apiRes) {
    return Object.keys(apiRes.content)
      .filter(commentKey => apiRes.content[commentKey].depth === 1)
      // .map(commentKey => apiRes.content[commentKey].id)
  }

  handleResponse (response) {
    let data = response.data
    if (data.items) {
      // it is a list
      for (let i = 0; i < data.items.length; i++) {
        this.convertJsonToGame(data.items[i])
      }
    } else {
      this.convertJsonToGame(data)
    }
    console.log(data)
    return data
  }

  convertJsonToGame (gameJson) {
    if (gameJson.coverImage) {
      try {
        gameJson.coverImage = JSON.parse(gameJson.coverImage)
      } catch (error) {
        gameJson.coverImage = {}
      }
    }
    if (gameJson.gameUrl) {
      try {
        gameJson.gameUrl = JSON.parse(gameJson.gameUrl)
      } catch (error) {
        gameJson.gameUrl = {
          hash: gameJson.gameUrl
        }
      }
    }
    if (gameJson.activities == null) {
      gameJson.activities = []
    }
    return gameJson
  }

  convertGameToJson (game) {
    let clonnedGame = Object.assign({}, game)
    if (game.coverImage) {
      clonnedGame.coverImage = JSON.stringify(game.coverImage)
    }
    if (game.gameUrl) {
      clonnedGame.gameUrl = JSON.stringify(game.gameUrl)
    }
    delete clonnedGame.activities
    return clonnedGame
  }

  fetchUser () {
    axios.get('/v1/me')
  }
}
