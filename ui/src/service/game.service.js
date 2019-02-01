/**
 * Created by Erik on 4/12/17.
 */
/* eslint no-eval: 0 */
import axios from 'axios'
import steemApi from './steemAPI'
import Promise from 'bluebird'
var axiosInstance = axios.create({
  withCredentials: true,
  baseURL: process.env.API_SERVER_URL,
  timeout: 20000
})

export default class GameService {
  create (game) {
    return axiosInstance.post('/api/v1/game', this.convertGameToJson(game)).then(response => {
      return this.convertJsonToGame(response.data)
    })
  }

  list () {
    return axiosInstance.get('/api/v1/game').then(response => {
      return this.handleResponse(response)
    })
  }

  update (game) {
    return axiosInstance.put('/api/v1/game/' + game.id, this.convertGameToJson(game))
  }

  getById (id) {
    return axiosInstance.get('/api/v1/game/' + id).then(response => {
      return this.convertJsonToGame(response.data)
    })
  }

  getMyGames (userId) {
    return axiosInstance.get('/api/v1/game?account=' + userId)
  }

  getTopRateGames () {
    return axiosInstance.get('/api/v1/game?sort=rate_desc')
  }

  query (params) {
    if (params && params.limit == null) {
      params.limit = 1000
    }
    return axiosInstance.get('/api/v1/game', {
      params: params
    }).then(response => {
      return this.handleResponse(response)
    })
  }

  approve (gameId, comment) {
    return axiosInstance.post(`/api/v1/audit/${gameId}`, {
      status: 1,
      comment: comment
    })
  }

  delete (gameId, comment) {
    return axiosInstance.delete(`/api/v1/game/${gameId}`, {
      comment: comment
    })
  }

  deny (gameId, comment) {
    return axiosInstance.post(`/api/v1/audit/${gameId}`, {
      status: 0,
      comment: comment
    })
  }

  report (gameId, comment) {
    return axiosInstance.post(`/api/v1/report/${gameId}`, {
      report: 1,
      comment: comment
    })
  }

  undoReport (gameId, comment) {
    return axiosInstance.post(`/api/v1/report/${gameId}`, {
      report: 0,
      comment: comment
    })
  }

  recommend (gameId) {
    return axiosInstance.put(`/api/v1/recommend/${gameId}`, {
      recommend: 1
    })
  }

  undoRecommend (gameId) {
    return axiosInstance.put(`/api/v1/recommend/${gameId}`, {
      recommend: 0
    })
  }

  updateGameRecord (gameId, gameRecord) {
    return axiosInstance.put(`/sdk/v1/game/record/${gameId}`, gameRecord)
  }

  fetchGameRecord (gameId) {
    return axiosInstance.get(`/sdk/v1/game/record/${gameId}`)
  }

  fetchGameLeaderBoard (gameId, params) {
    return axiosInstance.get(`api/v1/leaderboard/${gameId}`, {params: params}).then(response => {
      return response.data
    })
  }

  /**
   *
   * @param gameId
   * @param activity
   * @param isComment
   * @return {Promise<AxiosResponse<any>>}
   */
  createActivity (gameId, activity, isPost) {
    let clonnedActivity = Object.assign({}, activity)
    clonnedActivity.gameid = gameId
    delete clonnedActivity.award
    delete clonnedActivity.permlink
    clonnedActivity.tags = [...new Set([...clonnedActivity.tags.map(tag => {
      return tag.toLowerCase()
    })])]
    return axiosInstance.post('/api/v1/post', clonnedActivity, {params: {post: isPost}}).then(response => {
      return response.data
    })
  }

  updateActivity (gameId, activity) {
    activity.tags = [...new Set([...activity.tags.map(tag => {
      return tag.toLowerCase()
    })])]
    return axiosInstance.put('/api/v1/post', {'gameId': gameId, 'activity': activity})
  }

  getComments (category, author, permlink) {
    console.log('GameService: get comments', category, author, permlink)
    return steemApi.getStateAsync(`/${category}/@${author}/${permlink}`).then(apiRes => {
      return this.handleComments(apiRes)
    })
  }

  vote (author, permlink, weight) {
    return axiosInstance.post(`/api/v1/vote/${author}/${permlink}`, {weight: weight}).then(response => {
      return response.data
    })
  }

  postComment (author, permlink, content) {
    return axiosInstance.post(`/api/v1/comment/${author}/${permlink}`, {content: content}).then(response => {
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
      latestVotes: [],
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
        if (i === 0 && response.activeVotes.length > 0) {
          result.latestVotes = response.activeVotes
        }
        if (response.tags.length > 0) {
          // result.tags = result.tags.concat(response.tags)
          result.tags = [...new Set([...result.tags, ...response.tags])]
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
            result.tags = metadata.tags.map(tag => {
              return tag.toLowerCase()
            })
          } else if (typeof metadata.tags === 'string') {
            // when there is only one tag, seems it returns a string
            result.tags = [metadata.tags.toLowerCase()]
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

  getDiscussionByAuthor (author, limit) {
    return steemApi.getDiscussionsByAuthorBeforeDateAsync(author, '', '2100-01-01T00:00:00', limit).then(response => {
      console.log(response)
      return response
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
    let commentHistory = []
    if (gameJson.auditComments) {
      commentHistory = commentHistory.concat(gameJson.auditComments)
    }
    if (gameJson.reportComments) {
      commentHistory = commentHistory.concat(gameJson.reportComments)
    }
    gameJson.commentHistory = commentHistory.sort((a, b) => {
      if (a.lastModified > b.lastModified) {
        return -1
      } else if (a.lastModified === b.lastModified) {
        return 0
      } if (a.lastModified < b.lastModified) {
        return 1
      }
    })
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
    delete clonnedGame.commentHistory
    return clonnedGame
  }

  // TODO: the following methods should be moved to a different service
  fetchUser () {
    return axiosInstance.get('/api/v1/me')
  }

  getAuditors () {
    return axiosInstance.get(`/api/v1/auditor`, {}).then(response => {
      return response.data
    })
  }

  addAuditor (userId) {
    return axiosInstance.put(`/api/v1/auditor/${userId}`, {})
  }

  deleteAuditor (userId) {
    return axiosInstance.delete(`/api/v1/auditor/${userId}`, {})
  }
  logout () {
    return axiosInstance.get('/api/v1/logout')
  }
}
