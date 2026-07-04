document.addEventListener(
    "DOMContentLoaded",

    function () {

        const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


        if (!user) {

            window.location.href =
            "../pages/login.html";

            return;

        }


        document.getElementById(
            "profileName"
        ).innerText =
        user.full_name ||
        "-";


        document.getElementById(
            "profileEmail"
        ).innerText =
        user.email ||
        "-";


        document.getElementById(
            "profileRole"
        ).innerText =
        user.role ||
        "-";


        document.getElementById(
            "profileId"
        ).innerText =
        user.id ||
        "-";

    }
);