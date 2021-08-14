import { OrderDocument } from "../../orders/models/order.schema";

// TODO - DEFINIR COM JOW
export function getCreateOrderHTML(order: OrderDocument): string {
  let html =`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <body>
    <h2>Recebemos seu pedido e estamos aguardando a confirmação do pagamento.</h2>
    <br/>
    <h3>Veja os detalhes do seu pedido:</h3>
    <p><b>ITENS</b></p>
    <br/>`;

  order.productsAndQuantities.forEach(productAndQuantitie => {
    html = html + `
    <p><b>${productAndQuantitie.quantity} x - ${productAndQuantitie.product.name}</b></p>
    <p>R$ ${productAndQuantitie.product.price * productAndQuantitie.quantity}</p>
    <hr/>
    `;
  });

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
    <br/>
    <p>Veja os detalhes do seu pedido:</p>
    <p><b>ITENS</b></p>
    <br/>`;

  order.productsAndQuantities.forEach(productAndQuantitie => {
    html = html + `
    <p><b>${productAndQuantitie.quantity} x - ${productAndQuantitie.product.name}</b></p>
    <p>R$ ${productAndQuantitie.product.price * productAndQuantitie.quantity}</p>
    <hr/>
    `;
  });

  html = html + `</body></html>`;

  return html;
}

