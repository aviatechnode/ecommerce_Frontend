/* =========================================================
 * ENUMS
 * ======================================================= */

export type ConversationStatus =
  | "OPEN"
  | "PENDING"
  | "WAITING_FOR_CUSTOMER"
  | "WAITING_FOR_SUPPORT"
  | "RESOLVED"
  | "CLOSED";

export type ConversationPriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT";

export type ConversationChannel =
  | "WEB"
  | "MOBILE"
  | "EMAIL"
  | "WHATSAPP"
  | "PHONE";

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "FILE"
  | "AUDIO"
  | "VIDEO"
  | "SYSTEM";

export type MessageDeliveryStatus =
  | "SENT"
  | "DELIVERED"
  | "READ";

export type ConversationEventType =
  | "CONVERSATION_CREATED"
  | "CONVERSATION_ASSIGNED"
  | "CONVERSATION_UNASSIGNED"
  | "CONVERSATION_STATUS_CHANGED"
  | "CONVERSATION_PRIORITY_CHANGED"
  | "CONVERSATION_LOCKED"
  | "CONVERSATION_UNLOCKED"
  | "CONVERSATION_RESOLVED"
  | "CONVERSATION_CLOSED"
  | "CONVERSATION_REOPENED"
  | "CONVERSATION_RATED"
  | "TAG_ADDED"
  | "TAG_REMOVED"
  | "PARTICIPANT_ADDED"
  | "PARTICIPANT_REMOVED"
  | "MESSAGE_SENT"
  | "MESSAGE_EDITED"
  | "MESSAGE_DELETED"
  | "MESSAGE_READ"
  | "ATTACHMENT_ADDED"
  | "INTERNAL_NOTE_CREATED";

/* =========================================================
 * COMMON API RESPONSE
 * ======================================================= */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/* =========================================================
 * USER
 * ======================================================= */

export interface ChatUser {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  roleName?: string;
}

/* =========================================================
 * ATTACHMENTS
 * ======================================================= */

export interface MessageAttachment {
  id: string;

  messageId: string;

  url: string;

  filename: string;

  mimeType: string;

  extension?: string | null;

  size: number;

  uploadedById?: string | null;

  createdAt: string;
}

/* =========================================================
 * MESSAGE
 * ======================================================= */

export interface Message {
  id: string;

  conversationId: string;

  senderId?: string | null;

  sender?: ChatUser | null;

  type: MessageType;

  content?: string | null;

  replyToId?: string | null;

  replyTo?: Message | null;

  orderId?: string | null;

  shipmentId?: string | null;

  returnRequestId?: string |null;

  deliveryStatus: MessageDeliveryStatus;

  deliveredAt?: string | null;

  readAt?: string | null;

  isInternal: boolean;

  isEdited: boolean;

  deletedAt?: string | null;

  attachments: MessageAttachment[];

  createdAt: string;

  updatedAt: string;
}

/* =========================================================
 * PARTICIPANTS
 * ======================================================= */

export interface ConversationParticipant {
  id: string;

  conversationId: string;

  userId: string;

  user?: ChatUser;

  unreadCount: number;

  isMuted: boolean;

  lastReadMessageId?: string | null;

  joinedAt: string;
}

/* =========================================================
 * TAGS
 * ======================================================= */

export interface ConversationTag {
  id: string;

  name: string;

  color?: string | null;

  createdAt: string;
}

export interface ConversationTagPivot {
  id: string;

  conversationId: string;

  tagId: string;

  tag?: ConversationTag;
}

/* =========================================================
 * SLA
 * ======================================================= */

export interface ConversationSLA {
  id: string;

  conversationId: string;

  firstResponseDueAt?: string | null;

  resolutionDueAt?: string | null;

  firstRespondedAt?: string | null;

  resolvedAt?: string | null;

  breachedFirstResponse: boolean;

  breachedResolution: boolean;

  createdAt: string;

  updatedAt: string;
}

