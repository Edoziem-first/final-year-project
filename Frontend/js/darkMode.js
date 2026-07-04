function applyDarkMode() {
    const darkMode = localStorage.getItem("darkMode");

    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function toggleDarkMode() {
    const darkMode = localStorage.getItem("darkMode");

    if (darkMode === "enabled") {
        localStorage.setItem("darkMode", "disabled");
    } else {
        localStorage.setItem("darkMode", "enabled");
    }

    applyDarkMode();
}

applyDarkMode();