<template>
  <div class="wrap">
    <!-- Toolbar -->
    <header class="toolbar">
      <div class="left">
        <input class="search" v-model.trim="search" placeholder="Buscar por nombre…" />
        <label>Orden:</label>
        <select v-model="sort.by">
          <option value="name">Nombre</option>
          <option value="value">Valor</option>
        </select>
        <select v-model="sort.dir">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>

        <label class="ml">Filtro:</label>
        <select v-model="filter.mode">
          <option value="all">Todos</option>
          <option value="gt">Mayor a</option>
          <option value="lt">Menor a</option>
        </select>
        <input
          v-model.number="filter.threshold"
          :disabled="filter.mode==='all'"
          type="number" min="0" max="20" inputmode="numeric"
          @change="clampFilter" placeholder="número"
        />
        <button class="btn ghost" @click="clearFilter">Borrar</button>
      </div>

      <div class="right">
        <button class="btn primary" :disabled="counters.length>=MAX" @click="open=true">＋ Nuevo</button>
      </div>
    </header>

    <main>
      <transition-group name="fade" tag="ul" class="list">
        <li v-for="c in visibleCounters" :key="c.id" class="row">
          <span class="name" :title="c.name">{{ c.name }}</span>
          <div class="controls">
            <button class="chip" @click="dec(c.id)" :disabled="c.value<=0" aria-label="Restar" title="Restar">−</button>
            <span class="value">{{ c.value }}</span>
            <button class="chip" @click="inc(c.id)" :disabled="c.value>=20" aria-label="Sumar" title="Sumar">＋</button>
            <button class="trash" @click="remove(c.id)" aria-label="Eliminar" title="Eliminar">🗑</button>
          </div>
        </li>

        <li v-if="!visibleCounters.length" key="empty" class="empty">
          Sin resultados. <button class="btn inline" @click="open=true">Crear uno</button>
        </li>
      </transition-group>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="sum">Σ <input :value="sumAll" disabled /></div>
      <button class="btn primary" :disabled="counters.length>=MAX" @click="open=true">Agregar contador</button>
    </footer>

    <!-- Modal -->
    <div v-if="open" class="backdrop" @click.self="open=false">
      <div class="modal" role="dialog" aria-modal="true">
        <h3>Nuevo contador</h3>
        <input ref="inputRef" v-model.trim="newName" maxlength="20" placeholder="Nombre del contador" @keydown.enter="add" />
        <div class="actions">
          <button class="btn ghost" @click="open=false">Cancelar</button>
          <button class="btn primary" :disabled="!newName" @click="add">Agregar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from '@nuxtjs/composition-api'
import { useStore } from '@nuxtjs/composition-api'

const MAX = 20
const store = useStore()

const search = ref('')
const sort = reactive<{ by:'name'|'value'; dir:'asc'|'desc' }>({ by: 'name', dir: 'asc' })
const filter = reactive<{ mode:'all'|'gt'|'lt'; threshold: number|null }>({ mode: 'all', threshold: null })
const open = ref(false)
const newName = ref('')

const counters = computed(() => (store.state as any).counters)
const selector = store.getters.selectCounters as (a: any) => any[]
const visibleCounters = computed(() => selector({ search: search.value, filter, sort }))
const sumAll = computed(() => store.getters.sumAll)

const add = () => { store.dispatch('addUnique', newName.value); newName.value=''; open.value=false }
const rename = (id: number, name: string) => store.commit('RENAME', { id, name })
const inc = (id: number) => store.commit('INC', id)
const dec = (id: number) => store.commit('DEC', id)
const remove = (id: number) => store.commit('REMOVE', id)

function clampFilter () {
  if (filter.threshold == null) return
  filter.threshold = Math.max(0, Math.min(20, filter.threshold))
}
function clearFilter () { filter.mode = 'all'; filter.threshold = null }

const inputRef = ref<HTMLInputElement | null>(null)
watch(open, async v => { if (v) { await nextTick(); inputRef.value?.focus() } })

const SS = 'prefs-v1'
if (process.client) {
  const raw = sessionStorage.getItem(SS)
  if (raw) {
    try {
      const p = JSON.parse(raw)
      if (p.search != null) search.value = p.search
      if (p.sort) Object.assign(sort, p.sort)
      if (p.filter) Object.assign(filter, p.filter)
    } catch {}
  }
  watch([search, () => sort.by, () => sort.dir, () => filter.mode, () => filter.threshold], () => {
    sessionStorage.setItem(SS, JSON.stringify({ search: search.value, sort, filter }))
  })
}
</script>

<style scoped>
/* Layout */
.wrap{min-height:100vh;display:flex;flex-direction:column;background:#0f1220;color:#eef1ff}
.toolbar,.footer{background:#4028a6;padding:10px 16px;display:flex;align-items:center;justify-content:space-between}
.left{display:flex;gap:8px;flex-wrap:wrap}
main{flex:1;padding:12px}

/* Inputs */
select,input{background:#202338;color:#eef1ff;border:1px solid #51557a;border-radius:8px;padding:6px 10px}
.search{min-width:200px}

/* Botones */
.btn{border:1px solid #8a7cff;background:transparent;padding:8px 12px;border-radius:10px;cursor:pointer;color:#fff;transition:transform .08s ease, box-shadow .2s}
.btn:hover{transform:translateY(-1px)}
.btn.primary{background:#6b46ff;border-color:#6b46ff}
.btn.ghost{color:#fff}
.btn.inline{border:1px solid #6b46ff;padding:2px 8px;border-radius:6px;background:#6b46ff;color:#fff}

/* Lista */
.list{padding:0;margin:0}
.row{list-style:none;display:flex;align-items:center;justify-content:space-between;background:#9dd9a3;padding:12px;border-radius:12px;margin:10px 0;box-shadow:0 1px 0 rgba(0,0,0,.1)}
.name{font-weight:700;color:#102012;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:12px}
.controls{display:flex;align-items:center;gap:8px}
.chip{border:1px solid #2b2b2b;background:#e9f0ea;padding:6px 10px;border-radius:999px;color:#111}
.value{min-width:36px;text-align:center;font-weight:700;color:#111}
.trash{background:transparent;border:none;font-size:18px;cursor:pointer;color:#111}
.empty{color:#b7bed3;text-align:center;margin-top:24px}

/* Footer */
.footer .sum{display:flex;align-items:center;gap:6px}
.footer .sum input{width:90px;text-align:center;background:#202338;color:#eef1ff;border:1px solid #51557a;border-radius:8px;padding:6px 8px}

/* Modal */
.backdrop{position:fixed;inset:0;background:rgba(3,8,20,.55);backdrop-filter:saturate(140%) blur(2px);display:grid;place-items:center;z-index:50}
.modal{width:min(480px,92vw);background:#161a2e;color:#fff;border:1px solid #3a3f63;border-radius:16px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.modal input{width:100%;margin:12px 0}

/* Transiciones */
.fade-enter-active,.fade-leave-active{transition:all .18s ease}
.fade-enter,.fade-leave-to{opacity:0;transform:translateY(6px)}

/* Responsive */
@media (max-width: 560px){
  .row{flex-wrap:wrap;gap:8px}
  .controls{width:100%;justify-content:flex-end}
  .search{min-width:140px;flex:1}
}
</style>
