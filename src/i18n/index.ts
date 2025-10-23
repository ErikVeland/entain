import { createI18n } from 'vue-i18n'

// Define the message structure
type MessageSchema = typeof en

// English translations
const en = {
  app: {
    title: 'Next to Go Racing',
    footer: 'Racing data provided by Neds API'
  },
  races: {
    noRaces: 'No races available',
    checkBack: 'Please check back later',
    error: 'Error loading races',
    tryAgain: 'Try Again',
    live: 'LIVE',
    startingSoon: 'Starting soon',
    inProgress: 'In progress'
  },
  meetings: {
    noMeetings: 'No meetings available',
    error: 'Error loading meetings',
    races: 'race | races'
  },
  categories: {
    horse: 'Horse',
    greyhound: 'Greyhound',
    harness: 'Harness',
    selectAll: 'Select All'
  },
  views: {
    nextFive: 'Next 5 Races',
    meetings: 'Meetings'
  },
  theme: {
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode'
  }
}

// Create Vue I18n instance
export const i18n = createI18n<[MessageSchema], 'en'>({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en
  }
})

export default i18n