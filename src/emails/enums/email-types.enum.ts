export enum EmailTypes {
  // ORDERS
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_PAYED = 'ORDER_PAYED',
  ORDER_SHIPPED = 'ORDER_SHIPPED', // TODO
  ORDER_PAYMENT_REMINDER = 'ORDER_PAYMENT_REMINDER', // TODO
  // PRODUCTS - CRON
  PRODUCT_AVAILABLE = 'PRODUCT_AVAILABLE',

  // TODO?
  // Os tipos abaixo não tem opção de re-send se error ao enviar

  // USERS
  USER_PASSWORD_RESET = 'USER_PASSWORD_RESET',
  // ERRORS - CRON
  NEW_ERRORS = 'NEW_ERRORS',
  // WARNINGS - CRON
  VALUE_CONFLICT = 'VALUE_CONFLICT',
}
// TODO - NF EMITIDA?
