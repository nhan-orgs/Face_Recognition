const config = {
  BASE_URL: 'https://user-mgmt.digitalauto.tech/api/',
  // BASE_URL: 'http://localhost:8081/api/',
  VERSION: 'v1',
}

export const baseAxios = axios.create({
  baseURL: `${config.BASE_URL}${config.VERSION}`,
})

export default config
