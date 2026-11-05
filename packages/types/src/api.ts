import type {
  DataEnvelope,
  IsoDate,
  NotificationType,
} from './common';

/**
 * Wire DTOs mirror current backend B route output; dates are JSON ISO strings.
 * shortcut: this covers the documented B operations only; add A/C DTOs when their full contract is approved.
 */
export type ApiApplicationStatus =
  | 'SUBMITTED' | 'STALE' | 'ACCEPTED' | 'REJECTED' | 'AUTO_REJECTED' | 'WITHDRAWN' | 'SUPERSEDED';
export type ApiProjectStatus = 'SCHEDULED' | 'RECRUITING' | 'SELECTING' | 'ACCEPTED' | 'CONTRACTED' | 'EXPIRED';
export type ApiContractStatus = 'PENDING_CONSENT' | 'ACTIVE' | 'CANCEL_REQUESTED' | 'COMPLETED' | 'CANCELLED';
export type ApiPaymentStatus = 'PENDING' | 'DEPOSITED' | 'PARTIALLY_RELEASED' | 'RELEASED' | 'REFUNDED';
export type ApiInstallmentStage = 'INTERIM' | 'FINAL';
export type ApiConditionState = 'DECIDED' | 'PROPOSED' | 'UNDECIDED';
export type ApiBlockOrigin = 'FIRST_SENTENCE' | 'CHAT' | 'RECOMMENDATION' | 'DEFAULT_DRAFT' | 'AGREEMENT';
export type ApiReportReason = 'CONTACT_OR_OFFSITE' | 'ABUSE' | 'FALSE_INFO' | 'OTHER';
export type ApiReportAction = 'NONE' | 'WARNING' | 'CHAT_RESTRICT_7D' | 'SUSPEND';
export type ApiReportStatus = 'OPEN' | 'RESOLVED';
export type ApiInquiryCategory = 'USAGE' | 'PAYMENT' | 'INSPECTION' | 'CANCEL' | 'ACCOUNT' | 'OTHER';
export type ApiInquiryStatus = 'WAITING' | 'ANSWERED';

export interface ApplicationRecordDto {
  id: string;
  projectId: string;
  clientUserId: string;
  supplierId: string;
  revisionNo: number;
  specVersionNo: number;
  status: ApiApplicationStatus;
  totalAmount: number;
  durationDays: number;
  firstViewedAt: IsoDate;
  submittedAt: IsoDate;
}

export interface ApplicationRevisionDto extends ApplicationRecordDto {
  message: string | null;
  questions: { text: string }[];
  isMessageMasked: boolean;
  revisionReason: string | null;
  items: { specItemId: string; isAvailable: boolean }[];
}

export interface SupplierApplicationCardDto {
  applicationId: string;
  supplierId: string;
  revisionNo: number;
  totalAmount: number;
  durationDays: number;
  questionCount: number;
  revisionCount: number;
  submittedAt: IsoDate;
  careerYears: number | null;
  ratingAvg: number | null;
  reviewCount: number;
  completedContractCount: number;
  portfolioSummary: string | null;
}

export interface ApplicationStatusResultDto {
  status: ApiApplicationStatus;
}

export interface RemoveBookmarkResultDto {
  removed: boolean;
}

export interface OpenChatResultDto {
  opened: boolean;
}

export interface ReviseApplicationResultDto {
  previous: ApplicationRevisionDto;
  current: ApplicationRevisionDto;
}

export interface HopeBudgetRangeDto {
  minKrw: number;
  maxKrw: number;
}

export interface PublicProjectSummaryDto {
  id: string;
  title: string;
  summary: string;
  industryCode: string;
  requiredSkills: string[];
  hopeBudgetRange: HopeBudgetRangeDto | null;
  deadline: IsoDate | null;
  status: ApiProjectStatus;
  publishedAt: IsoDate | null;
  currentSpecVersion: number;
  specItemCount: number;
  specItemTitles: string[];
}

/** A API: supplier project detail after NDA consent. Includes current INCLUDED spec ids. */
export interface SupplierProjectItemDto {
  specItemId: string;
  title: string;
  description: string;
  conditions: unknown;
  wireframe: unknown;
}

export interface SupplierProjectClientDto {
  name: string | null;
  businessName: string;
  industryField: string | null;
  storeAddress: string | null;
  bio: string | null;
  websiteUrl: string | null;
  ratingAvg: number | null;
  reviewCount: number;
}

