# SaveBoard — store release notes

Copy-paste ready. Same text works for the App Store "What's New" and the Play
Console release notes. Play's limit is 500 characters per language.

---

## iOS 1.0.10 / Android 1.0.15

Leads with sharing, because that is where every change in this build lands.
The Android "go back to the app you came from" line is real only on Android;
the wording keeps it neutral ("gets out of your way") so the same text is true
on iOS, where the share extension already dismissed itself. The thumbnail
persistence is the fix people were reporting as "my Instagram card went blank".

### English

```
Saving from other apps just got smoother. Share a TikTok link and SaveBoard now picks up the title and thumbnail. Instagram, Facebook, TikTok and X previews no longer disappear after a few days — SaveBoard keeps its own copy. After you save from the share sheet, SaveBoard gets out of your way and returns you to what you were doing. Plus small layout fixes.
```

### 한국어

```
다른 앱에서 저장하기가 더 매끄러워졌어요. 틱톡 링크를 공유하면 제목과 썸네일을 바로 가져옵니다. 인스타그램·페이스북·틱톡·X 미리보기가 며칠 뒤 사라지던 문제도 해결 — SaveBoard가 직접 사본을 보관해요. 공유 시트에서 저장하면 SaveBoard가 물러나고 하던 앱으로 돌아갑니다. 자잘한 화면 수정도 포함돼 있어요.
```

---

## iOS 1.0.9 / Android 1.0.14

Leads with startup speed — the change every user feels on every launch. The
Android payment-screen repair is stated from the user's side ("clearer payment
guidance"), not as the bug it was. Wording is platform-neutral so the same text
works on both stores.

### English

```
SaveBoard now opens in seconds — no more long wait at launch. New: pin the sidebar open, set reminders on saved links (Pro), and clean up duplicate or broken links in one tap (Pro). Memo cards have a cleaner text-first look, and board owners can pin announcements to the top. Payment and plan guidance in the app is clearer too.
```

### 한국어

```
SaveBoard가 이제 몇 초 만에 열려요 — 시작할 때 오래 기다리지 않아도 됩니다. 새 기능: 사이드바 고정, 저장한 링크 리마인더(Pro), 중복·깨진 링크 한 번에 정리(Pro). 메모 카드는 텍스트 중심으로 더 깔끔해졌고, 보드 주인은 공지 카드를 맨 위에 고정할 수 있어요. 앱 안의 결제·플랜 안내도 더 명확해졌습니다.
```

---

## iOS 1.0.8 / Android 1.0.13

Leads with the billing recovery path, because that is the change users can
actually feel: a failed payment used to be a dead end with no way to fix a card
from inside the app. The iOS layout fix is real but secondary, and Android users
should not be told about a change they will not see — hence the shared wording
below stays platform-neutral.

### English

```
YouTube videos play inside SaveBoard again — tap a video card and it plays right there, no bouncing out. And if a payment ever fails, SaveBoard now explains what happened and lets you update your card from the Billing screen — nothing you saved is ever deleted. Plus a cleaner, tidier layout on iPhone.
```

### 한국어

```
유튜브 영상이 SaveBoard 안에서 다시 재생돼요 — 영상 카드를 누르면 바로 그 자리에서 재생됩니다. 결제가 실패하면 무슨 일인지 알려드리고 결제 화면에서 바로 카드를 변경할 수 있어요(저장한 링크는 삭제되지 않아요). 아이폰 화면도 더 깔끔해졌어요.
```

---

## iOS 1.0.7 / Android 1.0.12

This release has **no user-facing change** — it exists so the app records the
device and locale needed by the admin dashboard. The notes below say that
honestly rather than dressing it up; users notice invented features that aren't
there, and it costs more trust than a dull release note ever does.

### English

```
Behind-the-scenes maintenance to keep SaveBoard running smoothly. No changes to how the app works.
```

### 한국어

```
안정적인 사용을 위한 내부 개선입니다. 사용 방식에 바뀐 점은 없습니다.
```

---

## Template for the next release

Lead with what a user will actually notice, in their words — "Links you save
from other apps now land in the right board", not "fixed onNewIntent handling".
One to three lines. Skip anything invisible to them.

If the release is genuinely internal, reuse the maintenance wording above rather
than inflating it.
