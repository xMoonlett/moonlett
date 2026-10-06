const moonImage = document.querySelector('.moon-img');

if (moonImage) {
  const defaultSrc = moonImage.dataset.default || moonImage.src;
  const hoverSrc = moonImage.dataset.hover || defaultSrc;

  moonImage.addEventListener('mouseenter', () => {
    moonImage.src = hoverSrc;
  });

  moonImage.addEventListener('mouseleave', () => {
    moonImage.src = defaultSrc;
  });

  moonImage.addEventListener('focus', () => {
    moonImage.src = hoverSrc;
  });

  moonImage.addEventListener('blur', () => {
    moonImage.src = defaultSrc;
  });
}
