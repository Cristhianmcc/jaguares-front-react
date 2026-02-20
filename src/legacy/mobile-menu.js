export function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenuBtn || !mobileMenu) return () => {};

  const onToggle = () => {
    mobileMenu.classList.toggle('hidden');
  };

  const onDocClick = (e) => {
    if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.add('hidden');
    }
  };

  const onResize = () => {
    if (window.innerWidth >= 1024) {
      mobileMenu.classList.add('hidden');
    }
  };

  mobileMenuBtn.addEventListener('click', onToggle);
  document.addEventListener('click', onDocClick);
  window.addEventListener('resize', onResize);

  return () => {
    mobileMenuBtn.removeEventListener('click', onToggle);
    document.removeEventListener('click', onDocClick);
    window.removeEventListener('resize', onResize);
  };
}