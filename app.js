let map;
        let line;
        let startPoint;
        let endPoint;
        let recording = false;
        let watchId;
        let path = [];

        document.addEventListener('DOMContentLoaded', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const userCoords = [position.coords.latitude, position.coords.longitude];
                    ymaps.ready(() => initMap(userCoords));
                }, error => {
                    console.error('Error getting position:', error);
                    alert('Не удалось определить ваше местоположение.');
                });
            } else {
                alert('Геолокация не поддерживается вашим браузером.');
            }
        });

        function initMap(userCoords) {
            map = new ymaps.Map('map', {
                center: userCoords,
                zoom: 16,
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

                    path.push(coords);

                    endPoint = coords;
                    const lineCoords = [startPoint, ...path, endPoint];
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
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        }