export interface SupplierProjectDetailDto {
  projectId: string;
  title: string;
  industryCode: string;
  requiredSkills: string[];
  status: ApiProjectStatus;
  deadline: IsoDate | null;
  itemCount: number;
  hopeBudgetBand: string | null;
  summary: string;
  hopeBudget: number | null;
  items: SupplierProjectItemDto[];
  client: SupplierProjectClientDto;
}

/** A API: the fields this client reads from the supplier profile. */
export interface SupplierProfileDto {
  displayName: string;
  ndaAgreedAt: IsoDate | null;
  ndaVersion: string | null;
}

export interface RecommendedProjectDto {
  project: PublicProjectSummaryDto;
  matchedSkills: string[];
}

export interface BookmarkDto {
  supplierId: string;
  projectId: string;
  createdAt: IsoDate;
}

export interface BookmarkListItemDto {
  project: PublicProjectSummaryDto;
  createdAt: IsoDate;
  applicationOpen: boolean;
}

export interface ChatApplicationDto {
  id: string;
  projectId: string;
  clientUserId: string;
  supplierId: string;
  status: ApiApplicationStatus;
  contractStatus: ApiContractStatus | null;
}

export interface ChatMessageDto {
  id: string;
  applicationId: string;
  senderId: string | null;
  kind: 'TEXT' | 'SYSTEM';
  body: string;
  isMasked: boolean;
  readAt: IsoDate | null;
  createdAt: IsoDate;
}

export interface ChatRoomSummaryDto extends ChatApplicationDto {
  projectTitle: string;
  /** Display name of the other party, resolved by the server for the viewer. */
  counterpartDisplayName: string;
  lastMessage: ChatMessageDto | null;
  unreadCount: number;
}

export interface ConversationViewDto {
  messages: ChatMessageDto[];
  unreadCount: number;
}

export interface AgreementConditionDto {
  key: string;
  text: string;
  state: ApiConditionState;
  evidenceMessageIds: string[];
}

export interface AgreementItemDto {
  blockId: string;
  specItemId: string | null;
  title: string;
  stage: ApiInstallmentStage;
  conditions: AgreementConditionDto[];
}

export interface AgreementDraftDto {
  items: AgreementItemDto[];
  interimRatio: number;
  ratioState: ApiConditionState;
  cachedAt: IsoDate;
  lastMessageAt: IsoDate | null;
}

export interface AgreementPreviewDto {
  draft: AgreementDraftDto;
  stale: boolean;
  readOnly: true;
}

export interface ContractItemDto {
  blockId: string;
  title: string;
  description: string;
  origin: ApiBlockOrigin;
  stage: ApiInstallmentStage;
  sortOrder: number;
  conditions: AgreementConditionDto[];
}

export interface ContractRecordDto {
  id: string;
  applicationId: string;
  projectId: string;
  clientUserId: string;
  supplierId: string;
  status: ApiContractStatus;
  specVersionNo: number;
  agreedAmount: number;
  durationDays: number;
  clientFee: number;
  supplierFee: number;
  interimRatio: number;
  consentDeadline: IsoDate;
  contentHash: string;
  clientSignedAt: IsoDate | null;
  supplierSignedAt: IsoDate | null;
  depositDeadline: IsoDate | null;
  paymentStatus: ApiPaymentStatus;
  totalDeposited: number;
  items: ContractItemDto[];
}

export interface ProvisionalContractPlanDto {
  applicationId: string;
  projectId: string;
  specVersionNo: number;
  agreedAmount: number;
  durationDays: number;
  clientFee: number;
  supplierFee: number;
  interimRatio: number;
  consentDeadline: IsoDate;
  contentHash: string;
  items: ContractItemDto[];
}

export interface ConfirmAgreementResultDto {
  contract: ContractRecordDto;
  plan: ProvisionalContractPlanDto;
}

export interface SignContractResultDto {
  contract: ContractRecordDto;
  activated: boolean;
}

export interface BreakContractResultDto {
  broken: boolean;
  contract: ContractRecordDto | null;
  projectStatus: ApiProjectStatus | null;
}

