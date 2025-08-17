/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { Mongoose } from "mongoose";

declare global {
  var mongooseCache: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

export {};
