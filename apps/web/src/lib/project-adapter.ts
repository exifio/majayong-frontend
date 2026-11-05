import type { ApiProjectStatus, SupplierProjectDetailDto } from '@majayong/types/api';
import type { ProjectDisplayStatus, SupplierProjectDetail } from '@majayong/types';

const STATUS_LABEL: Record<ApiProjectStatus, ProjectDisplayStatus> = {
  SCHEDULED: '모집 예정',
  RECRUITING: '모집 중',
  SELECTING: '선택 중',
  ACCEPTED: '임시 계약 중',
  CONTRACTED: '계약 중',
  EXPIRED: '모집 마감',
};

export function projectStatusLabel(status: ApiProjectStatus): ProjectDisplayStatus {
  return STATUS_LABEL[status];
}

type Condition = { key: string; text: string; note?: string };

/** API conditions are open JSON; keep only entries the screen can render. */
function conditionsOf(value: unknown): Condition[] {
  if (!Array.isArray(value)) return [];
  const result: Condition[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { key, text, note } = entry as Record<string, unknown>;
    if (typeof key !== 'string' || typeof text !== 'string') continue;
    result.push(typeof note === 'string' ? { key, text, note } : { key, text });
  }
  return result;
}

/** A supplier project detail DTO to the existing screen model. Nothing is invented. */
export function projectDetailToScreen(dto: SupplierProjectDetailDto): SupplierProjectDetail {
  return {
    id: dto.projectId,
    industry: dto.industryCode,
    status: projectStatusLabel(dto.status),
    title: dto.title,
    itemNames: dto.items.map((item) => item.title),
    itemCount: dto.itemCount,
    budgetRange: dto.hopeBudgetBand ?? '',
    deadline: dto.deadline,
    requiredSkills: dto.requiredSkills,
    matchedSkills: [],
    bookmarked: false,
    items: dto.items.map((item) => ({
      specItemId: item.specItemId,
      title: item.title,
      description: item.description,
      conditions: conditionsOf(item.conditions),
    })),
    hopeBudget: dto.hopeBudget,
    interimRatioGuide: '',
    client: {
      name: dto.client.name,
      businessName: dto.client.businessName,
      industryField: dto.client.industryField,
      storeAddress: dto.client.storeAddress,
      websiteUrl: dto.client.websiteUrl,
      bio: dto.client.bio,
    },
    myApplication: null,
  };
}
