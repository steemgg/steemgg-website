/**
 * Created by Erik on 4/12/17.
 */
import GameList from '../mocks/gameListMock'
import axios from 'axios'

export default class GameService {
  create (game) {
    axios.post('/')
  }

  list () {
    return new Promise((resolve, reject) => {
      resolve(GameList)
    })
  }

  delete () {

  }

  update () {
  }
}
