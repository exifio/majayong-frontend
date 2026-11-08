import type {
  DataEnvelope,
  IsoDate,
  NotificationType,
  Role,
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
  /** D-38 추가 필드. 구 응답과 호환되도록 optional로 둔다. */
  supplierName?: string | null;
  revisionNo: number;
  totalAmount: number;
  clientFee?: number;
  depositAmount?: number;
  firstRevisionAmount?: number;
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
  businessName: string | null;
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

/** A API: client's own project row (GET /me/projects). */
export interface MyProjectDto {
  projectId: string;
  title: string;
  status: ApiProjectStatus;
  displayState: string;
  deadline: IsoDate | null;
  selectionEndsAt: IsoDate | null;
  currentVersion: number;
  applicationCount: number;
  detailViewCount: number;
}

export interface MyProjectDetailItemDto {
  specItemId: string;
  title: string;
  description: string;
  conditions: unknown;
  wireframe: unknown;
}

export interface MyProjectDetailDto extends MyProjectDto {
  summary: string;
  industryCode: string;
  requiredSkills: string[];
  hopeBudget: number | null;
  hopeBudgetBand: string | null;
  recruitStartAt: IsoDate | null;
  items: MyProjectDetailItemDto[];
}

export type ApiDraftEntryType = 'SENTENCE' | 'DEFAULT_DRAFT';
export type ApiDraftStatus = 'IN_PROGRESS' | 'ABANDONED' | 'CONFIRMED';
export type ApiDraftBlockStatus = 'ADDED' | 'REMOVED';
export type ApiDisclosureScope = 'FULL' | 'DETAIL';

export interface DraftBlockDto {
  id: string;
  blockId: string;
  origin: ApiBlockOrigin;
  status: ApiDraftBlockStatus;
  unitPrice: number;
  pricedAt: IsoDate;
  conditionNotes: { key: string; note: string; at: string }[] | null;
  sortOrder: number;
  block: {
    id: string;
    code: string;
    name: string;
    functionSummary: string;
    description: string;
    conditions: { key: string; text: string }[];
    wireframe: unknown;
    unitPrice: number;
  };
}

export interface DraftDto {
  id: string;
  entryType: ApiDraftEntryType;
  status: ApiDraftStatus;
  hopeBudget: number | null;
  chatEditCount: number;
  pendingFeatures: { key: string; summary: string; attempts: number; lastTriedAt: string | null }[];
  firstInputAt: IsoDate;
  renderedAt: IsoDate | null;
  lastActiveAt: IsoDate;
  createdAt: IsoDate;
  utterances: { id: string; kind: 'FIRST_SENTENCE' | 'CHAT'; content: string; createdAt: IsoDate }[];
  blocks: DraftBlockDto[];
}

export interface DraftRecommendationDto {
  id: string;
  name: string;
  functionSummary: string;
}

export interface PublishedProjectDto {
  projectId: string;
  title: string;
  summary: string;
  currentVersion: number;
  status: ApiProjectStatus;
  itemCount: number;
}

/* ── 초안·프로젝트 ── */
/** GET /drafts/{draftId}/price-report — 의뢰인 본인 초안만. 확정된 초안은 409 DRAFT_ALREADY_CONFIRMED. */
export interface PriceReportItemDto {
  blockId: string;
  name: string;
  status: 'ADDED' | 'REMOVED' | 'SUGGESTED';
  unitPrice: number;
  /** 근거 한 문자열(줄바꿈으로 나뉜 3줄: 들어간 작업 / 작업량 기준 / 달라질 수 있는 것) */
  priceBasis: string;
  includedInEstimate: boolean;
  /** 포함 항목 합계 대비 비중(소수 1자리), 제외 항목은 0 */
  sharePercent: number;
}

export interface PriceReportDto {
  subtotal: number;
  clientFee: number;
  estimatedTotal: number;
  pendingFeatureCount: number;
  items: PriceReportItemDto[];
}

/** POST /drafts/{draftId}/apply-estimate — 본문 없음. 희망 예산을 예상 총액으로 바꾼다. */
export interface ApplyEstimateResultDto {
  hopeBudget: number;
  estimatedTotal: number;
}

/** POST /projects/{projectId}/extend-deadline — 기존 마감 이후 14일 이내, RECRUITING · SELECTING · EXPIRED만. */
export interface ExtendDeadlineResultDto {
  projectId: string;
  deadline: IsoDate;
  status: ApiProjectStatus;
}

/** Public supplier profile (GET /profiles/suppliers/{supplierId}). */
export interface SupplierPublicProfileDto {
  supplierId: string;
  name: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  displayName: string;
  createdAt: IsoDate;
  industryCodes: string[];
  skills: string[];
  careerYears: number | null;
  ratingAvg: number | null;
  reviewCount: number;
  completedContractCount: number;
  portfolioSummary: string | null;
  portfolioItems: { type: 'LINK' | 'FILE'; title?: string; url: string }[];
}

/** A API: one public project card (GET /projects). */
export interface PublicProjectListItemDto {
  projectId: string;
  title: string;
  industryCode: string;
  requiredSkills: string[];
  status: ApiProjectStatus;
  deadline: IsoDate | null;
  itemCount: number;
  hopeBudgetBand: string | null;
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
  /** D-38: 합의 시점 견적 금액·수수료·예치액. 구 응답과 호환되도록 optional. */
  quote?: {
    totalAmount: number;
    durationDays: number;
    clientFee: number;
    depositAmount: number;
  } | null;
}

export interface ContractItemDto {
  id: string;
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
  /** D-38 추가 필드. 구 응답과 호환되도록 optional로 둔다. */
  projectTitle?: string | null;
  counterpartName?: string | null;
  displayStatus?: ApiContractDisplayStatus;
  reviewWrittenByMe?: boolean;
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

export type ApiContractDisplayStatus =
  | 'SIGNING' | 'COUNTERPART_SIGNATURE_PENDING' | 'AWAITING_DEPOSIT' | 'IN_PROGRESS'
  | 'INSPECTION_DUE' | 'WORK_OVERDUE' | 'CONTRACT_COMPLETED'
  | 'CANCEL_IN_PROGRESS' | 'CONTRACT_CANCELLED';

/** `GET /me/contracts`·`GET /contracts/{id}` 응답. 계약 저장 필드 + 표시용 파생 필드. */
export interface ContractViewDto extends ContractRecordDto {
  projectTitle: string | null;
  counterpartName: string | null;
  displayStatus: ApiContractDisplayStatus;
  reviewWrittenByMe: boolean;
  installments?: Array<{ stage: ApiInstallmentStage; status: string }>;
}

export type ApiCancelCause = 'CLIENT' | 'SUPPLIER' | 'MUTUAL';
export type ApiCancelResolution = 'AGREED' | 'ADMIN_DECIDED';

export interface CancellationDto {
  contractId: string;
  status: string;
  cancelCause: ApiCancelCause | null;
  cancelRequestedBy: string | null;
  cancelRequestedAt: IsoDate | null;
  cancelNote: string | null;
  /** 요청 때 고른 근거 메시지. 근거 없이 요청하면 null. */
  cancelEvidence: CancelEvidenceDto | null;
  objectionRate: number | null;
  objectionNote: string | null;
  cancelEscalatedAt: IsoDate | null;
  compensationRate: number | null;
  cancelResolution: ApiCancelResolution | null;
  cancelResolvedAt: IsoDate | null;
  refundAmount: number | null;
  settledAmount: number | null;
  clientFeeRefund: number | null;
  refundReason: string | null;
  refundedAt: IsoDate | null;
  cancelPayoutAt: IsoDate | null;
  paused: boolean;
}

export interface CancelEvidenceDto {
  messageIds: string[];
}

export type ApiDepositStatus = 'PENDING' | 'HELD' | 'COMPLETED' | 'FAILED';

export interface EscrowDepositDto {
  id: string;
  contractId: string;
  principal: number;
  clientFee: number;
  amount: number;
  method: string;
  status: ApiDepositStatus;
  idempotencyKey: string;
  pgKey: string | null;
  depositedAt: IsoDate | null;
  createdAt: IsoDate;
  heldReason: string | null;
}

export interface CreateDepositResultDto {
  deposit: EscrowDepositDto;
  isNew: boolean;
}

/** 예치 승인 응답의 계약 — BE `DepositContractInfo`(deposit/index.ts) 축약형.
 * 전체 계약(ContractRecordDto)이 아니다: supplierId·items가 없고 공급자는 supplierUserId다. 화면은 계약을 다시 조회해 쓴다. */
export interface DepositConfirmContractDto {
  id: string;
  projectId?: string;
  applicationId?: string;
  clientUserId: string;
  supplierUserId: string;
  status: ApiContractStatus;
  paymentStatus: ApiPaymentStatus;
  agreedAmount: number;
  clientFee: number;
  interimRatio?: number | null;
  durationDays?: number | null;
  depositDeadline: IsoDate | null;
  totalDeposited?: number;
  workDueAt?: IsoDate | null;
}

export interface ConfirmDepositResultDto {
  deposit: EscrowDepositDto;
  contract: DepositConfirmContractDto;
  installments: PaymentInstallmentDto[];
}

export type ReviewerRole = 'CLIENT' | 'SUPPLIER';

export interface PublicReviewDto {
  id: string;
  rating: number;
  comment: string | null;
  tags: string[];
  reviewerRole: ReviewerRole;
  reviewerDisplayName: string;
  createdAt: IsoDate;
}

export interface ReviewDto {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: ReviewerRole;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: IsoDate;
}

export type ApiInstallmentStatus = 'PENDING' | 'DELIVERED' | 'REWORK_REQUESTED' | 'APPROVED' | 'RELEASED' | 'REFUNDED';

export interface PaymentInstallmentDto {
  stage: ApiInstallmentStage;
  status: ApiInstallmentStatus;
  amount: number;
  releaseAmount?: number;
  supplierFee?: number;
  withholdingTax?: number;
  taxInvoiceIssuedAt?: IsoDate | null;
  releasedAt: IsoDate | null;
}

export interface ClientPaymentStatementDto {
  simulated: true;
  transferNote: string;
  contractId: string;
  totalDeposited: number;
  paidToSupplier: number;
  remainingDeposit: number;
  clientFeePaid: number;
  installments: PaymentInstallmentDto[];
}

export interface SupplierPaymentStatementDto {
  simulated: true;
  transferNote: string;
  contractId: string;
  totalAgreed: number;
  totalReceived: number;
  expectedToReceive: number;
  supplierFeePaid: number;
  withholdingTaxTotal: number;
  installments: PaymentInstallmentDto[];
}

export type PaymentStatementDto = ClientPaymentStatementDto | SupplierPaymentStatementDto;

export interface PaymentStatementsDto {
  simulated: true;
  transferNote: string;
  statements: PaymentStatementDto[];
}

export type ApiBusinessType = 'BUSINESS' | 'INDIVIDUAL';

/* ── 계정·프로필 ── */
export type ApiPortfolioItem = { type: 'LINK' | 'FILE'; url: string; title?: string };
export type ApiPortfolioSummaryStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

/** GET /me — 계정 기본 정보. 로그인 수단(구글 연결·비밀번호 유무)은 돌려주지 않는다. */
export interface MeDto {
  id: string;
  email: string;
  role: Role;
  name: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  termsVersion: string | null;
  termsAgreedAt: IsoDate | null;
  createdAt: IsoDate;
}

/** GET/PATCH /me/client-profile. 프로필 행이 없으면 data는 null. */
export interface MyClientProfileDto {
  name: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  businessName: string | null;
  industryField: string | null;
  storeAddress: string | null;
  websiteUrl: string | null;
  profileCompleted: boolean;
}

/** GET/PATCH /me/supplier-profile. 프로필 행이 없으면 data는 null. */
export interface MySupplierProfileDto {
  name: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  displayName: string;
  industryCodes: string[];
  skills: string[];
  careerYears: number | null;
  /** 저장된 JSON 그대로 — FILE의 url은 비공개 저장소 경로다. */
  portfolioItems: ApiPortfolioItem[] | null;
  portfolioSummary: string | null;
  portfolioSummaryStatus: ApiPortfolioSummaryStatus | null;
  portfolioConsentAt: IsoDate | null;
  ndaAgreedAt: IsoDate | null;
  ndaVersion: string | null;
  businessType: ApiBusinessType | null;
  bizRegNoMasked: string | null;
  payoutBank: string | null;
  payoutAccountMasked: string | null;
  payoutHolder: string | null;
  payoutVerifiedAt: IsoDate | null;
  ratingAvg: number | null;
  reviewCount: number;
}

/** GET /projects/{projectId}/client-profile — 공급자 전용, NDA 동의와 명세 상세 열람 후. 열람 기록이 남는다. */
export interface ClientProjectProfileDto {
  name: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  businessName: string;
  industryField: string | null;
  storeAddress: string | null;
  websiteUrl: string | null;
  createdAt: IsoDate;
  ratingAvg: number | null;
  reviewCount: number;
  recruitingProjectCount: number;
}

export interface UpdateClientProfileRequestDto {
  name?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  businessName?: string | null;
  industryField?: string | null;
  storeAddress?: string | null;
  websiteUrl?: string | null;
}

export interface UpdateSupplierProfileRequestDto {
  name?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  displayName?: string;
  industryCodes?: string[];
  /** 최대 40개, 각 100자 이하. */
  skills?: string[];
  /** 0~80 정수. */
  careerYears?: number | null;
  /** 최대 30개. LINK는 https만, FILE은 본인 portfolio 경로만. 바꾸면 요약·요약 동의가 초기화된다. */
  portfolioItems?: ApiPortfolioItem[] | null;
  portfolioConsent?: boolean;
  ndaConsent?: boolean;
}

export interface TaxInfoResultDto {
  businessType?: ApiBusinessType | null;
  bizRegNoMasked: string | null;
  taxInvoiceEmail: string | null;
}

export interface PayoutAccountResultDto {
  bank: string;
  accountMasked: string | null;
  holder: string;
  verifiedAt: IsoDate | null;
}

export interface ContractInstallmentDto {
  id: string;
  stage: ApiInstallmentStage;
  ratio: number;
  amount: number;
  status: ApiInstallmentStatus;
  approvedAt: IsoDate | null;
  releasedAt: IsoDate | null;
  holdReason: string | null;
}

export interface ContractInstallmentsDto {
  simulated: true;
  transferNote: string;
  installments: ContractInstallmentDto[];
}

export interface DeliveryFileDto {
  fileId: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface DeliveryItemDto {
  contractItemId: string;
  links: string[];
  files: DeliveryFileDto[];
  howToCheck: string;
}

export interface DeliveryDto {
  id: string;
  installmentId: string;
  attemptNo: number;
  items: DeliveryItemDto[];
  summary: string | null;
  status: string;
  submittedAt: IsoDate;
  inspectionDueAt: IsoDate;
  reviewedAt: IsoDate | null;
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

export interface ContractArticleDto {
  id: string;
  heading: string;
  paragraphs: string[];
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
  /** D-38: 법률 검토 문안. 구 응답과 호환되도록 optional로 둔다. */
  articles?: ContractArticleDto[];
  articlesVersion?: string;
  articlesDraft?: boolean;
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

export interface ReportPartyDto {
  id: string;
  role: 'CLIENT' | 'SUPPLIER' | 'ADMIN';
  displayName: string | null;
}

export interface ReportMessageContextDto {
  body: string;
  createdAt: IsoDate;
  projectId: string;
  projectTitle: string;
}

/** 관리자 목록(`GET /admin/reports`) 전용. 운영자 판단에 필요한 표시명·문맥을 포함한다. */
export interface AdminReportDto extends ReportDto {
  reporter: ReportPartyDto;
  target: ReportPartyDto;
  message: ReportMessageContextDto;
}

export interface AdminBlockConditionDto {
  key: string;
  text: string;
}

/** 관리자 블록 검토(`GET /admin/blocks`). */
export interface AdminBlockDto {
  id: string;
  title: string;
  unitPrice: number;
  isActive: boolean;
  mergedIntoId: string | null;
  description: string;
  functionSummary: string;
  industryCode: string;
  industryLabel?: string;
  techTags: string[];
  conditions: AdminBlockConditionDto[];
  priceBasis: string;
  source: string;
  reviewedAt: IsoDate | null;
  createdAt: IsoDate;
  sourceProjectCount: number;
}

export type AdminBlockAction = 'UPDATE_PRICE' | 'MERGE' | 'DISABLE' | 'ENABLE';

export interface ExecuteAdminBlockActionRequestDto {
  action: AdminBlockAction;
  reason: string;
  unitPrice?: number;
  mergedIntoId?: string;
}

export interface AdminBlockActionResultDto {
  success: boolean;
  blockId: string;
  action: string;
}

export type ApiDisputeDecision = 'REWORK_VALID' | 'APPROVE' | 'UNDECIDED_CONDITION';

export interface AdminInspectionConditionDto {
  key: string;
  text: string;
  state: string;
}

export interface AdminInspectionClaimDto {
  requestedBy: string | null;
  what: string | null;
  client: string;
  supplier: string;
  evidence: { type: string; ref: string }[];
}

export interface AdminInspectionHistoryDto {
  id: string;
  reason: string;
  conditionKey: string | null;
  note: string | null;
  status: string;
  deliveryAttemptNo: number;
  createdAt: IsoDate;
  resolvedAt: IsoDate | null;
  decision: string | null;
}

export interface AdminDeliveryInfoDto {
  id: string;
  attemptNo: number;
  summary: string | null;
  items: unknown;
  submittedAt: IsoDate;
}

export interface AdminEscalatedInspectionDto {
  id: string;
  contractItemId: string;
  deliveryId: string;
  status: 'ESCALATED' | 'OPEN' | 'RESOLVED';
  reason: string;
  decision?: ApiDisputeDecision;
  decisionNotes?: { client: string; supplier: string };
  contractId: string;
  projectTitle: string;
  itemTitle: string;
  itemDescription: string;
  clientName: string | null;
  supplierName: string | null;
  agreedAmount: number;
  clientFee: number;
  interimRatio: number;
  conditions: AdminInspectionConditionDto[];
  escalation: AdminInspectionClaimDto | null;
  history: AdminInspectionHistoryDto[];
  delivery: AdminDeliveryInfoDto | null;
  createdAt: IsoDate;
  resolvedAt: IsoDate | null;
}

export interface DecideInspectionDisputeRequestDto {
  decision: ApiDisputeDecision;
  reason: string;
  decisionNotes: { client: string; supplier: string };
}

/* ── 운영자(admin-ops) ── */
/** `GET /admin/deposits/held`. 백엔드는 HELD만 돌려주고 heldReason은 현재 빈 문자열일 수 있다. */
export interface AdminHeldDepositDto {
  id: string;
  contractId: string;
  amount: number;
  status: 'HELD' | 'COMPLETED' | 'FAILED';
  heldReason: string;
}

export type AdminHeldDepositDecision = 'OPERATOR_CONFIRMED' | 'OPERATOR_VOIDED';

export interface ResolveHeldDepositRequestDto {
  decision: AdminHeldDepositDecision;
  reason: string;
  /** OPERATOR_CONFIRMED는 PG 재조회용 paymentKey가 필요하다. */
  paymentKey?: string;
}

/** `GET /admin/contracts/cancellation-queue` — CANCEL_REQUESTED 계약. */
export interface AdminCancellationContractDto {
  id: string;
  status: string;
  /** CancelCause. 값이 없으면 빈 문자열. */
  cancelCause: ApiCancelCause | '';
  totalDeposited: number;
  agreedAmount: number;
  clientFee: number;
  /** 요청 단계에서는 요청자가 제안한 비율, 판정 후에는 확정 비율. */
  compensationRate?: number | null;
  cancelResolution?: 'ADMIN_DECIDED' | null;
  cancelResolvedAt?: IsoDate | null;
  refundAmount?: number | null;
  settledAmount?: number | null;
  clientFeeRefund?: number | null;
  refundedAt?: IsoDate | null;
  cancelPayoutAt?: IsoDate | null;
  depositedAt?: IsoDate | null;
  cancelRequestedAt?: IsoDate | null;
  cancelEscalatedAt?: IsoDate | null;
  /** 공급자 이의 시 요구 보상 비율. */
  objectionRate?: number | null;
  installmentStatuses?: string[];
}

export interface DecideCancellationRequestDto {
  /** 0~100 정수. 의뢰인 사정(전액 환불 구간 제외)은 50 이상. */
  compensationRate: number;
  reason: string;
}

export interface MarkSettlementProcessedRequestDto {
  refunded: boolean;
  cancelPayout: boolean;
  reason: string;
}

/** `GET /admin/event-logs`. 전후 값은 응답에 없다. */
export interface AdminEventLogDto {
  id: string;
  actorUserId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  reason: string;
  occurredAt: IsoDate;
}

export interface AdminEventLogQueryDto {
  actorUserId?: string;
  actionType?: string;
  targetType?: string;
  targetId?: string;
  /** ISO 8601 */
  from?: IsoDate;
  /** ISO 8601 */
  to?: IsoDate;
}

export interface InquiryAttachmentDto {
  /** 신규 업로드 첨부. 구버전 응답에는 없을 수 있다. */
  fileId?: string;
  /** Server-relative path: ^/(?!/)[A-Za-z0-9/_:.-]+$ */
  url: string;
  /** 1..255 characters; no path separators or control characters. */
  name: string;
  /** Integer byte size, from 1 through 10 MiB. */
  size: number;
}

export interface CreateInquiryAttachmentDto {
  fileId: string;
  name: string;
  size: number;
}

export interface InquiryDto {
  id: string;
  userId: string;
  /** D-38: 운영자 목록에서만 채워지는 문의자 표시명. */
  authorName?: string | null;
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

export interface InspectionSummaryItemDto {
  contractItemId: string;
  title: string;
  stage: ApiInstallmentStage;
  approved: boolean;
  autoApproved: boolean;
  latestDeliveryStatus: string | null;
  openInspectionCount: number;
  escalatedCount: number;
}

export interface InspectionSummaryDto {
  contractId: string;
  totalItems: number;
  approvedItems: number;
  pendingItems: number;
  openInspectionItems: number;
  escalatedItems: number;
  installments: Array<{
    installmentId: string;
    stage: ApiInstallmentStage;
    status: string;
    items: InspectionSummaryItemDto[];
  }>;
}

export type SettlementSummaryDto =
  | {
      simulated: true;
      transferNote: string;
      role: 'CLIENT';
      contractCount: number;
      totals: {
        totalDeposited: number;
        paidToSupplier: number;
        remainingDeposit: number;
        clientFeePaid: number;
      };
    }
  | {
      simulated: true;
      transferNote: string;
      role: 'SUPPLIER';
      contractCount: number;
      totals: {
        totalAgreed: number;
        totalReceived: number;
        expectedToReceive: number;
        supplierFeePaid: number;
        withholdingTaxTotal: number;
      };
    };

export interface NotificationSettingsDto {
  contract: boolean;
  chat: boolean;
  recruiting: boolean;
  review: boolean;
  support: boolean;
  marketing: boolean;
}

export interface AdminMenuCountsDto {
  blocksPending: number;
  heldDeposits: number;
  escalatedInspections: number;
  cancellationQueue: number;
  reportsPending: number;
  inquiriesWaiting: number;
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
  attachments?: UpToThree<CreateInquiryAttachmentDto>;
}

export interface AnswerInquiryRequestDto {
  answer: string;
}

interface PresignUploadFileDto {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/** 문의 첨부는 계약 없이, 납품 파일은 담당 공급자의 contractId와 함께 요청한다. */
export type PresignUploadRequestDto =
  | (PresignUploadFileDto & { purpose: 'SUPPORT_INQUIRY'; inquiryId?: string })
  | (PresignUploadFileDto & { purpose: 'DELIVERY'; contractId: string })
  | (PresignUploadFileDto & { purpose: 'PROFILE_IMAGE'; contractId?: never; inquiryId?: never });

export interface PresignUploadResponseDto {
  fileId: string;
  uploadUrl: string;
  objectKey: string;
  expiresInSec: number;
}

export interface PresignDownloadResponseDto {
  downloadUrl: string;
  expiresInSec: number;
}

/* ── 계약 흐름 ── */
export type ApiInspectionReason = 'CONDITION_MISMATCH' | 'NOT_WORKING' | 'MISSING_PART' | 'OTHER';
export type ApiInspectionStatus = 'OPEN' | 'RESOLVED' | 'ESCALATED';

/** GET/POST 보완 요청(`/contract-items/{id}/rework-requests`) 한 건. */
export interface InspectionRequestDto {
  id: string;
  deliveryId: string;
  contractItemId: string;
  reason: ApiInspectionReason;
  conditionKey: string | null;
  note: string | null;
  status: ApiInspectionStatus;
  escalatedAt: IsoDate | null;
  resolvedAt?: IsoDate | null;
  createdAt: IsoDate;
}

export interface EscalateInspectionRequestDto {
  reason: string;
  what: string;
  claims?: { client: string; supplier: string };
  evidence?: unknown;
}

export interface RequestCancellationRequestDto {
  cause: ApiCancelCause;
  note: string;
  /** 1개 이상일 때만 보낸다. 빈 목록은 서버가 거부한다. */
  evidence?: CancelEvidenceDto;
  /** MUTUAL일 때 필수, 0~100 정수. */
  proposedCompensationRate?: number;
}

export interface ObjectCancellationRequestDto {
  objectionRate: number;
  note: string;
}

/** 취소 요청·동의·이의 응답. 서버는 계약의 취소 관련 필드를 그대로 돌려준다. */
export type CancellationUpdateDto = Partial<CancellationDto> & {
  id: string;
  status: ApiContractStatus;
};

export interface TaxInvoiceIssuedResultDto {
  id: string;
  stage: ApiInstallmentStage;
  status: ApiInstallmentStatus;
  taxInvoiceIssuedAt: IsoDate | null;
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
  | 'readAllNotifications'
  | 'retryDraft'
  | 'restoreDraft'
  | 'withdrawCancellation'
  | 'agreeCancellation'
  | 'markTaxInvoiceIssued';

/** Request bodies keyed by matching OpenAPI operationId. */
export interface BApiRequestBodies {
  /* ── 계정·프로필 ── */
  updateSupplierProfile: UpdateSupplierProfileRequestDto;
  updateClientProfile: UpdateClientProfileRequestDto;
  changePassword: { currentPassword?: string; newPassword: string };
  updateNotificationSettings: NotificationSettingsDto;
  requestEmailChange: { email: string };
  disconnectGoogle: { password: string };
  updateClientTaxInfo: { bizRegNo?: string | null; taxInvoiceEmail?: string | null };
  updateSupplierTaxInfo: {
    businessType?: ApiBusinessType | null;
    bizRegNo?: string | null;
    taxInvoiceEmail?: string | null;
  };
  updatePayoutAccount: { bank: string; accountNo: string; holder: string };
  verifyPayoutAccount: { code: string };
  submitDelivery: { items: DeliveryItemDto[]; summary?: string };
  approveContractItem: { deliveryId: string };
  requestRework: {
    deliveryId: string;
    reason: ApiInspectionReason;
    /** CONDITION_MISMATCH이면 필수이며 DECIDED 조건 키여야 한다. */
    conditionKey?: string;
    note: string;
  };
  createReview: {
    rating: number;
    comment?: string;
    tags?: string[];
  };
  withdrawApplication: EmptyJsonObjectDto;
  rejectApplication: EmptyJsonObjectDto;
  submitApplication: SubmitApplicationRequestDto;
  reviseApplication: ReviseApplicationRequestDto;
  openChat: EmptyJsonObjectDto;
  sendMessage: SendMessageRequestDto;
  readMessages: EmptyJsonObjectDto;
  confirmAgreement: EmptyJsonObjectDto;
  createDeposit: { amount: number; method: string; idempotencyKey: string };
  confirmDeposit: { paymentKey: string; amount: number };
  signContract: SignContractRequestDto;
  declineContract: EmptyJsonObjectDto;
  cancelProvisionalContract: EmptyJsonObjectDto;
  withdrawCancellation: EmptyJsonObjectDto;
  /* ── 계약 흐름 ── */
  requestCancellation: RequestCancellationRequestDto;
  agreeCancellation: EmptyJsonObjectDto;
  objectCancellation: ObjectCancellationRequestDto;
  escalateInspection: EscalateInspectionRequestDto;
  markTaxInvoiceIssued: EmptyJsonObjectDto;
  readNotification: EmptyJsonObjectDto;
  readAllNotifications: EmptyJsonObjectDto;
  createDraft: { entryType: ApiDraftEntryType; text?: string };
  editDraftChat: { text: string };
  addDraftBlock: { blockId: string };
  updateConditionNote: { key: string; note: string };
  updateHopeBudget: { hopeBudget: number | null };
  /* ── 초안·프로젝트 ── */
  extendProjectDeadline: { deadline: IsoDate };
  publishDraft: {
    recruitStartAt?: IsoDate;
    deadline: IsoDate;
    disclosureConsentVersion: string;
    disclosureScope: ApiDisclosureScope;
    disclosureConsent: true;
  };
  retryDraft: EmptyJsonObjectDto;
  restoreDraft: EmptyJsonObjectDto;
  submitReport: SubmitReportRequestDto;
  resolveReport: ResolveReportRequestDto;
  createInquiry: CreateInquiryRequestDto;
  answerInquiry: AnswerInquiryRequestDto;
  presignUpload: PresignUploadRequestDto;
  executeAdminBlockAction: ExecuteAdminBlockActionRequestDto;
  decideInspectionDispute: DecideInspectionDisputeRequestDto;
  /* ── 운영자(admin-ops) ── */
  resolveHeldDeposit: ResolveHeldDepositRequestDto;
  decideCancellation: DecideCancellationRequestDto;
  markSettlementProcessed: MarkSettlementProcessedRequestDto;
}

/** Query DTOs accepted by the matching handlers. */
export interface BApiQueryParams {
  listPublicProjects: {
    industryCode?: string;
    skill?: string;
    keyword?: string;
    sort?: 'LATEST' | 'DEADLINE_SOON' | 'BUDGET_HIGH';
    deadlineBefore?: IsoDate;
    status?: ApiProjectStatus;
    minBudget?: number;
    maxBudget?: number;
    page?: number;
  };
  listRecommendedProjects: { /** Integer cap, from 1 through 50. */ limit?: number };
  listMessages: { /** ISO 8601 date-time cursor. */ after?: IsoDate };
  listNotifications: { /** Only the string value "true" enables the filter. */ unreadOnly?: boolean };
  listMyReports: { status?: ApiReportStatus };
  listReports: { status?: ApiReportStatus };
  listAdminInquiries: { status?: ApiInquiryStatus };
  /* ── 운영자(admin-ops) ── */
  listEventLogs: AdminEventLogQueryDto;
}

/** Response envelopes keyed by openapi/openapi.yaml operationId. */
export interface BApiResponses {
  listProjectApplications: DataEnvelope<SupplierApplicationCardDto[]>;
  submitApplication: DataEnvelope<ApplicationRevisionDto>;
  listMyApplications: DataEnvelope<ApplicationRevisionDto[]>;
  listApplicationRevisions: DataEnvelope<ApplicationRevisionDto[]>;
  listMyProjects: DataEnvelope<MyProjectDto[]>;
  getMyProject: DataEnvelope<MyProjectDetailDto>;
  createDraft: DataEnvelope<DraftDto>;
  listDrafts: DataEnvelope<DraftDto[]>;
  getDraft: DataEnvelope<DraftDto>;
  deleteDraft: DataEnvelope<{ deleted: true }>;
  retryDraft: DataEnvelope<DraftDto>;
  restoreDraft: DataEnvelope<DraftDto>;
  editDraftChat: DataEnvelope<DraftDto>;
  getDraftRecommendations: DataEnvelope<DraftRecommendationDto[]>;
  addDraftBlock: DataEnvelope<DraftDto>;
  removeDraftBlock: DataEnvelope<DraftDto>;
  updateConditionNote: DataEnvelope<DraftDto>;
  updateHopeBudget: DataEnvelope<DraftDto>;
  publishDraft: DataEnvelope<PublishedProjectDto>;
  /* ── 초안·프로젝트 ── */
  getDraftPriceReport: DataEnvelope<PriceReportDto>;
  applyDraftEstimate: DataEnvelope<ApplyEstimateResultDto>;
  extendProjectDeadline: DataEnvelope<ExtendDeadlineResultDto>;
  getApplication: DataEnvelope<ApplicationRevisionDto>;
  withdrawApplication: DataEnvelope<ApplicationStatusResultDto>;
  rejectApplication: DataEnvelope<ApplicationStatusResultDto>;
  reviseApplication: DataEnvelope<ReviseApplicationResultDto>;
  listBookmarks: DataEnvelope<BookmarkListItemDto[]>;
  saveBookmark: DataEnvelope<BookmarkDto>;
  removeBookmark: DataEnvelope<RemoveBookmarkResultDto>;
  listRecommendedProjects: DataEnvelope<RecommendedProjectDto[]>;
  /** A API operations, kept in this registry so the shared request module can call them. */
  getSupplierProfile: DataEnvelope<SupplierPublicProfileDto>;
  listPublicProjects: DataEnvelope<PublicProjectListItemDto[]>;
  getSupplierProjectDetail: DataEnvelope<SupplierProjectDetailDto>;
  /* ── 계정·프로필 ── */
  updateSupplierProfile: DataEnvelope<MySupplierProfileDto | null>;
  updateClientProfile: DataEnvelope<MyClientProfileDto | null>;
  getMySupplierProfile: DataEnvelope<MySupplierProfileDto | null>;
  getMyClientProfile: DataEnvelope<MyClientProfileDto | null>;
  getClientProjectProfile: DataEnvelope<ClientProjectProfileDto>;
  getMe: DataEnvelope<MeDto>;
  changePassword: DataEnvelope<{ passwordChanged: true }>;
  requestEmailChange: DataEnvelope<{ requested: true }>;
  disconnectGoogle: DataEnvelope<{ googleDisconnected: true }>;
  withdrawAccount: DataEnvelope<{ withdrawnAt: IsoDate }>;
  updateClientTaxInfo: DataEnvelope<TaxInfoResultDto>;
  updateSupplierTaxInfo: DataEnvelope<TaxInfoResultDto>;
  updatePayoutAccount: DataEnvelope<PayoutAccountResultDto>;
  verifyPayoutAccount: DataEnvelope<{ verified: true; verifiedAt: IsoDate }>;
  listContractInstallments: DataEnvelope<ContractInstallmentsDto>;
  listDeliveries: DataEnvelope<DeliveryDto[]>;
  submitDelivery: DataEnvelope<DeliveryDto>;
  approveContractItem: DataEnvelope<{ id: string; approvedAt: IsoDate | null; autoApproved: boolean }>;
  requestRework: DataEnvelope<InspectionRequestDto>;
  listChatRooms: DataEnvelope<ChatRoomSummaryDto[]>;
  openChat: DataEnvelope<OpenChatResultDto>;
  listMessages: DataEnvelope<ConversationViewDto>;
  sendMessage: DataEnvelope<ChatMessageDto>;
  readMessages: DataEnvelope<UpdatedCountDto>;
  previewAgreement: DataEnvelope<AgreementPreviewDto>;
  confirmAgreement: DataEnvelope<ConfirmAgreementResultDto>;
  listMyContracts: DataEnvelope<ContractViewDto[]>;
  listPaymentStatements: DataEnvelope<PaymentStatementsDto>;
  getMySettlementSummary: DataEnvelope<SettlementSummaryDto>;
  getContract: DataEnvelope<ContractViewDto>;
  getContractDocument: DataEnvelope<ContractDocumentDto>;
  getInspectionSummary: DataEnvelope<InspectionSummaryDto>;
  createDeposit: DataEnvelope<CreateDepositResultDto>;
  listDeposits: DataEnvelope<EscrowDepositDto[]>;
  confirmDeposit: DataEnvelope<ConfirmDepositResultDto>;
  signContract: DataEnvelope<SignContractResultDto>;
  getCancellation: DataEnvelope<CancellationDto>;
  withdrawCancellation: DataEnvelope<CancellationDto>;
  createReview: DataEnvelope<ReviewDto>;
  listContractReviews: DataEnvelope<PublicReviewDto[]>;
  listSupplierReviews: DataEnvelope<PublicReviewDto[]>;
  listClientReviews: DataEnvelope<PublicReviewDto[]>;
  declineContract: DataEnvelope<BreakContractResultDto>;
  cancelProvisionalContract: DataEnvelope<BreakContractResultDto>;
  listNotifications: NotificationListEnvelopeDto;
  readNotification: DataEnvelope<NotificationReadResultDto>;
  readAllNotifications: DataEnvelope<UpdatedCountDto>;
  submitReport: DataEnvelope<ReportDto>;
  listMyReports: DataEnvelope<ReportDto[]>;
  listReports: DataEnvelope<AdminReportDto[]>;
  resolveReport: DataEnvelope<ResolveReportResultDto>;
  createInquiry: DataEnvelope<InquiryDto>;
  listMyInquiries: DataEnvelope<InquiryDto[]>;
  getInquiry: DataEnvelope<InquiryDto>;
  listAdminInquiries: DataEnvelope<InquiryDto[]>;
  answerInquiry: DataEnvelope<InquiryDto>;
  getNotificationSettings: DataEnvelope<NotificationSettingsDto>;
  updateNotificationSettings: DataEnvelope<NotificationSettingsDto>;
  getAdminMenuCounts: DataEnvelope<AdminMenuCountsDto>;
  presignUpload: DataEnvelope<PresignUploadResponseDto>;
  presignDownload: DataEnvelope<PresignDownloadResponseDto>;
  listAdminBlocks: DataEnvelope<AdminBlockDto[]>;
  executeAdminBlockAction: DataEnvelope<AdminBlockActionResultDto>;
  listEscalatedInspections: DataEnvelope<AdminEscalatedInspectionDto[]>;
  decideInspectionDispute: DataEnvelope<AdminEscalatedInspectionDto>;
  /* ── 운영자(admin-ops) ── */
  listHeldDeposits: DataEnvelope<AdminHeldDepositDto[]>;
  resolveHeldDeposit: DataEnvelope<AdminHeldDepositDto>;
  listCancellationQueue: DataEnvelope<AdminCancellationContractDto[]>;
  listCancellationHistory: DataEnvelope<AdminCancellationContractDto[]>;
  decideCancellation: DataEnvelope<AdminCancellationContractDto>;
  markSettlementProcessed: DataEnvelope<AdminCancellationContractDto>;
  listEventLogs: DataEnvelope<AdminEventLogDto[]>;
  /* ── 계약 흐름 ── */
  getDelivery: DataEnvelope<DeliveryDto>;
  listReworkRequests: DataEnvelope<InspectionRequestDto[]>;
  escalateInspection: DataEnvelope<InspectionRequestDto>;
  requestCancellation: DataEnvelope<CancellationUpdateDto>;
  agreeCancellation: DataEnvelope<CancellationUpdateDto>;
  objectCancellation: DataEnvelope<CancellationUpdateDto>;
  getContractStatement: DataEnvelope<PaymentStatementDto>;
  markTaxInvoiceIssued: DataEnvelope<TaxInvoiceIssuedResultDto>;
}

export type BApiOperationId = keyof BApiResponses;
