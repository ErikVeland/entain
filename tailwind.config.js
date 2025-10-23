// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class', '[data-theme="dark"]'],
	content: [
		'./index.html',
		'./src/**/*.{vue,js,ts,jsx,tsx}'
	],
	theme: {
		extend: {
			colors: {
				brand: {
					primary: '#F97316',   // orange-500
					secondary: '#0F172A', // slate-900
					accent: '#FACC15'     // yellow-400
				},
				surface: {
					DEFAULT: '#0B1220',   // deep background
					raised: '#111827',    // gray-900
					sunken: '#0A0F1C'
				},
				text: {
					base: '#F8FAFC',      // slate-50
					muted: '#94A3B8',     // slate-400
					inverse: '#111827'
				},
				success: '#16A34A',
				warning: '#F59E0B',
				danger: '#DC2626',
				info: '#2563EB'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji', 'sans-serif'],
				mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
			},
			borderRadius: {
				'xl2': '1.25rem'
			},
			boxShadow: {
				card: '0 6px 24px rgba(0,0,0,0.18)'
			},
			keyframes: {
				shimmer: {
					'0%': { backgroundPosition: '-468px 0' },
					'100%': { backgroundPosition: '468px 0' }
				},
				tick: {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(1)' }
				}
			},
			animation: {
				shimmer: 'shimmer 1.2s linear infinite',
				tick: 'tick 1s steps(1,end) infinite'
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography')
	],
	safelist: [
		// Allow semantic helpers that might be toggled at runtime
		'bg-surface',
		'bg-surface-raised',
		'text-text-base',
		'text-text-muted',
		'text-brand-primary',
		'border-brand-primary',
		'ring-brand-primary'
	]
}
