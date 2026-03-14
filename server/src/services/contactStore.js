/**
 * Shared in-memory store for contact settings.
 * Both the public GET /api/contact and admin PUT /api/admin/contact-settings
 * operate on the same object so updates are immediately visible.
 */

let data = require('../data/contactSettings.json');

module.exports = {
  get() {
    return { ...data };
  },
  update(partial) {
    data = { ...data, ...partial };
    return { ...data };
  },
};
