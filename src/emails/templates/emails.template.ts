import { OrderDocument } from "../../orders/models/order.schema";

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

