import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { UserDocument } from '../users/models/user.schema';
import { OrderStatuses } from './enums/order-statuses.enum';
import { Order, OrderDocument } from './models/order.schema';
import { CreateOrderDto } from './dtos/order.dto';
import { OrderBoxDimensions } from './interfaces/order-dimensions.interface';
import { AddressesService } from '../addresses/addresses.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { ProductFullOrder } from '../products/dtos/product.dto';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';
import { PaymentDocument } from '../payments/models/payment.schema';
import { PaymentStatuses } from '../payments/enums/payment-statuses.enum';
import { ErrorsService } from '../errors/errors.service';
import { ShipmentDocument } from '../shipments/models/shipment.schema';
import { EmailsService } from '../emails/emails.service';
import { EmailTypes } from '../emails/enums/email-types.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private ordersModel: Model<OrderDocument>,
    private productsService: ProductsService,
    private addressesService: AddressesService,
    @Inject(forwardRef(() => ShipmentsService))
    private shipmentsService: ShipmentsService,
    private mercadoPagoService: MercadoPagoService,
    private errorsService: ErrorsService,
    private emailsService: EmailsService,
  ) {}

  async getOrderById(id: Types.ObjectId): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID do Pedido "${id}" inválido`);
    }
    const foundOrder = await this.ordersModel.findById(id);
    if (!foundOrder) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado`);
    }
    return foundOrder;
  }

  async getOrderByIdAndPopulateUserAndShipment(id: Types.ObjectId): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID do Pedido "${id}" inválido`);
    }
    const foundOrder = await this.ordersModel.findById(id).populate('user').populate('shipment');
    if (!foundOrder) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado`);
    }
    return foundOrder;
  }

  async getPayedOrdersAndPopulatePayments(): Promise<OrderDocument[]> {
    return await this.ordersModel.find({ status: OrderStatuses.PAYMENT_RECEIVED }).populate('payment');
  }

  // TODO - FALAR COM JOW - DATA EXPIRAÇÃO
  async getExpiredOrders(): Promise<OrderDocument[]> {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - 8);

    const orders = await this.ordersModel.find({
      status: OrderStatuses.AWAITING_PAYMENT,
      createdAt: { $lt: expireDate },
    }).populate('payment');

    const expiredOrders: OrderDocument[] = [];

    orders.forEach((order) => {
      if(order.payment) {
        if(order.payment.status !== PaymentStatuses.approved) {
          if(order.payment.expiresIn) {
            if(order.payment.expiresIn < new Date(Date.now())) {
              expiredOrders.push(order);
            }
          } else {
            expiredOrders.push(order);
          }
        }
      } else {
        expiredOrders.push(order);
      }
    });
    return expiredOrders;
  }

  async handleNewOrder(
    createOrderDto: CreateOrderDto,
    user: UserDocument,
  ): Promise<{ mpPreferenceId: string }> {

    const { productsIdsAndQuanties, shippingCompany, shippingType } = createOrderDto;

    const deliveryAddress =
      await this.addressesService.getAddressByUserAndErrorIfNotExists(user);

    const productsAndQuantities =
      await this.productsService.getProductsAndQuantitiesById(
        productsIdsAndQuanties,
      );

    this.productsService.checkProductsStockAndAvailability(productsAndQuantities);

    const newShipment = await this.shipmentsService.createShipment({
      deliveryAddress,
      shippingCompany,
      shippingType,
      productsAndQuantities,
    });

    const orderTotalPrice = this.getOrderTotalPrice(
      productsAndQuantities,
      newShipment.cost,
    );

    const newOrder = await this.createOrder(
      user,
      productsAndQuantities,
      newShipment,
      orderTotalPrice,
    );

    // New Mercado Pago Preference with Order ID as External Reference
    // If fails, deletes the new order and shipment documents
    const mpPreferenceId =
      await this.mercadoPagoService.createPreferenceWithOrderId(
        newOrder,
        newShipment,
      );

    // not await
    this.updateOrderWithMpPreferenceId(newOrder, mpPreferenceId);

    // Update products stock - not await
    this.productsService.updateProductsStockByOrderProductsAndQuantities(
      productsAndQuantities,
    );

    // Send email - not await
    this.emailsService.sendEmail({
      document: newOrder,
      type: EmailTypes.ORDER_CREATE,
      recipients: newOrder.user,
      relatedTo: newOrder._id,
    });

    return { mpPreferenceId };
  }

  async createOrder(
    user: UserDocument,
    productsAndQuantities: ProductFullOrder[],
    shipment: ShipmentDocument,
    totalPrice: number,
  ): Promise<OrderDocument> {

    const newOrder = new this.ordersModel({
      user,
      productsAndQuantities,
      shipment,
      totalPrice,
      status: OrderStatuses.AWAITING_PAYMENT,
    });

    try {
      return await newOrder.save();

    } catch (error) {
      console.log(error);
      await shipment.delete();

      // Log error into DB - not await
      this.errorsService.createAppError(
        user._id,
        'OrdersService.createOrder',
        error,
        newOrder,
      );

      throw new InternalServerErrorException(
        'Erro ao processar novo pedido. Por favor, tente novamente mais tarde',
      );
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

  getOrderTotalPrice(
    orderProducts: ProductFullOrder[],
    shippingTax: number,
  ): number {
    let orderTotalPrice = 0;
    orderProducts.forEach(
      (product) =>
        (orderTotalPrice =
          orderTotalPrice + product.quantity * product.product.price),
    );
    return orderTotalPrice + shippingTax;
  }

  async updateOrderWithMpPreferenceId(
    order: OrderDocument,
    mpPreferenceId: string,
  ): Promise<void> {
    order.mpPreferenceId = mpPreferenceId;
    try {
      await order.save();

    } catch(error) {
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'OrdersService.updateOrderWithMpPreferenceId',
        error,
        order,
      );
    }
  }

  async updateOrderWithPaymentData(payment: PaymentDocument): Promise<void> {
    // GAMB VIOLENTA - Não sei porque o type do campo Order está pegando o Objeto não o ObjectId
    const foundOrder = await this.getOrderByIdAndPopulateUserAndShipment(
      Types.ObjectId(String(payment.order)),
    );
    // Pode ser que o primeiro pagamento seja rejeitado e um segundo aprovado
    // Desta forma vai ser mantido o vínculo com o mais novo
    foundOrder.payment = payment._id;

    // TODO - CHANGES SERVICE

    if (payment.status === PaymentStatuses.approved) {
      foundOrder.status = OrderStatuses.PAYMENT_RECEIVED;
      // Send email - not await
      this.emailsService.sendEmail({
        document: foundOrder,
        type: EmailTypes.ORDER_PAYED,
        recipients: foundOrder.user,
        relatedTo: foundOrder._id,
      });
    }

    try {
      await foundOrder.save();

    } catch(error) {
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'OrdersService.updateOrderWithPaymentData',
        error,
        foundOrder,
      );

      throw new InternalServerErrorException();
    }
  }

}
