let map;
        let marker;
        let polyline;
        let path = [];
        let recording = false;
        let watchId;
        const recordButton = document.getElementById('recordButton');

        function initMap() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    map = new google.maps.Map(document.getElementById('map'), {
                        center: coords,
                        zoom: 16,
                        mapTypeId: 'roadmap',
                        tilt: 0 // Ensure initial 2D view
                    });

                    marker = new google.maps.Marker({
                        position: coords,
                        map: map,
                        title: 'Вы здесь'
                    });

                    polyline = new google.maps.Polyline({
                        map: map,
                        path: path,
                        geodesic: true,
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });

                    recordButton.addEventListener('click', toggleRecording);
                }, error => {
                    console.error('Error getting position:', error);
                    alert('Не удалось определить ваше местоположение.');
                });
            } else {
                alert('Геолокация не поддерживается вашим браузером.');
            }
        }

        function toggleRecording() {
            recording = !recording;
            if (recording) {
                recordButton.innerText = 'Остановить запись';
                map.setTilt(45); // Switch to 3D view
                startRecording();
            } else {
                recordButton.innerText = 'Начать запись';
                map.setTilt(0); // Switch back to 2D view
                stopRecording();
            }
        }

        function startRecording() {
            watchId = navigator.geolocation.watchPosition(position => {
                const newCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Add the new coordinates to the path and update the polyline
                path.push(newCoords);
                polyline.setPath(path);
                map.panTo(newCoords); // Optional: pan the map to the new position

                // Update the marker's position
                marker.setPosition(newCoords);
            }, error => {
                console.error('Error getting position:', error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            });
        }

        function stopRecording() {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        }

        window.onload = initMap;