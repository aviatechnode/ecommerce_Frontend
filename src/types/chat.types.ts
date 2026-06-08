export const ConversationStatus = {
  OPEN: "OPEN",
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type ConversationStatus =
  (typeof ConversationStatus)[keyof typeof ConversationStatus];

export const ConversationPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type ConversationPriority =
  (typeof ConversationPriority)[keyof typeof ConversationPriority];

export const ConversationChannel = {
  CHAT: "CHAT",
  EMAIL: "EMAIL",
  WHATSAPP: "WHATSAPP",
} as const;

export type ConversationChannel =
  (typeof ConversationChannel)[keyof typeof ConversationChannel];

export const ConversationRole = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  AGENT: "AGENT",
} as const;

export type ConversationRole =
  (typeof ConversationRole)[keyof typeof ConversationRole];

export const MessageType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  FILE: "FILE",
  SYSTEM: "SYSTEM",
} as const;

export type MessageType =
  (typeof MessageType)[keyof typeof MessageType];

///////////////////////////////////////////////////////////
// USERS
///////////////////////////////////////////////////////////

export interface User {
  id: string;
  name: string | null;
  email: string;
}

///////////////////////////////////////////////////////////
// ATTACHMENTS
///////////////////////////////////////////////////////////

export interface MessageAttachment {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  extension: string | null;
  size: number;
}

///////////////////////////////////////////////////////////
// MESSAGE
///////////////////////////////////////////////////////////

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;

  type: MessageType;

  content: string | null;

  replyToId: string | null;

  isInternal: boolean;
  isEdited: boolean;

  deletedAt: string | null;

  attachments: MessageAttachment[];

  sender: User | null;

  replyTo?: {
    id: string;
    content: string | null;
    sender: {
      name: string | null;
    };
  } | null;

  reads: {
    readAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
}

///////////////////////////////////////////////////////////
// PARTICIPANTS
///////////////////////////////////////////////////////////

export interface ConversationParticipant {
  id: string;

  userId: string;

  roleInConversation: ConversationRole;

  unreadCount: number;

  isMuted: boolean;

  user: User;
}

///////////////////////////////////////////////////////////
// CONVERSATION
///////////////////////////////////////////////////////////

export interface Conversation {
  id: string;

  customerId: string | null;

  assignedAdminId: string | null;

  orderId: string | null;

  shipmentId: string | null;

  returnRequestId: string | null;

  subject: string | null;

  status: ConversationStatus;

  priority: ConversationPriority;

  channel: ConversationChannel;

  isLocked: boolean;

  lastMessage: string | null;

  lastMessageAt: string | null;

  createdAt: string;

  updatedAt: string;

  resolvedAt: string | null;

  closedAt: string | null;

  customer: User | null;

  assignedAdmin: User | null;

  participants: ConversationParticipant[];

  tags: {
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }[];

  unreadCount: number;

  isMuted: boolean;
}