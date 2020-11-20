/**
 * Global
 *
 */

'use strict';

window.footerData = () => {
  return {
    pages: [],

    init() {
      this.setBreadcrumb();
    },

    setBreadcrumb() {
      this.pages = ['Settings', 'Blabla', 'Hoi Ruud'];
    },

  }
}