import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity({name: 'texts'})
export class Text {
  @ObjectIdColumn()
  _id: string;

  @Column()
  section: string;

  @Column()
  title: string;

  @Column()
  text: string;
}
