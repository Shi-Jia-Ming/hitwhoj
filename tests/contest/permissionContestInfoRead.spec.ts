import {
  contestRunningAttendeesPrv,
  contestRunningAttendeesPub,
  contestRunningGuestsPrv,
  contestRunningGuestsPub,
  contestRunningJuriesPrv,
  contestRunningJuriesPub,
  contestRunningModsPrv,
  contestRunningModsPub,
  contestNotStartedAttendeesPrv,
  contestNotStartedAttendeesPub,
  contestNotStartedGuestsPrv,
  contestNotStartedGuestsPub,
  contestNotStartedJuriesPrv,
  contestNotStartedJuriesPub,
  contestNotStartedModsPrv,
  contestNotStartedModsPub,
  contestEndedAttendeesPrv,
  contestEndedAttendeesPub,
  contestEndedGuestsPrv,
  contestEndedGuestsPub,
  contestEndedJuriesPrv,
  contestEndedJuriesPub,
  contestEndedModsPrv,
  contestEndedModsPub,
  createRequest,
} from "tests/tools";
import { permissionContestInfoRead as permission } from "~/utils/permission/contest";
import test from "node:test";
import assert from "node:assert";

test("permissionContestInfoRead", async (t) => {
  const root = await createRequest(1);
  const admin = await createRequest(2);
  const user = await createRequest(3);
  const banned = await createRequest(4);
  const guest = new Request("http://localhost:8080/");

  await t.test("Running", async () => {
    assert(await permission.check(root, contestRunningModsPub), "Root 可以在比赛中读取担任 mod 的公开比赛");
    assert(await permission.check(root, contestRunningModsPrv), "Root 可以在比赛中读取担任 mod 的私有比赛");
    assert(await permission.check(root, contestRunningJuriesPub), "Root 可以在比赛中读取担任 jury 的公开比赛");
    assert(await permission.check(root, contestRunningJuriesPrv), "Root 可以在比赛中读取担任 jury 的私有比赛");
    assert(await permission.check(root, contestRunningAttendeesPub), "Root 可以在比赛中读取担任 attendee 的公开比赛");
    assert(await permission.check(root, contestRunningAttendeesPrv), "Root 可以在比赛中读取担任 attendee 的私有比赛");
    assert(await permission.check(root, contestRunningGuestsPub), "Root 可以在比赛中读取其他的公开比赛");
    assert(await permission.check(root, contestRunningGuestsPrv), "Root 可以在比赛中读取其他的私有比赛");

    assert(await permission.check(admin, contestRunningModsPub), "Admin 可以在比赛中读取担任 mod 的公开比赛");
    assert(await permission.check(admin, contestRunningModsPrv), "Admin 可以在比赛中读取担任 mod 的私有比赛");
    assert(await permission.check(admin, contestRunningJuriesPub), "Admin 可以在比赛中读取担任 jury 的公开比赛");
    assert(await permission.check(admin, contestRunningJuriesPrv), "Admin 可以在比赛中读取担任 jury 的私有比赛");
    assert(await permission.check(admin, contestRunningAttendeesPub), "Admin 可以在比赛中读取担任 attendee 的公开比赛");
    assert(await permission.check(admin, contestRunningAttendeesPrv), "Admin 可以在比赛中读取担任 attendee 的私有比赛");
    assert(await permission.check(admin, contestRunningGuestsPub), "Admin 可以在比赛中读取其他的公开比赛");
    assert(await permission.check(admin, contestRunningGuestsPrv), "Admin 可以在比赛中读取其他的私有比赛");

    assert(await permission.check(user, contestRunningModsPub), "User 可以在比赛中读取担任 mod 的公开比赛");
    assert(await permission.check(user, contestRunningModsPrv), "User 可以在比赛中读取担任 mod 的私有比赛");
    assert(await permission.check(user, contestRunningJuriesPub), "User 可以在比赛中读取担任 jury 的公开比赛");
    assert(await permission.check(user, contestRunningJuriesPrv), "User 可以在比赛中读取担任 jury 的私有比赛");
    assert(await permission.check(user, contestRunningAttendeesPub), "User 可以在比赛中读取担任 attendee 的公开比赛");
    assert(await permission.check(user, contestRunningAttendeesPrv), "User 可以在比赛中读取担任 attendee 的私有比赛");
    assert(await permission.check(user, contestRunningGuestsPub), "User 可以在比赛中读取其他的公开比赛");
    assert(!(await permission.check(user, contestRunningGuestsPrv)), "User 不可以在比赛中读取其他的私有比赛");

    assert(await permission.check(banned, contestRunningModsPub), "Banned 可以在比赛中读取担任 mod 的公开比赛");
    assert(await permission.check(banned, contestRunningModsPrv), "Banned 可以在比赛中读取担任 mod 的私有比赛");
    assert(await permission.check(banned, contestRunningJuriesPub), "Banned 可以在比赛中读取担任 jury 的公开比赛");
    assert(await permission.check(banned, contestRunningJuriesPrv), "Banned 可以在比赛中读取担任 jury 的私有比赛");
    assert(await permission.check(banned, contestRunningAttendeesPub), "Banned 可以在比赛中读取担任 attendee 的公开比赛");
    assert(await permission.check(banned, contestRunningAttendeesPrv), "Banned 可以在比赛中读取担任 attendee 的私有比赛");
    assert(await permission.check(banned, contestRunningGuestsPub), "Banned 可以在比赛中读取其他的公开比赛");
    assert(!(await permission.check(banned, contestRunningGuestsPrv)), "Banned 不可以在比赛中读取其他的私有比赛");

    assert(await permission.check(guest, contestRunningGuestsPub), "Guest 可以在比赛中读取其他的公开比赛");
    assert(!(await permission.check(guest, contestRunningGuestsPrv)), "Guest 不可以在比赛中读取其他的私有比赛");
  });

  await t.test("Not Started", async () => {
    assert(await permission.check(root, contestNotStartedModsPub), "Root 可以在比赛开始前读取担任 mod 的公开比赛");
    assert(await permission.check(root, contestNotStartedModsPrv), "Root 可以在比赛开始前读取担任 mod 的私有比赛");
    assert(await permission.check(root, contestNotStartedJuriesPub), "Root 可以在比赛开始前读取担任 jury 的公开比赛");
    assert(await permission.check(root, contestNotStartedJuriesPrv), "Root 可以在比赛开始前读取担任 jury 的私有比赛");
    assert(await permission.check(root, contestNotStartedAttendeesPub), "Root 可以在比赛开始前读取担任 attendee 的公开比赛");
    assert(await permission.check(root, contestNotStartedAttendeesPrv), "Root 可以在比赛开始前读取担任 attendee 的私有比赛");
    assert(await permission.check(root, contestNotStartedGuestsPub), "Root 可以在比赛开始前读取其他的公开比赛");
    assert(await permission.check(root, contestNotStartedGuestsPrv), "Root 可以在比赛开始前读取其他的私有比赛");

    assert(await permission.check(admin, contestNotStartedModsPub), "Admin 可以在比赛开始前读取担任 mod 的公开比赛");
    assert(await permission.check(admin, contestNotStartedModsPrv), "Admin 可以在比赛开始前读取担任 mod 的私有比赛");
    assert(await permission.check(admin, contestNotStartedJuriesPub), "Admin 可以在比赛开始前读取担任 jury 的公开比赛");
    assert(await permission.check(admin, contestNotStartedJuriesPrv), "Admin 可以在比赛开始前读取担任 jury 的私有比赛");
    assert(await permission.check(admin, contestNotStartedAttendeesPub), "Admin 可以在比赛开始前读取担任 attendee 的公开比赛");
    assert(await permission.check(admin, contestNotStartedAttendeesPrv), "Admin 可以在比赛开始前读取担任 attendee 的私有比赛");
    assert(await permission.check(admin, contestNotStartedGuestsPub), "Admin 可以在比赛开始前读取其他的公开比赛");
    assert(await permission.check(admin, contestNotStartedGuestsPrv), "Admin 可以在比赛开始前读取其他的私有比赛");

    assert(await permission.check(user, contestNotStartedModsPub), "User 可以在比赛开始前读取担任 mod 的公开比赛");
    assert(await permission.check(user, contestNotStartedModsPrv), "User 可以在比赛开始前读取担任 mod 的私有比赛");
    assert(await permission.check(user, contestNotStartedJuriesPub), "User 可以在比赛开始前读取担任 jury 的公开比赛");
    assert(await permission.check(user, contestNotStartedJuriesPrv), "User 可以在比赛开始前读取担任 jury 的私有比赛");
    assert(await permission.check(user, contestNotStartedAttendeesPub), "User 可以在比赛开始前读取担任 attendee 的公开比赛");
    assert(await permission.check(user, contestNotStartedAttendeesPrv), "User 可以在比赛开始前读取担任 attendee 的私有比赛");
    assert(await permission.check(user, contestNotStartedGuestsPub), "User 可以在比赛开始前读取其他的公开比赛");
    assert(!(await permission.check(user, contestNotStartedGuestsPrv)), "User 不可以在比赛开始前读取其他的私有比赛");

    assert(await permission.check(banned, contestNotStartedModsPub), "Banned 可以在比赛开始前读取担任 mod 的公开比赛");
    assert(await permission.check(banned, contestNotStartedModsPrv), "Banned 可以在比赛开始前读取担任 mod 的私有比赛");
    assert(await permission.check(banned, contestNotStartedJuriesPub), "Banned 可以在比赛开始前读取担任 jury 的公开比赛");
    assert(await permission.check(banned, contestNotStartedJuriesPrv), "Banned 可以在比赛开始前读取担任 jury 的私有比赛");
    assert(await permission.check(banned, contestNotStartedAttendeesPub), "Banned 可以在比赛开始前读取担任 attendee 的公开比赛");
    assert(await permission.check(banned, contestNotStartedAttendeesPrv), "Banned 可以在比赛开始前读取担任 attendee 的私有比赛");
    assert(await permission.check(banned, contestNotStartedGuestsPub), "Banned 可以在比赛开始前读取其他的公开比赛");
    assert(!(await permission.check(banned, contestNotStartedGuestsPrv)), "Banned 不可以在比赛开始前读取其他的私有比赛");

    assert(await permission.check(guest, contestNotStartedGuestsPub), "Guest 可以在比赛开始前读取其他的公开比赛");
    assert(!(await permission.check(guest, contestNotStartedGuestsPrv)), "Guest 不可以在比赛开始前读取其他的私有比赛");
  });

  await t.test("Ended", async () => {
    assert(await permission.check(root, contestEndedModsPub), "Root 可以在比赛结束后读取担任 mod 的公开比赛");
    assert(await permission.check(root, contestEndedModsPrv), "Root 可以在比赛结束后读取担任 mod 的私有比赛");
    assert(await permission.check(root, contestEndedJuriesPub), "Root 可以在比赛结束后读取担任 jury 的公开比赛");
    assert(await permission.check(root, contestEndedJuriesPrv), "Root 可以在比赛结束后读取担任 jury 的私有比赛");
    assert(await permission.check(root, contestEndedAttendeesPub), "Root 可以在比赛结束后读取担任 attendee 的公开比赛");
    assert(await permission.check(root, contestEndedAttendeesPrv), "Root 可以在比赛结束后读取担任 attendee 的私有比赛");
    assert(await permission.check(root, contestEndedGuestsPub), "Root 可以在比赛结束后读取其他的公开比赛");
    assert(await permission.check(root, contestEndedGuestsPrv), "Root 可以在比赛结束后读取其他的私有比赛");

    assert(await permission.check(admin, contestEndedModsPub), "Admin 可以在比赛结束后读取担任 mod 的公开比赛");
    assert(await permission.check(admin, contestEndedModsPrv), "Admin 可以在比赛结束后读取担任 mod 的私有比赛");
    assert(await permission.check(admin, contestEndedJuriesPub), "Admin 可以在比赛结束后读取担任 jury 的公开比赛");
    assert(await permission.check(admin, contestEndedJuriesPrv), "Admin 可以在比赛结束后读取担任 jury 的私有比赛");
    assert(await permission.check(admin, contestEndedAttendeesPub), "Admin 可以在比赛结束后读取担任 attendee 的公开比赛");
    assert(await permission.check(admin, contestEndedAttendeesPrv), "Admin 可以在比赛结束后读取担任 attendee 的私有比赛");
    assert(await permission.check(admin, contestEndedGuestsPub), "Admin 可以在比赛结束后读取其他的公开比赛");
    assert(await permission.check(admin, contestEndedGuestsPrv), "Admin 可以在比赛结束后读取其他的私有比赛");

    assert(await permission.check(user, contestEndedModsPub), "User 可以在比赛结束后读取担任 mod 的公开比赛");
    assert(await permission.check(user, contestEndedModsPrv), "User 可以在比赛结束后读取担任 mod 的私有比赛");
    assert(await permission.check(user, contestEndedJuriesPub), "User 可以在比赛结束后读取担任 jury 的公开比赛");
    assert(await permission.check(user, contestEndedJuriesPrv), "User 可以在比赛结束后读取担任 jury 的私有比赛");
    assert(await permission.check(user, contestEndedAttendeesPub), "User 可以在比赛结束后读取担任 attendee 的公开比赛");
    assert(await permission.check(user, contestEndedAttendeesPrv), "User 可以在比赛结束后读取担任 attendee 的私有比赛");
    assert(await permission.check(user, contestEndedGuestsPub), "User 可以在比赛结束后读取其他的公开比赛");
    assert(!(await permission.check(user, contestEndedGuestsPrv)), "User 不可以在比赛结束后读取其他的私有比赛");

    assert(await permission.check(banned, contestEndedModsPub), "Banned 可以在比赛结束后读取担任 mod 的公开比赛");
    assert(await permission.check(banned, contestEndedModsPrv), "Banned 可以在比赛结束后读取担任 mod 的私有比赛");
    assert(await permission.check(banned, contestEndedJuriesPub), "Banned 可以在比赛结束后读取担任 jury 的公开比赛");
    assert(await permission.check(banned, contestEndedJuriesPrv), "Banned 可以在比赛结束后读取担任 jury 的私有比赛");
    assert(await permission.check(banned, contestEndedAttendeesPub), "Banned 可以在比赛结束后读取担任 attendee 的公开比赛");
    assert(await permission.check(banned, contestEndedAttendeesPrv), "Banned 可以在比赛结束后读取担任 attendee 的私有比赛");
    assert(await permission.check(banned, contestEndedGuestsPub), "Banned 可以在比赛结束后读取其他的公开比赛");
    assert(!(await permission.check(banned, contestEndedGuestsPrv)), "Banned 不可以在比赛结束后读取其他的私有比赛");

    assert(await permission.check(guest, contestEndedGuestsPub), "Guest 可以在比赛结束后读取其他的公开比赛");
    assert(!(await permission.check(guest, contestEndedGuestsPrv)), "Guest 不可以在比赛结束后读取其他的私有比赛");
  });
});
