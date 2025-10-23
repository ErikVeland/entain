<template>
  <div 
    class="flex flex-wrap gap-3" 
    role="group" 
    aria-label="Race category filters"
    @keydown="handleKeyDown"
    tabindex="0"
    ref="categoryFilterRef"
  >
    <button
      v-for="(category, index) in categories"
      :key="category.id"
      @click="$emit('toggle-category', category.id)"
      class="px-6 py-3 rounded-xl2 font-medium transition-all duration-200 flex items-center focus:outline-none focus:ring-2 focus:ring-brand-primary"
      :class="[
        category.active 
          ? 'bg-brand-primary text-text-inverse shadow-card' 
          : 'bg-surface-raised text-text-base hover:bg-surface-sunken'
      ]"
      :aria-pressed="category.active"
      :title="`${category.active ? 'Remove' : 'Add'} ${category.name} races from view`"
      :tabindex="index === 0 ? 0 : -1"
      @keydown="handleButtonKeyDown($event, index)"
      ref="categoryButtons"
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
import { ref } from 'vue'

interface Category {
  id: string
  name: string
  active: boolean
}

const props = defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'toggle-category', categoryId: string): void
}>()

const categoryFilterRef = ref<HTMLElement | null>(null)
const categoryButtons = ref<HTMLElement[]>([])

const handleKeyDown = (event: KeyboardEvent) => {
  // Focus the first button when user tabs into the group
  if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault()
    if (categoryButtons.value.length > 0) {
      categoryButtons.value[0].focus()
    }
  }
}

const handleButtonKeyDown = (event: KeyboardEvent, index: number) => {
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      if (index < props.categories.length - 1) {
        categoryButtons.value[index + 1].focus()
      } else {
        // Wrap to first button
        categoryButtons.value[0].focus()
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (index > 0) {
        categoryButtons.value[index - 1].focus()
      } else {
        // Wrap to last button
        categoryButtons.value[props.categories.length - 1].focus()
      }
      break
    case 'Home':
      event.preventDefault()
      categoryButtons.value[0].focus()
      break
    case 'End':
      event.preventDefault()
      categoryButtons.value[props.categories.length - 1].focus()
      break
  }
}
</script>