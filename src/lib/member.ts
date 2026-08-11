import { Member } from "@/types";

export function getMemberFullName(member: Pick<Member, "lastName" | "firstName">): string {
  return `${member.lastName}${member.firstName}`;
}
