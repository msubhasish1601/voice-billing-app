import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tells Vite to compile JSX using the React plugin
export default defineConfig({
  plugins: [react()],
});