<template>
  <div>
    <nav class="nav">
      <nuxt-link to="/">Home</nuxt-link>
      <nuxt-link to="/counters">Counters</nuxt-link>
    </nav>
    <nuxt />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.nav{display:flex;gap:12px;padding:10px;background:#222}
a{color:#fff}
</style>