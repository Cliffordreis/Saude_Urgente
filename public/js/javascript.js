let map;
let service;
let infowindow;

async function initMap() {
  // The initial location 
  const position = { lat: -8.05428, lng: -34.8813 };
  
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");

  // The map, centered at the specified position
  map = new Map(document.getElementById("map"), {
    zoom: 15,
    center: position,
    mapId: "df543a1845a91201",
    disableDefaultUI: true,
  });

  // Create a PlacesService instance
  service = new google.maps.places.PlacesService(map);
  
  // Perform initial search for hospitals
  searchHospitals(position);

  // Add listener for when the map is dragged
  map.addListener('dragend', () => {
    const center = map.getCenter();
    searchHospitals(center);
  });
}

// Function to search for hospitals around a given location
function searchHospitals(location) {
  const request = {
    location: location,
    radius: '2000', // 2 km
    type: ['hospital'], // Type of places to search for
    keyword: 'público' // Keyword to filter for public hospitals
  };

  // Perform a nearby search
  service.nearbySearch(request, callback);
}

// Callback function to handle results from nearby search
function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    results.forEach((place) => {
      createMarker(place);
    });
  } else {
    console.error('Erro ao buscar hospitais:', status);
  }
}

// Function to create markers on the map
function createMarker(place) {
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
    icon: {
      url : "/images/icomp.png",
      scaledSize: new google.maps.Size(32, 39), // Tamanho do ícone
    },
  });

  // Adiciona um listener ao marcador para redirecionar ao clicar
  google.maps.event.addListener(marker, "click", () => {
    
    // Redireciona para a página detalhes passando os parâmetros pela URL
    window.location.href = `/detalhes?name=${encodeURIComponent(
      place.name
    )}&idHosp=${encodeURIComponent(place.place_id)}&vicinity=${encodeURIComponent(
      place.vicinity
    )}`;
  });
}


// Initialize the map
initMap();
