/**
 * Global
 *
 */

'use strict';


/**
 * Non-global
 *
 */
;
(function () {
  "use strict";

  /**
   * Function
   * init function
   */
  const ready = function () {

    // If the body element and the #main element exist
    if (document.body && document.querySelector('#map01')) {
      // Run your code here...

      // Return so that we don't call requestAnimationFrame() again
      return;
    }

    // If the body element isn't found, run ready() again at the next pain
    window.requestAnimationFrame(ready);
  };

  // Initialize our ready() function
  window.requestAnimationFrame(ready);


})();