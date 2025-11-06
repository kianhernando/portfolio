// scroll effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

// ------------------------------------------------------------------

// typing animation
const name = document.getElementById("typed");
const words = [" a Developer", " an Engineer", " Kian Hernando"];
let text = 0;
let char = 0;
let typing = true;
let finished = false;

function type() {
    if (finished) return;
    const currentText = words[text];

    if (typing) {
        if (char < currentText.length) {
            name.textContent += currentText.charAt(char);
            char++;
            setTimeout(type, 150);
        } else {
            typing = false;
            if (text == words.length - 1) {
                finished = true;
                return;
            }
            setTimeout(type, 2000);
        }
    } else {
        if (char > 0) {
            name.textContent = currentText.substring(0, char - 1);
            char--;
            setTimeout(type, 100);
        } else {
            typing = true;
            text = (text + 1) % words.length;
            setTimeout(type, 1000);
        }
    }
}

type();

// ------------------------------------------------------------------

// carousel animation
document.querySelectorAll(".carousel").forEach(carousel => {
    const images = Array.from(carousel.children);
    for (let i = 0; i < 4; i++) {
        images.forEach(img => {
            const clone = img.cloneNode(true);
            carousel.appendChild(clone);
        });
    }
});
