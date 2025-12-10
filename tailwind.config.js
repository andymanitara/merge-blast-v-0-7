/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			],
  			display: [
  				'Cal Sans',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'Consolas',
  				'monospace'
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
            // Kid Playful Palette
            kid: {
                primary: '#FF6B6B',   // Red/Coral
                secondary: '#4ECDC4', // Teal/Turquoise
                accent: '#FFE66D',    // Yellow
                dark: '#2D3748',      // Dark Slate (Borders)
                light: '#F7FAFC',     // Off-white
                success: '#48BB78',   // Green
                warning: '#ED8936',   // Orange
            }
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
            '4xl': '2rem',
            '5xl': '2.5rem',
  		},
        borderWidth: {
            '3': '3px',
            '6': '6px',
        },
        boxShadow: {
            'kid': '4px 4px 0px 0px #2D3748',
            'kid-sm': '2px 2px 0px 0px #2D3748',
            'kid-lg': '6px 6px 0px 0px #2D3748',
        },
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
            pop: {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' },
            },
            bounce: {
                '0%, 100%': {
                    transform: 'translateY(0)',
                    animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
                },
                '50%': {
                    transform: 'translateY(-10%)',
                    animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
                },
            },
            'scale-in': {
                '0%': { transform: 'scale(0)', opacity: '0' },
                '100%': { transform: 'scale(1)', opacity: '1' },
            }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
            'pop': 'pop 0.3s ease-in-out',
            'bounce-custom': 'bounce 1s infinite',
            'scale-in': 'scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}