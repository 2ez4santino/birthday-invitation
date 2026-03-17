const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const responseText = document.getElementById("responseText");
const confirmMessage = document.getElementById("confirmMessage");
const choice = document.getElementById("choice");
const invitation = document.getElementById("invitation");
const lockedCards = document.querySelectorAll(".locked-plan:not(#dayPlanCard)");
const lockCountdowns = document.querySelectorAll(".lock-countdown");
const revealItems = document.querySelectorAll(".reveal");
const unlockDate = new Date("2026-04-06T00:00:00");
const timerEnabled = true;
const timelineItems = Array.from(document.querySelectorAll("#dayPlanCard .timeline li"));

let hasClickedYes = false;
let invitationOpened = false;
let timerId = null;
let lockedContentUnlocked = false;

const parseTimelineTime = (timeLabel) => {
  const match = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM") {
    hours += 12;
  }

  return new Date(2026, 3, 6, hours, minutes, 0, 0);
};

const formatTimeLabel = (date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const timelineSchedule = timelineItems.map((item) => {
  const timeNode = item.querySelector(".time");
  const unlockAt = timeNode ? parseTimelineTime(timeNode.textContent) : null;
  return { item, unlockAt };
});

const setTimelineItemLocked = (item, locked, unlockAt) => {
  item.classList.toggle("is-locked", locked);

  if (locked && unlockAt) {
    item.setAttribute("data-lock-label", `Locked until ${formatTimeLabel(unlockAt)}`);
    return;
  }

  item.removeAttribute("data-lock-label");
};

const updateTimelineLocks = () => {
  if (!timerEnabled) {
    timelineSchedule.forEach(({ item }) => {
      setTimelineItemLocked(item, false);
    });
    return;
  }

  const now = Date.now();
  timelineSchedule.forEach(({ item, unlockAt }) => {
    if (!unlockAt) {
      setTimelineItemLocked(item, false);
      return;
    }

    const isUnlocked = now >= unlockAt.getTime();
    setTimelineItemLocked(item, !isUnlocked, unlockAt);
  });
};

const hasPendingTimelineLocks = () => {
  const now = Date.now();
  return timelineSchedule.some(({ unlockAt }) => unlockAt && now < unlockAt.getTime());
};

const revealWithDelay = () => {
  revealItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("show");
    }, index * 130);
  });
};

const burstHearts = () => {
  for (let i = 0; i < 18; i += 1) {
    setTimeout(() => {
      const heart = document.createElement("span");
      heart.className = "heart";
      heart.innerHTML = "&hearts;";
      heart.style.left = `${Math.floor(Math.random() * 100)}vw`;
      heart.style.fontSize = `${Math.floor(Math.random() * 12) + 12}px`;
      heart.style.setProperty("--x", `${Math.floor(Math.random() * 220) - 110}px`);
      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 3000);
    }, i * 95);
  }
};

const setLockedCards = (locked) => {
  lockedCards.forEach((card) => {
    card.classList.toggle("is-locked", locked);
  });
  lockedContentUnlocked = !locked;
};

const openInvitation = () => {
  if (invitationOpened) {
    return;
  }

  invitationOpened = true;
  invitation.classList.add("open");
  yesButton.disabled = true;
  noButton.disabled = true;
  yesButton.style.opacity = "0.78";
  noButton.style.opacity = "0.78";
  burstHearts();
};

const unlockLockedContent = () => {
  if (lockedContentUnlocked) {
    return;
  }

  setLockedCards(false);
  responseText.textContent = "";
};

const formatRemaining = (remainingMs) => {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const updateCountdown = () => {
  const remaining = unlockDate.getTime() - Date.now();

  updateTimelineLocks();

  if (remaining <= 0) {
    lockCountdowns.forEach((item) => {
      item.textContent = "Unlocked now";
    });

    if (hasClickedYes) {
      unlockLockedContent();
    }

    if (timerId && !hasPendingTimelineLocks()) {
      clearInterval(timerId);
      timerId = null;
    }

    return;
  }

  const remainingText = formatRemaining(remaining);
  lockCountdowns.forEach((item) => {
    item.textContent = remainingText;
  });
};

yesButton.addEventListener("click", () => {
  if (!timerEnabled) {
    setLockedCards(false);
    updateTimelineLocks();
    openInvitation();
    choice.style.display = "none";
    confirmMessage.textContent = "It's a date!";
    return;
  }

  hasClickedYes = true;
  setLockedCards(true);
  openInvitation();
  confirmMessage.textContent = "It's a date!";
  choice.style.display = "none";
  updateCountdown();
  
  if (!timerId && !lockedContentUnlocked) {
    timerId = setInterval(updateCountdown, 1000);
  }
});

noButton.addEventListener("click", () => {
  responseText.textContent = "Oh men";
});

window.addEventListener("load", () => {
  setLockedCards(timerEnabled);
  updateTimelineLocks();
  revealWithDelay();
});

// Prevent copying locked content
document.addEventListener("copy", (e) => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());
  
  if (container.closest(".locked-plan.is-locked")) {
    e.preventDefault();
  }
});
