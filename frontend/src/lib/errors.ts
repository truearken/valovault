export class LocalClientError extends Error {
  constructor() {
    super();
    this.message = 'Could not connect to the local client. Please make sure it is running and try again.'
    this.name = 'LocalClientError';
  }
}