export interface ContractDocumentDto {
  contractId: string;
  contentHash: string;
  status: ApiContractStatus;
  agreedAmount: number;
  clientFee: number;
  supplierFee: number;
  interimRatio: number;
  depositAmount: number;
  supplierPayout: number;
  items: ContractItemDto[];
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  targetUrl: string;
  targetId: string;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: IsoDate;
}

export type NotificationListEnvelopeDto = DataEnvelope<NotificationDto[]> & {
  meta: { unreadCount: number };
};

export interface NotificationReadResultDto {
  isRead: true;
}

export interface UpdatedCountDto {
  updated: number;
}

export interface ReportDto {
  id: string;
  messageId: string;
  reporterId: string;
  targetUserId: string;
  reason: ApiReportReason;
  detail: string | null;
  status: ApiReportStatus;
  action: ApiReportAction | null;
  actionNote: string | null;
  resolvedById: string | null;
  resolvedAt: IsoDate | null;
  createdAt: IsoDate;
}

export interface ResolveReportResultDto {
  report: ReportDto;
  warningReviewRecommended: boolean;
}

export interface InquiryAttachmentDto {
  /** Server-relative path: ^/(?!/)[A-Za-z0-9/_:.-]+$ */
  url: string;
  /** 1..255 characters; no path separators or control characters. */
  name: string;
  /** Integer byte size, from 1 through 10 MiB. */
  size: number;
}

export interface InquiryDto {
  id: string;
  userId: string;
  category: ApiInquiryCategory;
  contractId: string | null;
  title: string;
  body: string;
  attachments: InquiryAttachmentDto[];
  status: ApiInquiryStatus;
  answer: string | null;
  answeredById: string | null;
  answeredAt: IsoDate | null;
  createdAt: IsoDate;
}

export interface ApplicationQuestionDto {
  /** Must contain non-blank text and be at most 500 characters. */
  text: string;
}

export interface ApplicationItemDto {
  /** Must be a unique specItemId from the project's current spec. */
  specItemId: string;
  isAvailable: boolean;
}

export type UpToThree<T> = [] | [T] | [T, T] | [T, T, T];
export type NonEmptyList<T> = [T, ...T[]];

export interface SubmitApplicationRequestDto {
  totalAmount: number;
  durationDays: number;
  /** Optional; null and omitted are accepted and blank text is normalized to null. */
  message?: string | null;
  /** At most 3 questions; each question must be non-blank. */
  questions?: UpToThree<ApplicationQuestionDto>;
  /** Non-empty; must contain an available item from the current spec. */
  items: NonEmptyList<ApplicationItemDto>;
}

export interface ReviseApplicationRequestDto extends SubmitApplicationRequestDto {
  revisionReason: string;
  /** Omit to keep the previous message; send null to clear it. */
  message?: string | null;
  /** Omit to keep the previous questions. */
  questions?: UpToThree<ApplicationQuestionDto>;
}

export interface SendMessageRequestDto {
  body: string;
}

export interface SignContractRequestDto {
  expectedContentHash: string;
}

export interface SubmitReportRequestDto {
  reason: ApiReportReason;
  detail?: string | null;
}

export interface ResolveReportRequestDto {
  action: ApiReportAction;
  actionNote: string;
}

export interface CreateInquiryRequestDto {
  category: ApiInquiryCategory;
  contractId?: string | null;
  title: string;
  body: string;
  /** Up to 3 metadata entries for private uploaded files; file content is sent separately. */
  attachments?: UpToThree<InquiryAttachmentDto>;
}

export interface AnswerInquiryRequestDto {
  answer: string;
}

/** These operations require JSON on the wire but accept no fields. */
export type EmptyJsonObjectDto = Record<string, never>;
export type BApiEmptyJsonBodyOperation =
  | 'withdrawApplication'
  | 'rejectApplication'
  | 'openChat'
  | 'readMessages'
  | 'confirmAgreement'
  | 'declineContract'
  | 'cancelProvisionalContract'
  | 'readNotification'
  | 'readAllNotifications';

