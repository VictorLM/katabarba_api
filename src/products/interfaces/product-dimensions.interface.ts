// TODO - Class Validator e Tranform NestedValues each
export class ProductDimensions {
  // centimeters
  length: number;
  width: number;
  height: number;
};

export class ProductBoxDimensions extends ProductDimensions {};

export class ProductAndBoxDimensions {
  productDimensions: ProductDimensions;
  productBoxDimensions: ProductBoxDimensions;
}
