import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { UserDocument } from '../users/models/user.schema';
import { OrderStatuses } from './models/order-statuses.enum';
import { Order, OrderDocument } from './models/order.schema';
import { CreateOrderDto } from './dtos/order.dto';
import { OrderBoxDimensions } from './interfaces/order-dimensions.interface';
import { AddressesService } from '../addresses/addresses.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { ProductFullOrder } from '../products/dtos/product.dto';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private ordersModel: Model<OrderDocument>,
    private productsService: ProductsService,
    private addressesService: AddressesService,
    @Inject(forwardRef(() => ShipmentsService))
    private shipmentsService: ShipmentsService,
    private mercadoPagoService: MercadoPagoService,
  ) {}

  async createOrderAndGetMpPreferenceId(
    createOrderDto: CreateOrderDto,
    user: UserDocument,
  ): Promise<{ mpPreferenceId: string }> {
    const foundUserAddress = await this.addressesService.getAddressByUserAndErrorIfNotExists(user);
    const productsAndQuantities = await this.productsService.getProductsAndQuantitiesById(
      createOrderDto.productsIdsAndQuanties,
    );
    this.productsService.checkProductsStockAndAvailability(productsAndQuantities);
    const { shippingCompany, shippingType } = createOrderDto;

    const newShipment = await this.shipmentsService.createShipment({
      deliveryAddress: foundUserAddress,
      shippingCompany,
      shippingType,
      productsAndQuantities,
    });

    const orderTotalPrice = this.getOrderTotalPrice(productsAndQuantities, newShipment.cost);

    const newOrder = new this.ordersModel({
      user,
      productsAndQuantities,
      shippment: newShipment,
      totalPrice: orderTotalPrice,
      status: OrderStatuses.AWAITING_PAYMENT,
    });

    try {
      await newOrder.save();

      // NEW MP PREFERENCE WITH ORDER ID
      const mpPreferenceId = await this.mercadoPagoService.createPreferenceWithOrderId(newOrder);

      newOrder.mpPreferenceId = mpPreferenceId.mpPreferenceId;

      await newOrder.save();

      return mpPreferenceId;

    } catch(error) {
      // TODO - ERRO DB > E-MAIL - ESSE ERRO É URGENTE DE SER VERIFICADO
      console.log(error);
      // TODO - ABORTS?
      throw new InternalServerErrorException('Erro ao processar novo pedido. Por favor, tente novamente mais tarde');
    }


  }

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

  getOrderTotalPrice(orderProducts: ProductFullOrder[], shippingTax: number): number  {
    let orderTotalPrice = 0;
    orderProducts.forEach(
      (product) =>
        (orderTotalPrice = orderTotalPrice + product.quantity * product.product.price),
    );
    return orderTotalPrice + shippingTax;
  }

}
