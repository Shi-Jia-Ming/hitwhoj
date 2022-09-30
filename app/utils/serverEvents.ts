// TODO 这是服务器全部事件推送服务的中枢！
// 但是目前没法做到边缘化计算，因此只能将网站部署在一台服务器上。
// 如果采用 RabbitMQ 之类的技术，也许可以实现边缘化计算。

import { Subject } from "rxjs";
import type { Record } from "@prisma/client";

export type RecordUpdateMessage = Pick<
  Record,
  "id" | "status" | "score" | "message" | "time" | "memory" | "subtasks"
>;

export const privateMessageSubject = new Subject<number>();
export const chatMessageSubject = new Subject<number>();
export const recordUpdateSubject = new Subject<RecordUpdateMessage>();
export const clarificationResolveSubject = new Subject<number>();
export const clarificationAssignSubject = new Subject<number>();
export const clarificationReplySubject = new Subject<number>();
