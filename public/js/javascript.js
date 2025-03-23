// Buscar a chave do Mapbox do backend
fetch('/api/key')
    .then(response => response.json())
    .then(data => {
        if (!data.key) {
            console.error("Erro: Chave do Mapbox não encontrada!");
            return;
        }

        // Inicializar o Mapbox
        mapboxgl.accessToken = data.key;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-34.8813, -8.05428], // Recife-PE
            zoom: 13
        });

        // Cache em memória para buscas
        const searchCache = new Map();

        // Função para buscar hospitais dentro da área visível do mapa
        async function searchHospitals() {
            const bbox = map.getBounds();
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&bounded=1&viewbox=${bbox.getWest()},${bbox.getSouth()},${bbox.getEast()},${bbox.getNorth()}&addressdetails=1`;

            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Saude_Urgente/1.0 (cliffordreis69@gmail.com)'
                    }
                });
                const data = await response.json();

                data.forEach((place) => {
                    const name = place.address?.hospital || place.address?.name || place.display_name.split(",")[0];
                    const vicinity = place.address?.road || place.address?.suburb || place.address?.city || "Endereço desconhecido";

                    const el = document.createElement("div");
                    el.className = "custom-marker";

                    el.addEventListener("click", () => {
                        window.location.href = `/detalhes?name=${encodeURIComponent(name)}&idHosp=${place.osm_id}&vicinity=${encodeURIComponent(vicinity)}`;
                    });

                    new mapboxgl.Marker(el, { anchor: "bottom" })
                        .setLngLat([place.lon, place.lat])
                        .setPopup(new mapboxgl.Popup().setHTML(`<b>${name}</b><br>${vicinity}`))
                        .addTo(map);
                });
            } catch (error) {
                console.error("Erro ao buscar hospitais:", error);
            }
        }

        // Função para buscar sugestões dinâmicas
        let debounceTimer;
        window.autocompleteSearch = function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const query = document.getElementById("searchBox").value;
                const resultsBox = document.getElementById("searchResults");

                if (!query) {
                    resultsBox.innerHTML = "";
                    resultsBox.style.display = "none";
                    return;
                }

                // Verifica cache em memória
                const cachedData = searchCache.get(query);
                if (cachedData) {
                    showResults(cachedData);
                    return;
                }

                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' hospital')}&limit=5&addressdetails=1`;

                try {
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'Saude_Urgente/1.0 (cliffordreis69@gmail.com)'
                        }
                    });
                    const data = await response.json();

                    // Atualiza cache
                    searchCache.set(query, data);
                    showResults(data);
                } catch (error) {
                    console.error("Erro ao buscar sugestões:", error);
                }
            }, 500);
        };

        // Função para exibir resultados
        function showResults(data) {
            const resultsBox = document.getElementById("searchResults");
            resultsBox.innerHTML = "";
            resultsBox.style.display = data.length > 0 ? "block" : "none";

            data.forEach(place => {
                if (place.type === "hospital" || place.display_name.toLowerCase().includes("hospital")) {
                    const resultItem = document.createElement("div");
                    resultItem.className = "search-result";
                    resultItem.textContent = place.display_name;

                    resultItem.addEventListener("click", () => {
                        document.getElementById("searchBox").value = place.display_name;
                        resultsBox.innerHTML = "";
                        resultsBox.style.display = "none";
                        map.flyTo({ center: [place.lon, place.lat], zoom: 17 });
                    });

                    resultsBox.appendChild(resultItem);
                }
            });

            if (resultsBox.innerHTML === "") {
                data.forEach(place => {
                    const resultItem = document.createElement("div");
                    resultItem.className = "search-result";
                    resultItem.textContent = place.display_name;

                    resultItem.addEventListener("click", () => {
                        document.getElementById("searchBox").value = place.display_name;
                        resultsBox.innerHTML = "";
                        resultsBox.style.display = "none";
                        map.flyTo({ center: [place.lon, place.lat], zoom: 17 });
                    });

                    resultsBox.appendChild(resultItem);
                });
            }
        }

        // Função de busca principal
        window.searchLocation = async function () {
            const query = document.getElementById("searchBox").value;
            if (!query) return alert("Digite um local para buscar!");

            // Verifica cache em memória
            const cachedData = searchCache.get(query);
            if (cachedData && cachedData.length > 0) {
                const { lat, lon } = cachedData[0];
                map.flyTo({ center: [lon, lat], zoom: 17 });
                return;
            }

            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Saude_Urgente/1.0 (cliffordreis69@gmail.com)'
                    }
                });
                const data = await response.json();

                // Atualiza cache
                searchCache.set(query, data);

                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    map.flyTo({ center: [lon, lat], zoom: 17 });
                } else {
                    alert("Local não encontrado!");
                }
            } catch (error) {
                console.error("Erro ao buscar localização:", error);
            }
        };

        // Botão de geolocalização (mantido igual)
        window.getUserLocation = function() {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        map.flyTo({ center: [lon, lat], zoom: 15 });
                    },
                    (error) => {
                        alert("Erro ao obter localização: " + error.message);
                    }
                );
            } else {
                alert("Geolocalização não é suportada pelo seu navegador.");
            }
        }

        map.on("load", searchHospitals);
        map.on("moveend", searchHospitals);
    })
    .catch(error => console.error("Erro ao carregar a chave:", error));