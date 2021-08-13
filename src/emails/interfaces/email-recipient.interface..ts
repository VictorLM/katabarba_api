import { Types } from "mongoose";

export class EmailRecipient {
  email: string;
  name?: string | null;
  user?: Types.ObjectId | null;
}