/* =========================================================
 * EVENTS
 * ======================================================= */

export interface ConversationEvent {
  id: string;

  conversationId: string;

  actorId?: string | null;

  type: ConversationEventType;

  description?: string | null;

  metadata?: unknown;

  createdAt: string;
}

/* =========================================================
 * CONVERSATION
 * ======================================================= */

export interface Conversation {
  id: string;

  customerId?: string | null;

  assignedUserId?: string | null;

  orderId?: string | null;

  productId?: string | null;

  vehicleId?: string | null;

  subject?: string | null;

  status: ConversationStatus;

  priority: ConversationPriority;

  channel: ConversationChannel;

  firstResponseAt?: string | null;

  resolvedAt?: string | null;

  closedAt?: string | null;

  customerRating?: number | null;

  customerFeedback?: string | null;

  lastMessageId?: string | null;

  lastMessage?: string | null;

  lastMessageAt?: string | null;

  lastMessageById?: string | null;

  isLocked: boolean;

  createdAt: string;

  updatedAt: string;

  messages?: Message[];

  participants?: ConversationParticipant[];

  tags?: ConversationTagPivot[];

  sla?: ConversationSLA | null;

  events?: ConversationEvent[];
}

/* =========================================================
 * DTOs
 * ======================================================= */

export interface CreateConversationPayload {
  customerId?: string;

  assignedUserId?: string;

  orderId?: string;

  productId?: string;

  vehicleId?: string;

  subject?: string;

  status?: ConversationStatus;

  priority?: ConversationPriority;

  channel?: ConversationChannel;

  isLocked?: boolean;
}

export interface CreateFitmentConversationPayload {
  customerId: string;

  productId: string;

  vehicleId: string;

  subject: string;

  initialMessage: string;
}

export interface SendMessagePayload {
  conversationId: string;
  
  type?: MessageType;

  content?: string;

  replyToId?: string;

  orderId?: string;

  shipmentId?: string;

  returnRequestId?: string;

  isInternal?: boolean;

  attachments?: File[];
}
export interface EditMessagePayload {
  messageId: string;

  content: string;
}

export interface DeleteMessagePayload {
  messageId: string;
}

export interface AssignConversationPayload {
  conversationId: string;

  assignedUserId: string;
}

export interface ChangeConversationStatusPayload {
  conversationId: string;

  status: ConversationStatus;
}

export interface ChangeConversationPriorityPayload {
  conversationId: string;

  priority: ConversationPriority;
}

export interface AddParticipantPayload {
  conversationId: string;

  userId: string;
}

export interface RemoveParticipantPayload {
  conversationId: string;

  userId: string;
}

export interface MuteParticipantPayload {
  conversationId: string;

  userId: string;

  isMuted: boolean;
}

export interface AddTagPayload {
  conversationId: string;

  tagId: string;
}

export interface RemoveTagPayload {
  conversationId: string;

  tagId: string;
}

/* =========================================================
 * API RESPONSES
 * ======================================================= */

export type ConversationResponse =
  ApiResponse<Conversation>;

export type MessageResponse =
  ApiResponse<Message>;

export type ConversationsResponse =
  ApiResponse<Conversation[]>;

export type MessagesResponse =
  ApiResponse<Message[]>;

/* =========================================================
 * SOCKET EVENTS
 * ======================================================= */

export interface TypingEvent {
  conversationId: string;

  userId: string;
}

export interface ReadReceiptEvent {
  conversationId: string;

  messageId: string;

  userId: string;
}

export interface StatusChangedEvent {
  conversationId: string;

  status: ConversationStatus;
}

export interface PriorityChangedEvent {
  conversationId: string;

  priority: ConversationPriority;
}

export interface ChatState {
  connected: boolean;

  activeConversationId: string | null;

  typingUsers: string[];

  unreadCounts: Record<string, number>;

  pendingMessages: Message[];

  socketMessages: Record<string, Message[]>;

  onlineUsers: string[];
}