import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/models/product.schema';
import { AddressDocument } from '../users/models/address.schema';
import { UserDocument } from '../users/models/user.schema';
import { UsersService } from '../users/users.service';
import {
  CreateOrderDto,
  ProductOrderType,
  ProductFullOrderType,
} from './dto/order.dto';
import { OrderStatus } from './models/order-status.enum';
import { Order, OrderDocument } from './models/order.schema';
import { ShippingCompanies } from './models/shipping-companies.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private ordersModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>,
    private usersService: UsersService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    user: UserDocument,
  ): Promise<void> {
    const foundUser = await this.usersService.getUserById(user._id);
    const foundUserAddress = await this.usersService.getAddressByUserAndErrorIfNotExists(user);
    const products = await this.getOrderProductsById(createOrderDto.products);
    this.checkProductsAvailability(products);

    // CORREIOS ENTREGA QUALQUER ENDEREÇO? IF ERROR
    // CHECAR ESTOQUE, DISPONIBILIDADE, VALOR, VALOR FRETE
    const shippingTax = await this.getOrderShippingTax(foundUserAddress);
    const totalPrice = this.getOrderTotalPrice(products, shippingTax);

    // const newOrder = new this.ordersModel({
    //   user: foundUser._id,
    //   products,
    //   shipAddress: foundUserAddress,
    //   shippingTax,
    //   shippingCompany: ShippingCompanies.CORREIOS, // Por enquanto
    //   status: OrderStatus.AWAITING_PAYMENT,
    //   totalPrice,
    // });

    // try{
    //   return await newOrder.save();

    // } catch(error) {
    //   console.log(error);
    //   throw new InternalServerErrorException('Erro ao processar novo pedido. Por favor, tente novamente mais tarde');
    // }
  }

  async getOrderProductsById(
    productsIds: ProductOrderType[],
  ): Promise<ProductFullOrderType[]> {
    const products: ProductFullOrderType[] = await Promise.all(
      productsIds.map(async (product) => ({
        product: await this.productsModel.findById(product.productId),
        quantity: product.quantity,
      })),
    );

    return products;
  }

  checkProductsAvailability(orderProducts: ProductFullOrderType[]) {
    //
  }

  async getOrderShippingTax(userAddress: AddressDocument) {
    // PEGAR NOSSO ENDEREÇO DO DB
    return Promise.resolve(25);
  }

  getOrderTotalPrice(
    orderProducts: ProductFullOrderType[],
    shippingTax: number
  ) {
    //
  }

}
