const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const responseText = document.getElementById("responseText");
const confirmMessage = document.getElementById("confirmMessage");
const choice = document.getElementById("choice");
const invitation = document.getElementById("invitation");
const lockedCards = document.querySelectorAll(".locked-plan");
const lockCountdowns = document.querySelectorAll(".lock-countdown");
const revealItems = document.querySelectorAll(".reveal");
const unlockDate = new Date("2026-04-06T12:00:00");
const timerEnabled = true;

let hasClickedYes = false;
let invitationOpened = false;
let timerId = null;
let lockedContentUnlocked = false;

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

  if (remaining <= 0) {
    lockCountdowns.forEach((item) => {
      item.textContent = "Unlocked now";
    });
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    if (hasClickedYes) {
      unlockLockedContent();
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
