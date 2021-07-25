import { ProductBoxDimensions } from "../../products/models/product-dimensions.interface";

export class OrderBoxDimensions extends ProductBoxDimensions {
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
