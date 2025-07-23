document.addEventListener('mousemove', function(e) {
  const star = document.createElement('div');
  star.className = 'star-cursor';
  star.style.left = e.clientX + 'px';
  star.style.top = e.clientY + 'px';
  document.body.appendChild(star);

  setTimeout(() => {
    star.remove();
  }, 600);
});
