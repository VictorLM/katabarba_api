import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../products/products.service';
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
import { Shipment, ShippingCompanies, ShippingTypes } from './models/shipment.type';

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
    const foundUserAddress = await this.usersService.getAddressByUserAndErrorIfNotExists(foundUser);
    const products = await this.getOrderProductsById(createOrderDto.products);

    products.forEach(product => this.checkProductAvailability(product));

    // CORREIOS ENTREGA QUALQUER ENDEREÇO? IF ERROR
    // CHECAR ESTOQUE, DISPONIBILIDADE, VALOR, VALOR FRETE
    // UPDATE PRODUCTS STOCK
    // SCHEDULE JOB - IF !PAYMENT CANCEL ORDER AND UPDATE PRODUCTS STOCK
    // Check array unique productIds
    const { shippingCompany, shippingType } = createOrderDto;
    const shipment = await this.getOrderShipment(products, foundUserAddress, shippingCompany, shippingType);
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

  async getOrderProductsById(
    productsIds: ProductOrderType[],
  ): Promise<ProductFullOrderType[]> {
    const products: ProductFullOrderType[] = await Promise.all(
      productsIds.map(async (product) => ({
        product: await this.productsService.getProductById(product.productId),
        quantity: product.quantity,
      })),
    );

    return products;
  }

  checkProductAvailability(orderProduct: ProductFullOrderType) {
    if(!orderProduct.product.available){
      throw new BadRequestException(`Produto "${orderProduct.product.name}" indisponível`);
    }
    if(orderProduct.product.stock < orderProduct.quantity){
      throw new BadRequestException(
        `Sem estoque. Restam apenas "${orderProduct.product.stock}" unidades do produto "${orderProduct.product.name}" em estoque`
      );
    }
  }

  async getOrderShipment( // DEPLOY SHIPMENT MODULEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
    products: ProductFullOrderType[],
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

  getOrderTotalPrice(
    orderProducts: ProductFullOrderType[],
    shippingTax: number
  ) {
    //
  }

}
