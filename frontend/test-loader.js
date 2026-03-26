import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

console.log('Successfully imported all modules from vite.config.js')
console.log('defineConfig:', typeof defineConfig)
console.log('react:', typeof react)
console.log('tailwindcss:', typeof tailwindcss)
