document.addEventListener('DOMContentLoaded', async () => {
    await ymaps.ready(init);

    let map, routeLine, routePoints = [], recording = false;
    const recordButton = document.getElementById('recordButton');

    function init() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const coords = [position.coords.latitude, position.coords.longitude];
                // Initialize the map at the user's current location
                map = new ymaps.Map('map', {
                    center: coords,
                    zoom: 12,
                    controls: ['zoomControl', 'fullscreenControl']
                });

                // Create the route line
                routeLine = new ymaps.Polyline([], {
                    strokeColor: '#0000FF',
                    strokeWidth: 5,
                });

                map.geoObjects.add(routeLine);

                // Add event listener to the record button
                recordButton.addEventListener('click', toggleRecording);
            }, error => {
                console.error('Error getting position:', error);
                // Fallback coordinates if geolocation fails
                initMapWithFallbackCoords();
            });
        } else {
            alert('Геолокация не поддерживается вашим браузером');
            // Fallback coordinates if geolocation is not supported
            initMapWithFallbackCoords();
        }
    }

    function initMapWithFallbackCoords() {
        map = new ymaps.Map('map', {
            center: [55.753994, 37.622093], // Moscow coordinates
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl']
        });

        // Create the route line
        routeLine = new ymaps.Polyline([], {
            strokeColor: '#0000FF',
            strokeWidth: 5,
        });

        map.geoObjects.add(routeLine);

        // Add event listener to the record button
        recordButton.addEventListener('click', toggleRecording);
    }

    function toggleRecording() {
        recording = !recording;
        if (recording) {
            recordButton.textContent = 'Остановить запись';
            recordButton.style.backgroundColor = '#f00'; // Change button color to red
            startGeolocation(); // Start tracking user's location

            // Switch to 3D mode
            map.panes.get('ground').getElement().style.transform = 'perspective(500px) rotateX(10deg)';
        } else {
            recordButton.textContent = 'Начать запись';
            recordButton.style.backgroundColor = '#fff'; // Reset button color
            navigator.geolocation.clearWatch(geolocationWatchId); // Stop tracking user's location

            // Switch back to 2D mode
            map.panes.get('ground').getElement().style.transform = '';

            if (routePoints.length > 1) {
                // Add a marker for the end point
                const endPoint = routePoints[routePoints.length - 1];
                map.geoObjects.add(new ymaps.Placemark(endPoint, {
                    balloonContent: 'Конечная точка'
                }, {
                    preset: 'islands#greenDotIcon'
                }));
            }
        }
    }

    let geolocationWatchId;
    function startGeolocation() {
        if (navigator.geolocation) {
            geolocationWatchId = navigator.geolocation.watchPosition(position => {
                const coords = [position.coords.latitude, position.coords.longitude];
                updatePosition(coords);
            }, error => {
                console.error('Error getting position:', error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000
            });
        } else {
            alert('Геолокация не поддерживается вашим браузером');
        }
    }

    function updatePosition(coords) {
        // Add new position to the route points
        routePoints.push(coords);

        // Update the route line with new points
        routeLine.geometry.setCoordinates(routePoints);

        // Update map center
        map.setCenter(coords);

        // Add a placemark for the current position
        map.geoObjects.add(new ymaps.Placemark(coords, {
            balloonContent: 'Вы здесь'
        }, {
            preset: 'islands#redDotIcon'
        }));

        // Add a marker for the start point if it's the first point
        if (routePoints.length === 1) {
            map.geoObjects.add(new ymaps.Placemark(coords, {
                balloonContent: 'Начальная точка'
            }, {
                preset: 'islands#blueDotIcon'
            }));
        }
    }

    function clearMap() {
        // Clear all objects from the map
        map.geoObjects.removeAll();
        // Clear the route points
        routePoints = [];
        // Reset the route line
        routeLine.geometry.setCoordinates([]);
    }
});

