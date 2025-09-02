export class ResponseSuccess<T> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}
