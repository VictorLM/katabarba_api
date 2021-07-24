import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { AddressDocument } from '../addresses/models/address.schema';
import { UserDocument } from '../users/models/user.schema';
import { UsersService } from '../users/users.service';
import { ProductOrder, ProductFullOrder } from '../products/dtos/product.dto';
import { OrderStatus } from './models/order-status.enum';
import { Order, OrderDocument } from './models/order.schema';
import { Shipment, ShippingCompanies, ShippingTypes } from './models/shipment.type';
import { CreateOrderDto } from './dtos/order.dto';
import { OrderDimensions } from './interfaces/order-dimensions.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private ordersModel: Model<OrderDocument>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    user: UserDocument,
  ): Promise<void> {
    const foundUser = await this.usersService.getUserById(user._id);
    // const foundUserAddress = await this.usersService.getAddressByUserAndErrorIfNotExists(foundUser);
    const products = await this.productsService.getProductsAndQuantitiesById(createOrderDto.productsIdsAndQuanties);

    this.productsService.checkProductsStockAndAvailability(products);

    // CORREIOS ENTREGA QUALQUER ENDEREÇO? IF ERROR
    // CHECAR ESTOQUE, DISPONIBILIDADE, VALOR, VALOR FRETE
    // UPDATE PRODUCTS STOCK
    // SCHEDULE JOB - IF !PAYMENT CANCEL ORDER AND UPDATE PRODUCTS STOCK
    // Check array unique productIds
    const { shippingCompany, shippingType } = createOrderDto;
    // const shipment = await this.getOrderShipment(products, foundUserAddress, shippingCompany, shippingType);
    ///////////////// FAZER PAYMENT MODEL SEPARADO
    // const totalPrice = this.getOrderTotalPrice(products, shipment);

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
      // TODO - ERRO DB > E-MAIL - ESSE ERRO É URGENTE DE SER VERIFICADO
    //   console.log(error);
    //   throw new InternalServerErrorException('Erro ao processar novo pedido. Por favor, tente novamente mais tarde');
    // }
  }

  // MOVE TO SHIPMENTS SERVICE
  async getOrderShipment( // DEPLOY SHIPMENT MODULE
    products: ProductFullOrder[],
    userAddress: AddressDocument,
    shippingCompany: ShippingCompanies,
    shippingType: ShippingTypes
  ): Promise<Shipment> {
    // PEGAR NOSSO ENDEREÇO DO DB - DEPLOY NO SERVICE DO SITE MODULE
    const shipment = new Shipment();

    shipment.shiptAddress = userAddress._id; // GET DB - REFER ID ONLY
    shipment.deliveryAddress = userAddress;
    shipment.cost = 15.90; //
    shipment.company = shippingCompany, // Por enquanto
    shipment.type = shippingType; //
    shipment.shipped = null;
    shipment.trackingCode = null;
    shipment.statuses = null;

    console.log(shipment);

    return shipment;
  }

  getOrderDimensions(productsAndQuantities: ProductFullOrder[]): OrderDimensions {
    // Nesse caso, como é um produto apenas, estou só multiplicando a altura do pacote
    // Pois serão enviados empilhados um sobre o outro quando quantidade for maior que 1
    let length = 0;
    let width = 0;
    let height = 0;

    productsAndQuantities.forEach(product => {
      // Pega o maior comprimento
      length = length < product.product.dimensions.length ? product.product.dimensions.length : length;
      // Pega a maior largura
      width = width < product.product.dimensions.width ? product.product.dimensions.width : width;
      // Soma as alturas
      height = height + (product.quantity * product.product.dimensions.height);
    });

    const orderDimensions = new OrderDimensions(length, width, height);
    return orderDimensions;
  }

  getOrderWeight(productsAndQuantities: ProductFullOrder[]): number {
    let orderWeight = 0;
    productsAndQuantities.forEach(product =>
      orderWeight = orderWeight + (product.quantity * product.product.weight),
    );
    return Math.round(orderWeight * 100) / 100;
  }

  getOrderTotalPrice(
    orderProducts: ProductFullOrder[],
    shippingTax: number
  ) {
    //
  }

}
