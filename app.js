let map;
let line;
let startPoint;
let endPoint;
let recording = false;
let watchId;
let allPoints = []; // Массив для хранения всех точек маршрута

document.addEventListener('DOMContentLoaded', () => {
    ymaps.ready(initMap);
});

function initMap() {
    map = new ymaps.Map('map', {
        center: [55.753994, 37.622093], // Moscow coordinates
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl']
    });

    line = new ymaps.Polyline([], {
        strokeColor: '#FF0000',
        strokeWidth: 4
    }, {
        draggable: false
    });

    map.geoObjects.add(line);

    document.getElementById('recordButton').addEventListener('click', toggleRecording);
}

function toggleRecording() {
    recording = !recording;
    if (recording) {
        document.getElementById('recordButton').innerText = 'Остановить запись';
        startRecording();
    } else {
        document.getElementById('recordButton').innerText = 'Начать запись';
        stopRecording();
    }
}

function startRecording() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(position => {
            const coords = [position.coords.latitude, position.coords.longitude];

            if (!startPoint) {
                startPoint = coords;
                map.geoObjects.add(new ymaps.Placemark(startPoint, { hintContent: 'Старт' }));
            }

            // Добавляем координаты в массив всех точек
            allPoints.push(coords);

            // Обновляем конечную точку и строим линию
            endPoint = coords;
            map.geoObjects.add(new ymaps.Placemark(endPoint, { hintContent: 'Финиш' }));

            const lineCoords = [startPoint, endPoint];
            line.geometry.setCoordinates(lineCoords);
            map.setCenter(endPoint);
        }, error => {
            console.error('Error getting position:', error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    } else {
        alert('Геолокация не поддерживается вашим браузером.');
    }
}

function stopRecording() {
    if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
    }
}

window.onload = initMap;