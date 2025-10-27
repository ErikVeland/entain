import { createI18n } from 'vue-i18n'

// Define the English messages
const messages = {
  en: {
    accessibility: {
      skipToMain: 'Skip to main content',
      skipToRaces: 'Skip to races',
      skipToMeetings: 'Skip to meetings'
    },
    theme: {
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
      highContrast: 'High contrast mode'
    },
    views: {
      nextFive: 'Next 5 Races',
      meetings: 'Meetings'
    },
    races: {
      liveUpdates: 'Live Race Updates'
    },
    game: {
      bestTime: 'Best Time',
      addToBetslip: 'Add to betslip',
      at: 'at'
    }
  }
}

// Create the i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

export default i18n