/** Request bodies keyed by matching OpenAPI operationId. */
export interface BApiRequestBodies {
  /** A API: only the fields this client sends today. */
  updateSupplierProfile: { ndaConsent?: boolean; displayName?: string };
  withdrawApplication: EmptyJsonObjectDto;
  rejectApplication: EmptyJsonObjectDto;
  submitApplication: SubmitApplicationRequestDto;
  reviseApplication: ReviseApplicationRequestDto;
  openChat: EmptyJsonObjectDto;
  sendMessage: SendMessageRequestDto;
  readMessages: EmptyJsonObjectDto;
  confirmAgreement: EmptyJsonObjectDto;
  signContract: SignContractRequestDto;
  declineContract: EmptyJsonObjectDto;
  cancelProvisionalContract: EmptyJsonObjectDto;
  readNotification: EmptyJsonObjectDto;
  readAllNotifications: EmptyJsonObjectDto;
  submitReport: SubmitReportRequestDto;
  resolveReport: ResolveReportRequestDto;
  createInquiry: CreateInquiryRequestDto;
  answerInquiry: AnswerInquiryRequestDto;
}

/** Query DTOs accepted by the matching handlers. */
export interface BApiQueryParams {
  listRecommendedProjects: { /** Integer cap, from 1 through 50. */ limit?: number };
  listMessages: { /** ISO 8601 date-time cursor. */ after?: IsoDate };
  listNotifications: { /** Only the string value "true" enables the filter. */ unreadOnly?: boolean };
  listMyReports: { status?: ApiReportStatus };
  listReports: { status?: ApiReportStatus };
  listAdminInquiries: { status?: ApiInquiryStatus };
}

/** Response envelopes keyed by openapi/openapi.yaml operationId. */
export interface BApiResponses {
  listProjectApplications: DataEnvelope<SupplierApplicationCardDto[]>;
  submitApplication: DataEnvelope<ApplicationRevisionDto>;
  listMyApplications: DataEnvelope<ApplicationRecordDto[]>;
  getApplication: DataEnvelope<ApplicationRevisionDto>;
  withdrawApplication: DataEnvelope<ApplicationStatusResultDto>;
  rejectApplication: DataEnvelope<ApplicationStatusResultDto>;
  reviseApplication: DataEnvelope<ReviseApplicationResultDto>;
  listBookmarks: DataEnvelope<BookmarkListItemDto[]>;
  saveBookmark: DataEnvelope<BookmarkDto>;
  removeBookmark: DataEnvelope<RemoveBookmarkResultDto>;
  listRecommendedProjects: DataEnvelope<RecommendedProjectDto[]>;
  /** A API operations, kept in this registry so the shared request module can call them. */
  getSupplierProjectDetail: DataEnvelope<SupplierProjectDetailDto>;
  getSupplierProfile: DataEnvelope<SupplierProfileDto | null>;
  updateSupplierProfile: DataEnvelope<unknown>;
  listChatRooms: DataEnvelope<ChatRoomSummaryDto[]>;
  openChat: DataEnvelope<OpenChatResultDto>;
  listMessages: DataEnvelope<ConversationViewDto>;
  sendMessage: DataEnvelope<ChatMessageDto>;
  readMessages: DataEnvelope<UpdatedCountDto>;
  previewAgreement: DataEnvelope<AgreementPreviewDto>;
  confirmAgreement: DataEnvelope<ConfirmAgreementResultDto>;
  listMyContracts: DataEnvelope<ContractRecordDto[]>;
  getContract: DataEnvelope<ContractRecordDto>;
  getContractDocument: DataEnvelope<ContractDocumentDto>;
  signContract: DataEnvelope<SignContractResultDto>;
  declineContract: DataEnvelope<BreakContractResultDto>;
  cancelProvisionalContract: DataEnvelope<BreakContractResultDto>;
  listNotifications: NotificationListEnvelopeDto;
  readNotification: DataEnvelope<NotificationReadResultDto>;
  readAllNotifications: DataEnvelope<UpdatedCountDto>;
  submitReport: DataEnvelope<ReportDto>;
  listMyReports: DataEnvelope<ReportDto[]>;
  listReports: DataEnvelope<ReportDto[]>;
  resolveReport: DataEnvelope<ResolveReportResultDto>;
  createInquiry: DataEnvelope<InquiryDto>;
  listMyInquiries: DataEnvelope<InquiryDto[]>;
  getInquiry: DataEnvelope<InquiryDto>;
  listAdminInquiries: DataEnvelope<InquiryDto[]>;
  answerInquiry: DataEnvelope<InquiryDto>;
}

export type BApiOperationId = keyof BApiResponses;
