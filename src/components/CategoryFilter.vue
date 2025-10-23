<template>
  <div 
    class="flex flex-wrap gap-3" 
    role="group" 
    aria-label="Race category filters"
  >
    <button
      v-for="category in categories"
      :key="category.id"
      @click="$emit('toggle-category', category.id)"
      class="px-6 py-3 rounded-xl2 font-medium transition-all duration-200 flex items-center"
      :class="[
        category.active 
          ? 'bg-brand-primary text-text-inverse shadow-card' 
          : 'bg-surface-raised text-text-base hover:bg-surface-sunken'
      ]"
      :aria-pressed="category.active"
      :title="`${category.active ? 'Remove' : 'Add'} ${category.name} races from view`"
    >
      <span>{{ category.name }}</span>
      <span 
        v-if="category.active"
        class="ml-2 w-2 h-2 rounded-full bg-text-inverse"
        aria-hidden="true"
      ></span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
  active: boolean
}

defineProps<{
  categories: Category[]
}>()

defineEmits<{
  (e: 'toggle-category', categoryId: string): void
}>()
</script>