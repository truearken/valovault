export class LocalClientError extends Error {
  constructor() {
    this.message = 'Could not connect to the local client. Please make sure it is running and try again.'
    super(message);
    this.name = 'LocalClientError';
  }
}
