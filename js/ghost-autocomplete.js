document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('input.form-autocomplete').forEach(function (input) {
    // Create ghost text overlay
    const ghost = document.createElement('span');
    ghost.className = 'ghost-text-autocomplete';
    ghost.style.position = 'absolute';
    ghost.style.color = '#aaa';
    ghost.style.pointerEvents = 'none';
    ghost.style.userSelect = 'none';
    ghost.style.zIndex = '10';
    ghost.style.whiteSpace = 'pre';
    ghost.style.fontSize = getComputedStyle(input).fontSize;
    ghost.style.fontFamily = getComputedStyle(input).fontFamily;
    ghost.style.paddingLeft = getComputedStyle(input).paddingLeft;

    // Setup wrapper for relative positioning
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(ghost);

    // Helper: update ghost position & size
    function syncGhost() {
      ghost.style.left = input.offsetLeft + 'px';
      ghost.style.top = input.offsetTop + 'px';
      ghost.style.width = input.offsetWidth + 'px';
      ghost.style.height = input.offsetHeight + 'px';
    }
    window.addEventListener('resize', syncGhost);
    input.addEventListener('focus', syncGhost);

    // Helper: get autocomplete path
    const autocompletePath =
      input.getAttribute('data-autocomplete-path') ||
      input.dataset.autocompletePath;

    // Main: fetch suggestions and update ghost text
    input.addEventListener('input', function () {
      const val = input.value;
      ghost.textContent = '';
      ghost.style.display = 'none';
      if (!val || !autocompletePath) return;

      fetch(autocompletePath + '?q=' + encodeURIComponent(val), {
        credentials: 'same-origin',
      })
        .then((response) => response.json())
        .then((data) => {
          if (
            Array.isArray(data) &&
            data.length &&
            data[0].value &&
            data[0].value.toLowerCase().startsWith(val.toLowerCase()) &&
            data[0].value.toLowerCase() !== val.toLowerCase()
          ) {
            // Show the remainder as ghost text
            ghost.textContent =
              val + data[0].value.substring(val.length);
            ghost.style.display = 'block';
            syncGhost();
          } else {
            ghost.style.display = 'none';
          }
        })
        .catch(() => {
          ghost.style.display = 'none';
        });
    });

    // On Tab or ArrowRight, fill input with ghost text
    input.addEventListener('keydown', function (e) {
      if (
        (e.key === 'Tab' || e.key === 'ArrowRight') &&
        ghost.style.display === 'block' &&
        ghost.textContent
      ) {
        e.preventDefault();
        input.value = ghost.textContent;
        ghost.style.display = 'none';
        input.dispatchEvent(new Event('input'));
      }
    });

    // Hide ghost on blur
    input.addEventListener('blur', function () {
      ghost.style.display = 'none';
    });
  });
});
