import { initConfigurador } from './configurador.js';

document.addEventListener('DOMContentLoaded', () => {
  initConfigurador().catch(err => {
    console.error('Error al inicializar el configurador:', err);
  });
});
