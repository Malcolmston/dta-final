// Team Management API - Get and Create Teams

import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, AppDataSource } from '@/lib/database';
import { Team } from '@/entities/Team';
import { TeamMember, TeamRole } from '@/entities/TeamMember';
import { User } from '@/entities/User';

/**
 * GET /api/dashboard/teams
 * Get all teams where the user is owner or member
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await initializeDatabase();
    const teamRepo = AppDataSource.getRepository(Team);
    const teamMemberRepo = AppDataSource.getRepository(TeamMember);

    // Find all teams where user is a member
    const teamMembers = await teamMemberRepo.find({
      where: { userId: parseInt(userId), isActive: true },
      relations: ['team', 'team.members', 'team.members.user'],
    });

    const teams = teamMembers.map((tm) => ({
      ...tm.team,
      members: tm.team.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        userName: m.user?.email.split('@')[0] || 'Unknown',
        userEmail: m.user?.email || '',
        role: m.role,
        isActive: m.isActive,
        createdAt: m.createdAt,
      })),
    }));

    return NextResponse.json({ teams }, { status: 200 });
  } catch (error: any) {
    console.error('[TEAMS GET ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/teams
 * Create a new team
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, maxMembers, userId } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      );
    }

    const maxMembersValue = maxMembers || 5;
    if (maxMembersValue < 5 || maxMembersValue > 10000) {
      return NextResponse.json(
        { error: 'Max members must be between 5 and 10,000' },
        { status: 400 }
      );
    }

    await initializeDatabase();
    const teamRepo = AppDataSource.getRepository(Team);
    const teamMemberRepo = AppDataSource.getRepository(TeamMember);

    // Create team
    const team = teamRepo.create({
      name,
      description: description || null,
      ownerId: parseInt(userId),
      maxMembers: maxMembersValue,
      isActive: true,
    });

    await teamRepo.save(team);

    // Add creator as owner
    const ownerMember = teamMemberRepo.create({
      teamId: team.id,
      userId: parseInt(userId),
      role: TeamRole.OWNER,
      isActive: true,
    });

    await teamMemberRepo.save(ownerMember);

    // Reload team with members
    const createdTeam = await teamRepo.findOne({
      where: { id: team.id },
      relations: ['members', 'members.user'],
    });

    console.log(`[TEAM] Created team "${name}" with ID ${team.id}, owner: ${userId}`);

    return NextResponse.json(
      {
        team: {
          ...createdTeam,
          members: createdTeam?.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            userName: m.user?.email.split('@')[0] || 'Unknown',
            userEmail: m.user?.email || '',
            role: m.role,
            isActive: m.isActive,
            createdAt: m.createdAt,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[TEAM CREATE ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to create team', details: error.message },
      { status: 500 }
    );
  }
}
