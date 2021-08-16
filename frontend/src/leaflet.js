(function () {
    'use strict';
    const ready = function () {
        if (document.body && document.querySelector('#map')) {
            var map = L.map('map').setView([0, 0], 1);

            L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=tZS8oEMabH7RTxEUbJxB', {
                attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
            }).addTo(map);

            var marker = L.marker([52.07025598000335, 5.0762239656280075]).addTo(map);
        }
        window.requestAnimationFrame(ready);
    }

    window.requestAnimationFrame(ready);
})