/**
 * Created by Erik on 4/12/17.
 */
import GameList from '../mocks/gameListMock'

export default class GameService {
  create () {
    return {}
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
