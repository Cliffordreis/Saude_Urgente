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

        // Função para buscar hospitais dentro da área visível do mapa
        async function searchHospitals() {
            const bbox = map.getBounds();
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&bounded=1&viewbox=${bbox.getWest()},${bbox.getSouth()},${bbox.getEast()},${bbox.getNorth()}&addressdetails=1`;

            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Saude_Urgente/1.0 (cliffordreis69@gmail.com)' // User-Agent
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

        // Função para buscar sugestões dinâmicas enquanto o usuário digita
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

                // Verifica se o resultado já está no cache
                const cachedResults = localStorage.getItem(query);
                if (cachedResults) {
                    const data = JSON.parse(cachedResults);
                    showResults(data);
                    return;
                }

                // Adicionando "hospital" na busca para priorizar estabelecimentos de saúde
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' hospital')}&limit=5&addressdetails=1`;

                try {
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'Saude_Urgente/1.0 (cliffordreis69@gmail.com)' // User-Agent
                        }
                    });
                    const data = await response.json();

                    // Salva os resultados no cache
                    localStorage.setItem(query, JSON.stringify(data));

                    showResults(data);
                } catch (error) {
                    console.error("Erro ao buscar sugestões:", error);
                }
            }, 500); // Debounce de 500ms
        };

        // Função para exibir os resultados na tela
        function showResults(data) {
            const resultsBox = document.getElementById("searchResults");
            resultsBox.innerHTML = "";
            resultsBox.style.display = data.length > 0 ? "block" : "none";

            data.forEach(place => {
                // Filtra por locais que sejam hospitais ou tenham nomes relevantes
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

            // Se ainda não houver resultados, exibe os primeiros disponíveis
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

        // Função para buscar a localização digitada e mover o mapa para ela
        window.searchLocation = async function () {
            const query = document.getElementById("searchBox").value;
            if (!query) return alert("Digite um local para buscar!");

            // Verifica se o resultado já está no cache
            const cachedResults = localStorage.getItem(query);
            if (cachedResults) {
                const data = JSON.parse(cachedResults);
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    map.flyTo({ center: [lon, lat], zoom: 17 });
                    return;
                }
            }

            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Saude_Urgente/1.0 (cliffordreis69@gmail.com)' // User-Agent
                    }
                });
                const data = await response.json();

                // Salva os resultados no cache
                localStorage.setItem(query, JSON.stringify(data));

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

        // Chama a função ao carregar o mapa e quando ele for movido
        map.on("load", searchHospitals);
        map.on("moveend", searchHospitals);
    })
    .catch(error => console.error("Erro ao carregar a chave:", error));