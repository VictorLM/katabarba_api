import { Column, Entity, ObjectIdColumn, PrimaryColumn } from "typeorm";

@Entity({ name: 'users'})
export class User {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  cpf: string;

  @Column()
  orders: string[];

  @Column()
  address: string[];

  @Column()
  createAt: Date;

  @Column()
  updatedAt: Date;

}
