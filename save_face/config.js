const config = {
  API_BASE: 'http://localhost:8080/api/v1/',
}

export const baseAxios = axios.create({
  baseURL: config.API_BASE,
})

export default config
