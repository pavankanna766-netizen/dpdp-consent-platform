import {
  createCompanyInvitation,
  getInvitationByToken,
  updateInvitationStatus,
  listCompanyInvitations,
} from "@/repositories/organization-invitation.repository";
import {
  addCompanyMember,
  getCompanyMembers,
  removeCompanyMember,
  updateCompanyMemberRole,
} from "@/repositories/company.repository";
import { createAuditLog } from "@/repositories/audit.repository";
import { notificationPlatformService } from "@/services/notification-platform.service";
import type { OrgRole } from "@/platform/permissions/rbac";

export class OrganizationService {
  async inviteMember(
    companyId: string,
    email: string,
    role: OrgRole,
    invitedBy: string
  ) {
    const inviteRes = await createCompanyInvitation({
      company_id: companyId,
      email,
      role,
      invited_by: invitedBy,
    });

    if (inviteRes.error || !inviteRes.data) {
      throw inviteRes.error ?? new Error("Failed to create invitation");
    }

    const invitation = inviteRes.data;

    // Publish Team Invitation Event
    await notificationPlatformService.publishDomainEvent({
      companyId,
      eventType: "AUTH_TEAM_INVITATION",
      recipientEmail: email,
      title: `You've been invited to join team on PrivyStack`,
      metadata: { role, token: invitation.token, invitedBy },
    });

    await createAuditLog({
      company_id: companyId,
      event_type: "MEMBER_INVITED",
      entity_type: "company_invitations",
      entity_id: invitation.id,
      actor: invitedBy,
      payload: { email, role },
    });

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const inviteRes = await getInvitationByToken(token);
    if (!inviteRes.data) {
      throw new Error("Invalid or expired invitation token.");
    }

    const invitation = inviteRes.data;

    // Add member to company
    await addCompanyMember(invitation.company_id, userId, invitation.role);

    // Update token status
    await updateInvitationStatus(invitation.id, "accepted");

    await createAuditLog({
      company_id: invitation.company_id,
      event_type: "MEMBER_JOINED",
      entity_type: "company_members",
      entity_id: userId,
      actor: userId,
      payload: { email: invitation.email, role: invitation.role },
    });

    return { companyId: invitation.company_id };
  }

  async revokeInvitation(companyId: string, invitationId: string, actor: string) {
    await updateInvitationStatus(invitationId, "revoked");
    await createAuditLog({
      company_id: companyId,
      event_type: "INVITATION_REVOKED",
      entity_type: "company_invitations",
      entity_id: invitationId,
      actor,
      payload: { status: "revoked" },
    });
    return { success: true };
  }

  async removeMember(companyId: string, memberId: string, actor: string) {
    await removeCompanyMember(companyId, memberId);
    await createAuditLog({
      company_id: companyId,
      event_type: "MEMBER_REMOVED",
      entity_type: "company_members",
      entity_id: memberId,
      actor,
      payload: { removedMemberId: memberId },
    });
    return { success: true };
  }

  async updateRole(companyId: string, memberId: string, newRole: OrgRole, actor: string) {
    await updateCompanyMemberRole(companyId, memberId, newRole);
    await createAuditLog({
      company_id: companyId,
      event_type: "MEMBER_ROLE_UPDATED",
      entity_type: "company_members",
      entity_id: memberId,
      actor,
      payload: { newRole },
    });
    return { success: true };
  }

  async getMembers(companyId: string) {
    return getCompanyMembers(companyId);
  }

  async getInvitations(companyId: string) {
    return listCompanyInvitations(companyId);
  }
}

export const organizationService = new OrganizationService();
