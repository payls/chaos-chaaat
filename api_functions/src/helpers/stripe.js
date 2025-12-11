class StripeHelper {
  constructor() {}

  /**
   * Description
   * Function to get forst product reference ID in stripe payload
   * @method
   * @name getFirstProductReference
   * @kind method
   * @memberof StripeHelper
   * @param {any} payload
   * @returns {any}
   */
  getFirstProductReference(payload) {
    if (typeof payload !== 'object' || payload === null) return null;

    // Check if the object has a 'product' key
    if (payload.product) {
      return payload.product;
    }

    // Recursively search in arrays and nested objects
    for (const key in payload) {
      if (Object.hasOwn(payload, key)) {
        const result = this.getFirstProductReference(payload[key]);
        if (result) return result;
      }
    }

    return null; // Return null if no 'product' key is found
  }
}
module.exports = StripeHelper;
