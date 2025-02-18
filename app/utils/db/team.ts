import { db } from "../server/db.server";

export async function findTeamAllowMembersInvite(teamId: number) {
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: { allowMembersInvite: true },
  });

  if (!team) {
    throw new Response("Team not found", { status: 404 });
  }

  return team.allowMembersInvite;
}

export async function findTeamMemberRole(teamId: number, userId: number) {
  const member = await db.teamMember.findUnique({
    where: { userId_teamId: { teamId, userId } },
    select: { role: true },
  });

  if (!member) {
    return null;
  }

  return member.role;
}
