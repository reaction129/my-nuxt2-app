import { Plugin } from '@nuxt/types'

const persist: Plugin = ({ store }) => {
  const LS = 'counters-v1'

  // cargar
  try {
    const raw = localStorage.getItem(LS)
    if (raw) store.commit('HYDRATE', JSON.parse(raw))
  } catch (_) {}

  // guardar
  store.subscribe((_m, state) => {
    localStorage.setItem(LS, JSON.stringify({ counters: state.counters }))
  })
}
export default persist