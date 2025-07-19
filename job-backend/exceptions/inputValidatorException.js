class InputValidationException extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputValidationException';
  }
}

module.exports = InputValidationException;
