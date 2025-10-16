((Drupal, once) => {
  Drupal.behaviors.tclogin = {
    attach: function (context) {
      once('tcloginModal', '#loginModal', context).forEach(modal => {
        const myModal = new bootstrap.Modal(modal);

        // Helper to load form via AJAX into the correct tab
        function loadForm(tabName) {
          const tabPane = modal.querySelector(`#${tabName}`);
          if (!tabPane) return;

          // Optionally skip reloading if already loaded:
          if (tabPane.dataset.loaded === "1") return;

          // Show spinner
          tabPane.innerHTML = '<div class="ajax-form-loading text-center py-5"><div class="spinner-border"></div></div>';

          const ajaxSettings = {
            url: Drupal.url('modal/tclogin/' + tabName),
            base: tabPane,
            progress: { type: 'throbber' },
            success: function(response) {
              for (const command of response) {
                if (command.command === 'insert' && command.selector === `#${tabName}`) {
                  tabPane.innerHTML = command.data;
                  Drupal.attachBehaviors(tabPane);
                  tabPane.dataset.loaded = "1";
                  break;
                }
              }
            },
            error: function(xhr, status, error) {
              tabPane.innerHTML = '<p>An error occurred. Please try again.</p>';
            }
          };
          Drupal.ajax(ajaxSettings).execute();
        }

        // On modal show, load the login form by default
        modal.addEventListener('shown.bs.modal', function () {
          loadForm('login');
        });

        // Tab switching logic for AJAX forms
        modal.querySelectorAll('[data-bs-toggle="tab"]').forEach(tabBtn => {
          tabBtn.addEventListener('shown.bs.tab', function (e) {
            const target = this.getAttribute('data-bs-target').replace('#', '');
            loadForm(target);
          });
        });

        // Open modal from any trigger
        document.querySelectorAll('[data-bs-target="#loginModal"]').forEach(openModalButton => {
          openModalButton.addEventListener('click', (e) => {
            e.preventDefault();
            myModal.show();
          });
        });
      });
    }
  };
})(Drupal, once);
