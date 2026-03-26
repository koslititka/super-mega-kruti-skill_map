document.addEventListener('DOMContentLoaded', () => {
  const chips = document.querySelectorAll('.chip[data-toggle]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });
});
