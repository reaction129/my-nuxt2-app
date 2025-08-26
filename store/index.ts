import { GetterTree, MutationTree, ActionTree } from 'vuex'

export interface Counter { id: number; name: string; value: number }
export interface RootState { counters: Counter[] }


//esto no se si lo dejaron en la guia pero igal lo deje para que se cargen por defecto.
export const state = (): RootState => ({
  counters: [
    { id: 1, name: 'Contador A', value: 3 },
    { id: 2, name: 'Contador B', value: 0 },
    { id: 3, name: 'Contador C', value: 2 }
  ]
})

export const getters: GetterTree<RootState, RootState> = {
  sumAll: (s) => s.counters.reduce((a, c) => a + c.value, 0),

  selectCounters:
    (s) =>
    (opts: {
      search?: string
      filter?: { mode: 'all' | 'gt' | 'lt'; threshold: number | null }
      sort?: { by: 'name' | 'value'; dir: 'asc' | 'desc' }
    }) => {
      const { search = '', filter = { mode: 'all', threshold: null }, sort = { by: 'name', dir: 'asc' } } = opts || {}

      let out = [...s.counters]

      if (search.trim()) {
        const q = search.trim().toLowerCase()
        out = out.filter(c => c.name.toLowerCase().includes(q))
      }

      if (filter.mode === 'gt' && filter.threshold != null) out = out.filter(c => c.value > filter.threshold!)
      if (filter.mode === 'lt' && filter.threshold != null) out = out.filter(c => c.value < filter.threshold!)

      const dir = sort.dir === 'asc' ? 1 : -1
      out.sort((a, b) => {
        const va = sort.by === 'name' ? a.name.localeCompare(b.name) : a.value
        const vb = sort.by === 'name' ? b.name.localeCompare(a.name) : b.value
        return (va > vb ? 1 : va < vb ? -1 : 0) * dir
      })

      return out
    }
}

// aca  eso de los Date. no me gusta, yo uso dayjs pero deje lo mas liviano el package.json
export const mutations: MutationTree<RootState> = {
  ADD (s, name: string) { s.counters.push({ id: Date.now(), name, value: 0 }) },
  RENAME (s, p: { id: number; name: string }) {
    const c = s.counters.find(x => x.id === p.id); if (c) c.name = p.name.slice(0, 20)
  },
  INC (s, id: number) { const c = s.counters.find(x => x.id === id); if (c && c.value < 20) c.value++ },
  DEC (s, id: number) { const c = s.counters.find(x => x.id === id); if (c && c.value > 0) c.value-- },
  REMOVE (s, id: number) { s.counters = s.counters.filter(x => x.id !== id) },
  HYDRATE (s, payload: RootState) { Object.assign(s, payload) }
}

export const actions: ActionTree<RootState, RootState> = {
  addUnique ({ state, commit }, rawName: string) {
    const name = rawName?.trim()
    if (!name) return
    if (state.counters.some(c => c.name.toLowerCase() === name.toLowerCase())) return
    commit('ADD', name)
  }
}
