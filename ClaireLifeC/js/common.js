const originalSwalFire = Swal.fire.bind(Swal);

Swal.fire = function (...args) {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if(args[0] && typeof args[0] === "object"){

        args[0].position = "top";

        args[0].customClass = {
            ...args[0].customClass,
            popup: "top-alert"
        };

    }

    return originalSwalFire(...args);

};
