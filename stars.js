const starField = document.querySelector('.stars');
for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'starbg';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDelay = (Math.random() * 2) + 's';
    starField.appendChild(star);
}