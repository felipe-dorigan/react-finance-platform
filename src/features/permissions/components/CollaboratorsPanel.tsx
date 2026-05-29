import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { z } from 'zod';
import { walletQueryKeys } from '@/services/api/queryKeys';
import {
  getRoleRestrictionMessage,
  canManageWalletCollaborators,
} from '@/features/permissions/permissionEnforcement';
import {
  getPermissionRoleLabel,
  listWalletPermissions,
  upsertWalletPermission,
} from '@/features/permissions/permissionService';
import { createWalletInvitation } from '@/features/permissions/invitationService';
import {
  trackPermissionInviteSuccess,
  trackPermissionMutationFailure,
  trackPermissionsLoadFailure,
  trackPermissionUpsertSuccess,
  trackPermissionVisualBlock,
} from '@/features/permissions/permissionsObservability';
import { getMockSession } from '@/features/wallets/session/sessionService';
import { emitPermissionMutationTrail } from '@/features/permissions/permissionsAuditBridge';

const inviteFormSchema = z.object({
  invitedEmail: z.string().trim().email('Informe um e-mail valido.'),
  role: z.enum(['read', 'edit', 'operate']),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

export function CollaboratorsPanel() {
  const { walletId = '' } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const session = getMockSession();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rowRoleDrafts, setRowRoleDrafts] = useState<Record<string, 'read' | 'edit' | 'operate'>>({});
  const hasTrackedLoadFailureRef = useRef(false);

  const canManage = canManageWalletCollaborators(session.role);
  const roleRestrictionMessage = getRoleRestrictionMessage(session.role);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      invitedEmail: '',
      role: 'read',
    },
  });

  const permissionsQuery = useQuery({
    queryKey: walletQueryKeys.permissions(walletId),
    queryFn: () => listWalletPermissions(walletId),
    enabled: walletId.length > 0,
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteFormValues) => createWalletInvitation(walletId, payload),
  });

  const upsertMutation = useMutation({
    mutationFn: (payload: InviteFormValues) => upsertWalletPermission(walletId, payload),
  });

  useEffect(() => {
    if (!permissionsQuery.isError || hasTrackedLoadFailureRef.current) {
      return;
    }

    trackPermissionsLoadFailure(
      {
        walletId,
        route: location.pathname,
      },
      permissionsQuery.error,
    );

    hasTrackedLoadFailureRef.current = true;
  }, [walletId, location.pathname, permissionsQuery.error, permissionsQuery.isError]);

  const permissions = useMemo(() => permissionsQuery.data ?? [], [permissionsQuery.data]);

  const permissionByEmail = useMemo(() => {
    const map = new Map<string, (typeof permissions)[number]>();
    permissions.forEach((permission) => {
      map.set(permission.invitedEmail.toLowerCase(), permission);
    });
    return map;
  }, [permissions]);

  async function refreshPermissions(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: walletQueryKeys.permissions(walletId) });
  }

  const submitInvite = handleSubmit(async (values) => {
    if (!canManage) {
      trackPermissionVisualBlock(
        { walletId, route: location.pathname },
        {
          attemptedAction: 'permissions.invite-or-upsert',
          role: session.role,
        },
      );
      setFeedback(roleRestrictionMessage);
      return;
    }

    const existing = permissionByEmail.get(values.invitedEmail.toLowerCase());

    try {
      if (existing) {
        const updated = await upsertMutation.mutateAsync(values);

        emitPermissionMutationTrail({
          permission: updated,
          action: 'permission.upserted',
          changedFields:
            existing.role === values.role
              ? undefined
              : [{ field: 'role', before: existing.role, after: values.role }],
          metadata: {
            source: 'collaborators-panel.form',
          },
        });

        trackPermissionUpsertSuccess(
          { walletId, route: location.pathname },
          {
            invitedEmail: updated.invitedEmail,
            role: updated.role,
            roleLabel: updated.roleLabel,
          },
        );

        setFeedback('Permissao atualizada com sucesso.');
      } else {
        const created = await inviteMutation.mutateAsync(values);

        emitPermissionMutationTrail({
          permission: created,
          action: 'invite.created',
          metadata: {
            source: 'collaborators-panel.form',
          },
        });

        trackPermissionInviteSuccess(
          { walletId, route: location.pathname },
          {
            invitedEmail: created.invitedEmail,
            role: created.role,
            roleLabel: created.roleLabel,
          },
        );

        setFeedback('Convite enviado com sucesso.');
      }

      await refreshPermissions();
      reset({ invitedEmail: '', role: 'read' });
    } catch (error) {
      trackPermissionMutationFailure(
        { walletId, route: location.pathname },
        existing ? 'permissions.upsert' : 'permissions.invite',
        error,
      );
      setFeedback(existing ? 'Nao foi possivel atualizar a permissao.' : 'Nao foi possivel enviar o convite.');
    }
  });

  async function handleRowUpsert(permissionId: string, invitedEmail: string, previousRole: 'read' | 'edit' | 'operate') {
    if (!canManage) {
      trackPermissionVisualBlock(
        { walletId, route: location.pathname },
        {
          attemptedAction: 'permissions.row-upsert',
          role: session.role,
          invitedEmail,
        },
      );
      setFeedback(roleRestrictionMessage);
      return;
    }

    const nextRole = rowRoleDrafts[permissionId] ?? previousRole;
    if (nextRole === previousRole) {
      return;
    }

    try {
      const updated = await upsertMutation.mutateAsync({ invitedEmail, role: nextRole });

      emitPermissionMutationTrail({
        permission: updated,
        action: 'permission.upserted',
        changedFields: [{ field: 'role', before: previousRole, after: nextRole }],
        metadata: {
          source: 'collaborators-panel.table',
        },
      });

      trackPermissionUpsertSuccess(
        { walletId, route: location.pathname },
        {
          invitedEmail: updated.invitedEmail,
          previousRole,
          role: updated.role,
        },
      );

      setFeedback('Permissao atualizada com sucesso.');
      setRowRoleDrafts((current) => {
        const next = { ...current };
        delete next[permissionId];
        return next;
      });
      await refreshPermissions();
    } catch (error) {
      trackPermissionMutationFailure(
        { walletId, route: location.pathname },
        'permissions.upsert',
        error,
        {
          invitedEmail,
          previousRole,
          nextRole,
        },
      );
      setFeedback('Nao foi possivel atualizar a permissao.');
    }
  }

  if (permissionsQuery.isPending) {
    return <p>Carregando colaboradores da carteira...</p>;
  }

  if (permissionsQuery.isError) {
    return (
      <section aria-labelledby="collaborators-title">
        <h2 id="collaborators-title">Colaboradores e permissoes</h2>
        <p role="alert">Nao foi possivel carregar os colaboradores.</p>
        <button type="button" onClick={() => void permissionsQuery.refetch()}>
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="collaborators-title">
      <h2 id="collaborators-title">Colaboradores e permissoes</h2>
      <p>Convide por e-mail e ajuste o nivel de acesso sem alterar a estrutura da carteira.</p>

      {feedback ? (
        <p role={feedback.includes('Nao foi possivel') ? 'alert' : 'status'} aria-live="polite">
          {feedback}
        </p>
      ) : null}

      {canManage ? null : (
        <p role="note" aria-live="polite">
          {roleRestrictionMessage}
        </p>
      )}

      <form onSubmit={submitInvite} aria-label="Formulario de convite de colaborador" noValidate>
        <fieldset disabled={!canManage || inviteMutation.isPending || upsertMutation.isPending}>
          <label htmlFor="invite-email">E-mail do colaborador</label>
          <input
            id="invite-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.invitedEmail ? 'true' : 'false'}
            aria-describedby={errors.invitedEmail ? 'invite-email-error' : undefined}
            {...register('invitedEmail')}
          />
          {errors.invitedEmail ? (
            <p id="invite-email-error" role="alert" aria-live="polite">
              {errors.invitedEmail.message}
            </p>
          ) : null}

          <label htmlFor="invite-role">Nivel de acesso</label>
          <select id="invite-role" {...register('role')}>
            <option value="read">Leitura</option>
            <option value="edit">Leitura + edicao</option>
            <option value="operate">Acesso total operacional</option>
          </select>

          <button type="submit" disabled={!canManage || isSubmitting || inviteMutation.isPending || upsertMutation.isPending}>
            {isSubmitting || inviteMutation.isPending || upsertMutation.isPending
              ? 'Salvando...'
              : 'Convidar ou atualizar'}
          </button>
        </fieldset>
      </form>

      {permissions.length === 0 ? (
        <p>Nenhum colaborador convidado para esta carteira.</p>
      ) : (
        <ul aria-label="Lista de colaboradores">
          {permissions.map((permission) => {
            const selectedRole = rowRoleDrafts[permission.id] ?? permission.role;
            const isSelfPermission = permission.invitedEmail.toLowerCase() === session.email.toLowerCase();
            const rowBlocked = !canManage || isSelfPermission;

            return (
              <li key={permission.id}>
                <p>
                  <strong>{permission.invitedEmail}</strong>
                </p>
                <p>Papel atual: {permission.roleLabel}</p>

                <label htmlFor={`permission-role-${permission.id}`}>Alterar nivel</label>
                <select
                  id={`permission-role-${permission.id}`}
                  value={selectedRole}
                  disabled={rowBlocked || upsertMutation.isPending}
                  onChange={(event) => {
                    const nextRole = event.target.value as 'read' | 'edit' | 'operate';
                    setRowRoleDrafts((current) => ({
                      ...current,
                      [permission.id]: nextRole,
                    }));
                  }}
                >
                  <option value="read">Leitura</option>
                  <option value="edit">Leitura + edicao</option>
                  <option value="operate">Acesso total operacional</option>
                </select>

                <button
                  type="button"
                  disabled={rowBlocked || selectedRole === permission.role || upsertMutation.isPending}
                  onClick={() => void handleRowUpsert(permission.id, permission.invitedEmail, permission.role)}
                >
                  {upsertMutation.isPending ? 'Salvando...' : 'Atualizar permissao'}
                </button>

                {isSelfPermission ? (
                  <p role="note">Nao e possivel alterar a propria permissao neste painel.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p>
        Referencia de papeis: leitura, leitura+edicao, acesso_total_operacional.
      </p>
      <p>
        Mapeamento atual do convite: {getPermissionRoleLabel('read')} / {getPermissionRoleLabel('edit')} /{' '}
        {getPermissionRoleLabel('operate')}.
      </p>
    </section>
  );
}
