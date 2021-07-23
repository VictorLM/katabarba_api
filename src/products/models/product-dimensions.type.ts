// TODO - Class Validator e Tranform NestedValues each
export class ProductDimensions {
  // centimeters
  length: number;
  width: number;
  height: number;
};

export class OrderDimensions extends ProductDimensions {
  constructor(
    length: number,
    width: number,
    height: number,
  ) {
    super();
    this.length = length;
    this.width = width;
    this.height = height;
  }
};

