import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { AddressDocument } from '../addresses/models/address.schema';
import { UserDocument } from '../users/models/user.schema';
import { UsersService } from '../users/users.service';
import { ProductOrder, ProductFullOrder } from '../products/dtos/product.dto';
import { OrderStatuses } from './models/order-statuses.enum';
import { Order, OrderDocument } from './models/order.schema';
// import {
//   Shipment,
//   ShippingCompanies,
//   ShippingTypes,
// } from './models/shipment.type';
import { CreateOrderDto } from './dtos/order.dto';
import { OrderBoxDimensions } from './interfaces/order-dimensions.interface';
import { AddressesService } from '../addresses/addresses.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private ordersModel: Model<OrderDocument>,
    private productsService: ProductsService,
    private usersService: UsersService,
    private addressesService: AddressesService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    user: UserDocument,
  ): Promise<void> {
    const foundUserAddress = await this.addressesService.getAddressByUserAndErrorIfNotExists(user);
    const products = await this.productsService.getProductsAndQuantitiesById(
      createOrderDto.productsIdsAndQuanties,
    );

    this.productsService.checkProductsStockAndAvailability(products);

    // CORREIOS ENTREGA QUALQUER ENDEREÇO? IF ERROR
    // CHECAR ESTOQUE, DISPONIBILIDADE, VALOR, VALOR FRETE
    // UPDATE PRODUCTS STOCK
    // SCHEDULE JOB - IF !PAYMENT CANCEL ORDER AND UPDATE PRODUCTS STOCK
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
    //   status: OrderStatuses.AWAITING_PAYMENT,
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
  // async getOrderShipment(
  //   // DEPLOY SHIPMENT MODULE
  //   products: ProductFullOrder[],
  //   userAddress: AddressDocument,
  //   shippingCompany: ShippingCompanies,
  //   shippingType: ShippingTypes,
  // ): Promise<Shipment> {
  //   // PEGAR NOSSO ENDEREÇO DO DB - DEPLOY NO SERVICE DO SITE MODULE
  //   const shipment = new Shipment();

  //   shipment.shiptAddress = userAddress._id; // GET DB - REFER ID ONLY
  //   shipment.deliveryAddress = userAddress;
  //   shipment.cost = 15.9; //
  //   (shipment.company = shippingCompany), // Por enquanto
  //     (shipment.type = shippingType); //
  //   shipment.shipped = null;
  //   shipment.trackingCode = null;
  //   shipment.statuses = null;

  //   console.log(shipment);

  //   return shipment;
  // }

  getOrderDimensions(
    productsAndQuantities: ProductFullOrder[],
  ): OrderBoxDimensions {
    // Nesse caso, como é um produto apenas, estou só multiplicando a altura do pacote
    // Pois serão enviados empilhados um sobre o outro quando quantidade for maior que 1
    let length = 0;
    let width = 0;
    let height = 0;

    productsAndQuantities.forEach((product) => {
      // Pega o maior comprimento
      length =
        length < product.product.dimensions.productBoxDimensions.length
          ? product.product.dimensions.productBoxDimensions.length
          : length;
      // Pega a maior largura
      width =
        width < product.product.dimensions.productBoxDimensions.width
          ? product.product.dimensions.productBoxDimensions.width
          : width;
      // Soma as alturas
      height =
        height +
        product.quantity *
          product.product.dimensions.productBoxDimensions.height;
    });

    const orderBoxDimensions = new OrderBoxDimensions(length, width, height);
    return orderBoxDimensions;
  }

  getOrderWeight(productsAndQuantities: ProductFullOrder[]): number {
    let orderWeight = 0;
    productsAndQuantities.forEach(
      (product) =>
        (orderWeight = orderWeight + product.quantity * product.product.weight),
    );
    return Math.round(orderWeight * 100) / 100;
  }

  getOrderTotalPrice(orderProducts: ProductFullOrder[], shippingTax: number) {
    //
  }
}
