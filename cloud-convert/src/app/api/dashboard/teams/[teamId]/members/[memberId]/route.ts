// Team Member Management API - Update and Delete members

import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, AppDataSource } from '@/lib/database';
import { TeamMember, TeamRole } from '@/entities/TeamMember';

interface RouteContext {
  params: { teamId: string; memberId: string };
}

/**
 * PATCH /api/dashboard/teams/[teamId]/members/[memberId]
 * Update member role
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { teamId, memberId } = context.params;
    const body = await req.json();
    const { role, requesterId } = body;

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    if (!requesterId) {
      return NextResponse.json({ error: 'Requester ID is required' }, { status: 400 });
    }

    await initializeDatabase();
    const teamMemberRepo = AppDataSource.getRepository(TeamMember);

    // Check if requester has permission (owner or admin)
    const requesterMember = await teamMemberRepo.findOne({
      where: {
        teamId: parseInt(teamId),
        userId: parseInt(requesterId),
        isActive: true,
      },
    });

    if (
      !requesterMember ||
      (requesterMember.role !== TeamRole.OWNER && requesterMember.role !== TeamRole.ADMIN)
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Only owner or admin can update roles' },
        { status: 403 }
      );
    }

    // Get member to update
    const member = await teamMemberRepo.findOne({
      where: { id: parseInt(memberId), teamId: parseInt(teamId) },
      relations: ['user'],
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot change owner role
    if (member.role === TeamRole.OWNER) {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(TeamRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update role
    member.role = role;
    await teamMemberRepo.save(member);

    console.log(`[TEAM] Updated member ${member.userId} role to ${role} in team ${teamId}`);

    return NextResponse.json(
      {
        member: {
          id: member.id,
          userId: member.userId,
          userName: member.user?.email.split('@')[0] || 'Unknown',
          userEmail: member.user?.email || '',
          role: member.role,
          isActive: member.isActive,
          createdAt: member.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[TEAM MEMBER UPDATE ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to update member', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboard/teams/[teamId]/members/[memberId]
 * Remove member from team
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { teamId, memberId } = context.params;
    const requesterId = req.nextUrl.searchParams.get('requesterId');

    if (!requesterId) {
      return NextResponse.json({ error: 'Requester ID is required' }, { status: 400 });
    }

    await initializeDatabase();
    const teamMemberRepo = AppDataSource.getRepository(TeamMember);

    // Check if requester has permission (owner or admin)
    const requesterMember = await teamMemberRepo.findOne({
      where: {
        teamId: parseInt(teamId),
        userId: parseInt(requesterId),
        isActive: true,
      },
    });

    if (
      !requesterMember ||
      (requesterMember.role !== TeamRole.OWNER && requesterMember.role !== TeamRole.ADMIN)
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Only owner or admin can remove members' },
        { status: 403 }
      );
    }

    // Get member to remove
    const member = await teamMemberRepo.findOne({
      where: { id: parseInt(memberId), teamId: parseInt(teamId) },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot remove owner
    if (member.role === TeamRole.OWNER) {
      return NextResponse.json(
        { error: 'Cannot remove team owner' },
        { status: 400 }
      );
    }

    // Remove member
    await teamMemberRepo.remove(member);

    console.log(`[TEAM] Removed member ${member.userId} from team ${teamId}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[TEAM MEMBER DELETE ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to remove member', details: error.message },
      { status: 500 }
    );
  }
}
