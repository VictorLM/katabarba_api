import { ProductDimensions } from "../../products/models/product-dimensions.type";

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
