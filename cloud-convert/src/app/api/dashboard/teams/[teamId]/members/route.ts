// Team Members API - Add members to team

import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, AppDataSource } from '@/lib/database';
import { Team } from '@/entities/Team';
import { TeamMember, TeamRole } from '@/entities/TeamMember';
import { User } from '@/entities/User';

interface RouteContext {
  params: { teamId: string };
}

/**
 * POST /api/dashboard/teams/[teamId]/members
 * Add a member to the team
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { teamId } = context.params;
    const body = await req.json();
    const { email, role, requesterId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!requesterId) {
      return NextResponse.json({ error: 'Requester ID is required' }, { status: 400 });
    }

    await initializeDatabase();
    const teamRepo = AppDataSource.getRepository(Team);
    const teamMemberRepo = AppDataSource.getRepository(TeamMember);
    const userRepo = AppDataSource.getRepository(User);

    // Verify team exists
    const team = await teamRepo.findOne({
      where: { id: parseInt(teamId) },
      relations: ['members'],
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

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
        { error: 'Forbidden: Only owner or admin can add members' },
        { status: 403 }
      );
    }

    // Find user by email
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with that email' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await teamMemberRepo.findOne({
      where: { teamId: parseInt(teamId), userId: user.id },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      );
    }

    // Check if team is full
    const activeMembers = team.members.filter((m) => m.isActive);
    if (activeMembers.length >= team.maxMembers) {
      return NextResponse.json(
        { error: 'Team is full. Increase maxMembers or remove inactive members' },
        { status: 400 }
      );
    }

    // Add member
    const newMember = teamMemberRepo.create({
      teamId: parseInt(teamId),
      userId: user.id,
      role: role || TeamRole.BASIC,
      isActive: true,
    });

    await teamMemberRepo.save(newMember);

    // Reload with user info
    const savedMember = await teamMemberRepo.findOne({
      where: { id: newMember.id },
      relations: ['user'],
    });

    console.log(`[TEAM] Added member ${user.email} to team ${teamId} as ${role || 'BASIC'}`);

    return NextResponse.json(
      {
        member: {
          id: savedMember!.id,
          userId: savedMember!.userId,
          userName: savedMember!.user?.email.split('@')[0] || 'Unknown',
          userEmail: savedMember!.user?.email || '',
          role: savedMember!.role,
          isActive: savedMember!.isActive,
          createdAt: savedMember!.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[TEAM MEMBER ADD ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to add member', details: error.message },
      { status: 500 }
    );
  }
}
