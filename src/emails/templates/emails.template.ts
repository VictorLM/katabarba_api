import { PasswordResetTokenDocument } from "../../auth/models/password-reset-token.schema";
import { AppErrorDocument } from "../../errors/models/app-error.schema";
import { OrderDocument } from "../../orders/models/order.schema";
import { ProductAvailableNotificationDocument } from "../models/product-available-notification.schema";
import { get } from 'lodash';

// TODO - DEFINIR COM JOW

function objectToKeyValue(object: any): string {
  let html = '';
  if(typeof object === 'object') {
    Object.keys(object).forEach((obj) => {
      html = html + `
        <p><b>${obj}:</b> <code>${object[obj]}</code></p>
      `;
    });
  }
  return html;
}

// TODO - ORDERS > ADD VALOR FRETE E TOTAL PRICE AO FINAL DA LISTA DE PRODUTOS
// ORDERS
export function getCreateOrderHTML(order: OrderDocument): string {
  let html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
    <h2>Recebemos seu pedido e estamos aguardando a confirmação do pagamento.</h2>
    <br/>`;

  html = html + getOrderItemsHTML(order);

  html = html + `</body></html>`;

  return html;
}

export function getPayedOrderHTML(order: OrderDocument): string {
  let html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
  <h2>Recebemos o pagamento do seu pedido.</h2>
  <br/>
  <h3>Estamos processando algumas informações e logo seu pedido será enviado.</h3>
    <p>Não se preocupe, você receberá um novo e-mail quando seu pedido for despachado, contendo o código de rastreamento.</p>
    <br/>`;

  html = html + getOrderItemsHTML(order);

  html = html + `</body></html>`;

  return html;
}

export function getShippedOrderHTML(order: OrderDocument): string {
  let html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
    <h2>Seu pedido foi enviado.</h2>
    <br/>
    <h3>Seu código de rastreamento é: ${order.shipment.trackingCode}</h3>
    <p>
      Acompanhe o envio através do
      <a href="https://www2.correios.com.br/sistemas/rastreamento/">
        site dos Correios
      </a>
      .
    </p>
    <br/>`;

  html = html + getOrderItemsHTML(order);

  html = html + `</body></html>`;

  return html;
}

export function getOrderPaymentReminderHTML(order: OrderDocument, appUrl: string): string {
  let html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
    <h2>Estamos aguardando o pagamento referente ao seu pedido.</h2>
    <br/>
    <h3>
      Para prosseguir com o pagamento,
      <a href="${appUrl}/pedidos/${order._id}/pagar">
        clique aqui
      </a>
      .
    </h3>
    <p>Caso já tenha efetuado o pagamento, por favor, desconsidere esse e-mail.</p>
    <br/>`;

  html = html + getOrderItemsHTML(order);

  html = html + `</body></html>`;

  return html;
}

function getOrderItemsHTML(order: OrderDocument): string {
  let html = `
    <p>Veja os detalhes do seu pedido:</p>
    <p><b>ITENS</b></p>
    <br/>`;

  order.productsAndQuantities.forEach(productAndQuantity => {
    html = html + `
    <p><b>${productAndQuantity.quantity} x - ${productAndQuantity.product.name}</b></p>
    <p>R$ ${productAndQuantity.product.price * productAndQuantity.quantity}</p>
    <hr/>
    `;
  });

  return html;
}

// ERRORS
export function getErrorsEmailHTML(errors: AppErrorDocument[]): string {
  let html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
    <h2>Alerta! Errors não tratados na aplicação:</h2>
    <br/>`;

    errors.forEach((error) => {
      html = html + `
      <h3>${error.action}</h3>
      ${objectToKeyValue(error.error)}
      <hr/>
      `;
    });

  html = html + `</body></html>`;

  return html;
}

// PRODUCT AVAILABLE NOTIFICATION

export function getProductAvailableNotificationEmailHTML(
  // Product populated
  productAvailableNotification: ProductAvailableNotificationDocument,
  appUrl: string,
): string {
  console.log(productAvailableNotification);
  let html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
    <h2>O produto que você está esperando está disponível agora.</h2>
    <br/>
    <h3>
      <a href="${appUrl}/produtos/${productAvailableNotification.product}">
        ${productAvailableNotification.product.name}
      </a>
    </h3>
    <p>Corra para nossa loja virtual e dê uma olhada!</p>
    <br/>`;

  html = html + `</body></html>`;

  return html;
}

// ORDER X PAYMENT CONFLICT

export function getOrderPaymentConflictEmailHTML(
  // Payment populated
  payedOrdersWithConflict: OrderDocument[],
): string {
  let html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
    <h2>Alerta! Conflitos nos valores dos Pedidos x Pagamentos:</h2>
    <br/>`;

    payedOrdersWithConflict.forEach(pQWC => {
      html = html + `
        <h3><b>Pedido ID: </b>${pQWC._id}</h3>
        <p><b>Valor total do Pedido: </b> R$ ${pQWC.totalPrice}</p>
        <p><b>Valor total do Pagamento: </b> R$ ${pQWC.payment.productsAmount + pQWC.payment.shippingAmount}</p>
        <hr/>
      `;
    });

  html = html + `</body></html>`;

  return html;
}

// USER PASSWORD RESET

export function getPasswordResetEmailHTML(
  // User populated
  passwordResetTokenDocument: PasswordResetTokenDocument,
  appUrl: string,
): string {
  const html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
    <h2>Foi solicitada a redefinição da sua senha.</h2>
    <h3>
      Para prosseguir com a refinição de senha
      <a href="${appUrl}/auth/redefinir-senha/${get(passwordResetTokenDocument, 'user._id', '123')}/${passwordResetTokenDocument.token}">
        clique aqui.
      </a>
    </h3>
    <p>PS: Este link expira em uma hora.</p>
    <p>Caso você não tenha feito esta solicitação, recomendamos que troque sua senha.</p>
    </body></html>`;

  return html;
}
