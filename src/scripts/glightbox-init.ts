import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.css';

let lightbox: any;

export function initGLightbox() {
  if (lightbox) {
    lightbox.destroy();
  }

  lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: false,
    zoomable: true,
    openEffect: 'fade',
    closeEffect: 'fade',
    descPosition: 'bottom',
    // preload: false,
  });
}

document.addEventListener('DOMContentLoaded', initGLightbox);
document.addEventListener('astro:after-swap', initGLightbox);
