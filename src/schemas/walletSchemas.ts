import { z } from 'zod';
import {
  accountStatuses,
  cardStatuses,
  permissionRoleLabels,
  permissionRoles,
  walletStatuses,
} from '@/features/shared/types/domain';
import { isValidTimeZone } from '@/lib/dates';

export const walletStatusSchema = z.enum(walletStatuses);
export const accountStatusSchema = z.enum(accountStatuses);
export const cardStatusSchema = z.enum(cardStatuses);
export const permissionRoleSchema = z.enum(permissionRoles);
export const permissionRoleLabelSchema = z.enum(permissionRoleLabels);

export const walletTimezoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => isValidTimeZone(value), 'Timezone IANA inválido');

export const walletSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  name: z.string().min(1).max(80),
  timezone: walletTimezoneSchema,
  status: walletStatusSchema,
  mainBalance: z.string().min(1),
  projectedBalance: z.string().min(1),
});

export const accountSchema = z.object({
  id: z.string().min(1),
  walletId: z.string().min(1),
  name: z.string().min(1).max(80),
  status: accountStatusSchema,
  balance: z.string().min(1),
});

export const cardSchema = z.object({
  id: z.string().min(1),
  walletId: z.string().min(1),
  name: z.string().min(1).max(80),
  debitAccountId: z.string().min(1),
  status: cardStatusSchema,
});

export const walletPermissionSchema = z.object({
  id: z.string().min(1),
  walletId: z.string().min(1),
  invitedEmail: z.string().email(),
  role: permissionRoleSchema,
  roleLabel: permissionRoleLabelSchema,
});

export const upsertPermissionRequestSchema = z.object({
  invitedEmail: z.string().email(),
  role: permissionRoleSchema,
});

export const createInviteRequestSchema = upsertPermissionRequestSchema;

export const cardLinkedRecordSchema = z.object({
  id: z.string().min(1),
  cardId: z.string().min(1),
  type: z.enum(['expense', 'credit']),
  amount: z.string().min(1),
  originalTransactionId: z.string().nullable().optional(),
  occurredAt: z.string().datetime(),
});

export const cardDetailResponseSchema = z.object({
  card: cardSchema,
  linkedRecords: z.array(cardLinkedRecordSchema),
});

export const walletCollectionSchema = z.array(walletSchema);
export const accountCollectionSchema = z.array(accountSchema);
export const cardCollectionSchema = z.array(cardSchema);
export const permissionCollectionSchema = z.array(walletPermissionSchema);