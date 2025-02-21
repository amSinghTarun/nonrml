import type { Config } from "tailwindcss";


const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		boxShadow: {
  			dropdown: '0 35px 40px -30px rgba(0, 0, 0)',
  			productPage: '0px 0px 3px 0.2px rgba(38, 38, 38, 1) '
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
		transform: {
		'perspective-1000': 'perspective(1000px)',
		},
  		animation: {
			'slide-up': 'slideUp 0.1s ease-out',
			'spin-slow': 'spin 3s linear infinite',
			'spin-fast': 'spin 1s linear infinite',
			fade: 'fade 3s ease-out forwards',
  			linear: 'backgroundLinear 5s linear infinite',
			first: "moveVertical 30s ease infinite",
			second: "moveInCircle 20s reverse infinite",
			third: "moveInCircle 40s linear infinite",
			fourth: "moveHorizontal 40s ease infinite",
			fifth: "moveInCircle 20s ease infinite",
			"slow-fade": "fade 20s ease-out forwards",
			'flip': 'flip 0.5s ease-in-out',

  		},
  		keyframes: {
			slideUp: {
				'0%': { transform: 'translateY(100%)' },
				'100%': { transform: 'translateY(0)' }
			},
			slideText: {
				'0%': { transform: 'translateY(0%)', opacity: '1' },
				'50%': { transform: 'translateY(-20%)', opacity: '0.6' },
				'100%': { transform: 'translateY(0%)', opacity: '1' },
			},
			flip: {
				'0%': { transform: 'rotateY(0deg)' },
				'100%': { transform: 'rotateY(180deg)' },
			},
			fade: {
				'0%': { opacity: '1' },
				'100%': { opacity: '0' },
			},
			moveHorizontal: {
				"0%": {
				  transform: "translateX(-50%) translateY(-10%)",
				},
				"50%": {
				  transform: "translateX(50%) translateY(10%)",
				},
				"100%": {
				  transform: "translateX(-50%) translateY(-10%)",
				},
			},
			moveInCircle: {
				"0%": {
					transform: "rotate(0deg)",
				},
				"50%": {
					transform: "rotate(180deg)",
				},
				"100%": {
					transform: "rotate(360deg)",
				},
			},
			moveVertical: {
				"0%": {
					transform: "translateY(-50%)",
				},
				"50%": {
					transform: "translateY(50%)",
				},
				"100%": {
					transform: "translateY(-50%)",
				},
			},
  			backgroundLinear: {
  				'0%': {
  					backgroundPosition: '0% 50%'
  				},
  				'100%': {
  					backgroundPosition: '200% 50%'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		transformStyle: {
		'preserve-3d': 'preserve-3d',
		},
		backfaceVisibility: {
		'hidden': 'hidden',
		},
		perspective: {
		'1000': '1000px',
		},
		rotateY: {
		'180': '180deg',
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
  			}
  		}
  	}
  	},
  	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }) {
			addUtilities({
				'.perspective-1000': {
				'perspective': '1000px',
				},
				'.backface-hidden': {
				'backface-visibility': 'hidden',
				},
				'.transform-style-preserve-3d': {
				'transform-style': 'preserve-3d',
				},
				'.rotate-y-180': {
				'transform': 'rotateY(180deg)',
				},
			});
		}
	],
};

export default config;
