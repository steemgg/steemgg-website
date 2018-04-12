import axios from 'axios'

export function fetchCurrentUser() {
  return axios.get('/v1/me')
}
