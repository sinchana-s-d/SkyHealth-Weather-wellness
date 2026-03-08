// API Configuration
const API_KEY = 'ADD_your api_key'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const weatherDisplay = document.getElementById('weather-display');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');

// Weather Display Elements
const cityNameEl = document.getElementById('city-name');
const dateEl = document.getElementById('date');
const temperatureEl = document.getElementById('temperature');
const tempUnitEl = document.getElementById('temp-unit');
const weatherIconEl = document.getElementById('weather-icon');
const weatherDescEl = document.getElementById('weather-description');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const pressureEl = document.getElementById('pressure');
const hourlyContainer = document.getElementById('hourly-forecast');
const dailyContainer = document.getElementById('daily-forecast');

// New Elements
const voiceSearchBtn = document.getElementById('voice-search-btn');
const voiceStatus = document.getElementById('voice-status');
const healthAdviceSection = document.getElementById('health-advice-section');
const healthAdviceContent = document.getElementById('health-advice-content');
const weatherMapSection = document.getElementById('weather-map-section');
const mapContainer = document.getElementById('map-container');
const popularCitiesContainer = document.getElementById('popular-cities-container');

// State
let currentUnit = 'metric';
let currentWeatherData = null;
let forecastData = null;
let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
let map = null;
let mapMarker = null;
let recognition = null;

// State to city mapping
const stateToCapitalMap = {
    'karnataka': 'Bangalore',
    'maharashtra': 'Mumbai',
    'tamil nadu': 'Chennai',
    'delhi': 'New Delhi',
    'west bengal': 'Kolkata',
    'telangana': 'Hyderabad',
    'uttar pradesh': 'Lucknow',
    'gujarat': 'Ahmedabad',
    'rajasthan': 'Jaipur',
    'punjab': 'Chandigarh',
    'haryana': 'Chandigarh',
    'madhya pradesh': 'Bhopal',
    'bihar': 'Patna',
    'odisha': 'Bhubaneswar',
    'kerala': 'Thiruvananthapuram',
    'andhra pradesh': 'Amaravati',
    'assam': 'Dispur'
};

// Popular cities
const popularCities = [
    'Mumbai,IN', 'Delhi,IN', 'Bangalore,IN', 'Chennai,IN', 
    'Kolkata,IN', 'Hyderabad,IN', 'Pune,IN', 'Ahmedabad,IN',
    'Jaipur,IN', 'Lucknow,IN', 'New Delhi,IN'
];

// Weather alerts mapping
const weatherAlerts = {
    'thunderstorm': { 
        level: 'severe', 
        icon: '⛈️', 
        title: 'Thunderstorm Warning',
        message: 'Thunderstorm expected. Seek shelter indoors.'
    },
    'heavy intensity rain': { 
        level: 'severe', 
        icon: '🌧️', 
        title: 'Heavy Rain Alert',
        message: 'Heavy rainfall warning. Possible flooding.'
    },
    'very heavy rain': { 
        level: 'severe', 
        icon: '🌧️', 
        title: 'Very Heavy Rain Alert',
        message: 'Extremely heavy rainfall. Stay indoors.'
    },
    'extreme rain': { 
        level: 'severe', 
        icon: '⚠️', 
        title: 'Extreme Rain Warning',
        message: 'Extreme rainfall expected.'
    },
    'moderate rain': { 
        level: 'warning', 
        icon: '☔', 
        title: 'Moderate Rain',
        message: 'Moderate rainfall expected. Carry an umbrella.'
    },
    'light rain': { 
        level: 'info', 
        icon: '🌦️', 
        title: 'Light Rain',
        message: 'Light rainfall expected.'
    },
    'drizzle': { 
        level: 'info', 
        icon: '🌦️', 
        title: 'Drizzle',
        message: 'Light drizzle expected.'
    },
    'rain': { 
        level: 'warning', 
        icon: '🌧️', 
        title: 'Rain Expected',
        message: 'Rain expected. Keep an umbrella handy.'
    },
    'shower rain': { 
        level: 'warning', 
        icon: '☔', 
        title: 'Rain Showers',
        message: 'Rain showers expected.'
    },
    'mist': { 
        level: 'info', 
        icon: '🌫️', 
        title: 'Misty Conditions',
        message: 'Misty conditions. Drive carefully.'
    },
    'fog': { 
        level: 'info', 
        icon: '🌫️', 
        title: 'Fog Alert',
        message: 'Foggy conditions. Reduced visibility.'
    },
    'haze': { 
        level: 'info', 
        icon: '🌫️', 
        title: 'Hazy Conditions',
        message: 'Hazy conditions expected.'
    },
    'strong winds': { 
        level: 'warning', 
        icon: '💨', 
        title: 'Strong Winds',
        message: 'Strong winds expected. Secure outdoor items.'
    },
    'clear': { 
        level: 'nice', 
        icon: '☀️', 
        title: 'Clear Sky',
        message: 'Beautiful clear weather.'
    },
    'clouds': { 
        level: 'info', 
        icon: '☁️', 
        title: 'Cloudy',
        message: 'Cloudy conditions.'
    },
    'few clouds': { 
        level: 'nice', 
        icon: '⛅', 
        title: 'Partly Cloudy',
        message: 'Partly cloudy skies.'
    },
    'scattered clouds': { 
        level: 'info', 
        icon: '☁️', 
        title: 'Scattered Clouds',
        message: 'Scattered cloud cover.'
    },
    'broken clouds': { 
        level: 'info', 
        icon: '☁️', 
        title: 'Broken Clouds',
        message: 'Broken cloud cover.'
    },
    'overcast clouds': { 
        level: 'info', 
        icon: '☁️', 
        title: 'Overcast',
        message: 'Overcast conditions.'
    },
    'snow': { 
        level: 'warning', 
        icon: '❄️', 
        title: 'Snow Expected',
        message: 'Snowfall expected. Dress warmly.'
    },
    'heavy snow': { 
        level: 'severe', 
        icon: '❄️', 
        title: 'Heavy Snow Warning',
        message: 'Heavy snowfall expected. Travel with caution.'
    }
};

// Enhanced skin care tips with detailed points
const skinCareTips = {
    'sunny': [
        '🧴 **SUN PROTECTION ESSENTIALS**',
        '• Apply broad-spectrum sunscreen SPF 30+ every 2 hours',
        '• Reapply immediately after swimming or sweating',
        '• Use lip balm with SPF to protect lips',
        '• Wear wide-brimmed hat for extra protection',
        '• Don\'t forget neck, ears, and back of hands',
        '• Seek shade during peak sun hours (10 AM - 4 PM)',
        '• Wear UV-protective sunglasses for eye health',
        '• Use antioxidant serums (Vitamin C) for extra protection',
        '• Apply sunscreen 20 minutes before going outside',
        '• Use powder sunscreen for easy reapplication over makeup'
    ],
    'cloudy': [
        '☁️ **CLOUDY DAY SKIN CARE**',
        '• UV rays penetrate clouds - still use sunscreen',
        '• Up to 80% of UV rays can pass through clouds',
        '• Light moisturizer with SPF is sufficient',
        '• Don\'t skip sunscreen even on overcast days',
        '• Perfect day for outdoor activities with basic protection',
        '• Cloudy days can still cause sunburn - be careful'
    ],
    'rainy': [
        '☔ **RAINY DAY SKIN CARE**',
        '• Use waterproof sunscreen for outdoor activities',
        '• Carry umbrella to protect face from rain',
        '• Keep face dry to prevent fungal issues',
        '• Use light, non-comedogenic moisturizer',
        '• Rain can wash away sunscreen - reapply after getting wet',
        '• Wear water-resistant makeup if desired',
        '• Keep feet dry to prevent fungal infections',
        '• Use antifungal powder in shoes if needed'
    ],
    'humid': [
        '💧 **HUMID WEATHER SKIN CARE**',
        '• Use oil-free, gel-based moisturizers',
        '• Cleanse face twice daily to prevent clogged pores',
        '• Use clay masks once a week for deep cleansing',
        '• Blotting papers help control shine throughout day',
        '• Choose lightweight, non-comedogenic products',
        '• Use toner to balance skin pH',
        '• Exfoliate gently 2-3 times per week',
        '• Avoid heavy creams that can clog pores',
        '• Use mattifying primers under makeup',
        '• Keep facial mist for refreshing throughout day'
    ],
    'dry': [
        '🏜️ **DRY WEATHER SKIN CARE**',
        '• Use rich, hydrating moisturizer with ceramides',
        '• Apply moisturizer on slightly damp skin',
        '• Use humidifier indoors to add moisture to air',
        '• Drink extra water throughout the day',
        '• Avoid hot showers - use lukewarm water',
        '• Apply lip balm multiple times daily',
        '• Use gentle, hydrating cleansers',
        '• Layer skincare (toner → serum → moisturizer → oil)',
        '• Don\'t forget hands - use hand cream frequently',
        '• Use overnight masks for intense hydration'
    ],
    'cold': [
        '❄️ **COLD WEATHER SKIN CARE**',
        '• Switch to heavier, cream-based moisturizers',
        '• Protect face with scarf in windy conditions',
        '• Apply moisturizer within 3 minutes of washing',
        '• Use overnight masks for intense hydration',
        '• Don\'t skip sunscreen - snow reflects UV rays',
        '• Use gentle, non-foaming cleansers',
        '• Apply rich hand cream and wear gloves outdoors',
        '• Use facial oils for extra protection',
        '• Avoid licking lips - use lip balm instead',
        '• Use richer eye cream for delicate under-eye area'
    ],
    'hot': [
        '🔥 **HOT WEATHER SKIN CARE**',
        '• Use lightweight, water-based moisturizers',
        '• Apply aloe vera for soothing and cooling',
        '• Use facial mists to refresh throughout day',
        '• Cleanse gently to remove sweat and oil',
        '• Stay in air-conditioned spaces when possible',
        '• Use cooling face masks after sun exposure',
        '• Wear loose, breathable fabrics',
        '• Take cool showers to calm skin',
        '• Avoid heavy makeup that can melt',
        '• Keep skincare products in fridge for extra cooling'
    ],
    'windy': [
        '💨 **WINDY WEATHER SKIN CARE**',
        '• Apply barrier cream to protect from windburn',
        '• Cover face with scarf in strong winds',
        '• Use thick, emollient moisturizer',
        '• Protect lips with intensive lip balm',
        '• Wind can dry skin quickly - reapply moisturizer',
        '• Use gentle cleansing to avoid irritation',
        '• Apply soothing products if skin feels raw',
        '• Wear sunglasses to protect eyes from wind'
    ],
    'general': [
        '✨ **DAILY SKIN CARE BASICS**',
        '• Cleanse twice daily - morning and night',
        '• Always remove makeup before bed',
        '• Exfoliate 2-3 times per week',
        '• Use sunscreen every single day',
        '• Moisturize regardless of skin type',
        '• Drink at least 8 glasses of water daily',
        '• Get adequate sleep for skin repair',
        '• Eat antioxidant-rich foods',
        '• Change pillowcases regularly',
        '• Don\'t touch face throughout the day'
    ],
    'night': [
        '🌙 **NIGHT TIME SKIN CARE**',
        '• Double cleanse to remove all impurities',
        '• Use treatment products (retinoids, acids) at night',
        '• Apply richer night cream while sleeping',
        '• Use eye cream for delicate under-eye area',
        '• Sleep on silk pillowcase to reduce friction',
        '• Apply lip mask for overnight hydration',
        '• Don\'t forget neck and chest area',
        '• Use overnight hydrating masks once a week'
    ],
    'morning': [
        '🌅 **MORNING SKIN CARE ROUTINE**',
        '• Gentle cleanse or just rinse with water',
        '• Apply Vitamin C serum for antioxidant protection',
        '• Use lightweight moisturizer',
        '• Apply sunscreen as final step',
        '• Don\'t forget lips and neck',
        '• Wait 2 minutes between products for absorption',
        '• Use eye cream to reduce morning puffiness'
    ]
};

// General health advice based on weather conditions
const healthAdvice = {
    'highTemperature': {
        condition: 'temp > 35',
        advice: [
            '🌡️ **HIGH TEMPERATURE ADVISORY**',
            '• Drink 8-10 glasses of water throughout the day',
            '• Avoid outdoor activities between 11 AM - 4 PM',
            '• Wear light-colored, loose-fitting cotton clothing',
            '• Take cool showers to lower body temperature',
            '• Eat light, water-rich foods like fruits and salads',
            '• Watch for signs of heat exhaustion: dizziness, nausea',
            '• Use fans or air conditioning when available',
            '• Limit caffeine and alcohol consumption',
            '• Check on elderly family members and neighbors',
            '• Never leave children or pets in parked vehicles'
        ]
    },
    'lowTemperature': {
        condition: 'temp < 5',
        advice: [
            '❄️ **COLD WEATHER ADVISORY**',
            '• Dress in 3 warm layers: base, insulating, outer',
            '• Cover all exposed skin: wear hat, gloves, scarf',
            '• Keep moving to maintain body circulation',
            '• Eat warm meals and drink hot beverages',
            '• Ensure proper heating at home (18-20°C)',
            '• Check on elderly neighbors and relatives',
            '• Keep emergency supplies: blankets, food, water',
            '• Avoid alcohol - it lowers body temperature',
            '• Wear waterproof boots to keep feet dry',
            '• Let faucets drip to prevent pipes freezing'
        ]
    },
    'highHumidity': {
        condition: 'humidity > 80',
        advice: [
            '💧 **HIGH HUMIDITY ADVISORY**',
            '• Drink extra water even if not feeling thirsty',
            '• Take cool showers to feel refreshed',
            '• Use dehumidifier indoors if available',
            '• Wear breathable fabrics like cotton and linen',
            '• Avoid strenuous outdoor activities',
            '• Use fans to improve air circulation',
            '• Keep indoor plants that absorb moisture',
            '• Dry clothes outdoors to reduce indoor humidity',
            '• Check for mold in bathrooms and kitchens',
            '• Stay in air-conditioned spaces during peak humidity'
        ]
    },
    'lowHumidity': {
        condition: 'humidity < 30',
        advice: [
            '🏜️ **LOW HUMIDITY ADVISORY**',
            '• Apply moisturizer immediately after shower',
            '• Drink water every hour to stay hydrated',
            '• Use humidifier in bedroom while sleeping',
            '• Keep lips protected with nourishing lip balm',
            '• Avoid hot showers - use lukewarm water',
            '• Place water bowls near radiators',
            '• Use saline nasal spray for dry nasal passages',
            '• Wear sunglasses to protect eyes from dryness',
            '• Avoid caffeine and alcohol that dehydrate',
            '• Keep skin covered in cold, dry winds'
        ]
    },
    'highUV': {
        condition: 'uv > 7',
        advice: [
            '☀️ **HIGH UV INDEX ADVISORY**',
            '• Apply SPF 30+ sunscreen 20 minutes before going out',
            '• Reapply sunscreen every 2 hours',
            '• Wear wide-brimmed hat and UV-blocking sunglasses',
            '• Seek shade between 10 AM and 4 PM',
            '• Wear lightweight long sleeves and pants',
            '• Use umbrella for additional shade',
            '• Check UV index daily through weather apps',
            '• Protect children with appropriate clothing and sunscreen',
            '• UV rays reflect off water, sand, and snow',
            '• Use lip balm with SPF protection'
        ]
    },
    'poorAirQuality': {
        condition: 'aqi > 100',
        advice: [
            '😷 **AIR QUALITY ADVISORY**',
            '• Wear N95 mask when going outdoors',
            '• Keep windows and doors closed',
            '• Use air purifier with HEPA filter indoors',
            '• Avoid outdoor exercise and physical activity',
            '• Keep medications handy if you have respiratory issues',
            '• Wear sunglasses to protect eyes from irritants',
            '• Shower and change clothes after coming indoors',
            '• Use recirculation mode in car AC',
            '• Check air quality forecasts daily',
            '• Elderly and children should stay indoors'
        ]
    },
    'thunderstorm': {
        condition: 'weather contains thunderstorm',
        advice: [
            '⚡ **THUNDERSTORM SAFETY**',
            '• Stay indoors and away from windows',
            '• Unplug electronic appliances',
            '• Avoid using corded phones and electrical equipment',
            '• Stay away from plumbing (sinks, baths, taps)',
            '• If outside, avoid open fields and tall trees',
            '• Crouch low if caught in open area',
            '• Wait 30 minutes after last thunder before going out',
            '• Bring pets indoors',
            '• Secure outdoor furniture and objects',
            '• Keep emergency kit ready: flashlight, batteries'
        ]
    },
    'rain': {
        condition: 'weather contains rain',
        advice: [
            '☔ **RAINY WEATHER SAFETY**',
            '• Carry umbrella and waterproof jacket',
            '• Wear waterproof footwear with good grip',
            '• Drive slowly - roads become slippery',
            '• Avoid walking through flooded areas',
            '• Keep spare dry clothes at work/school',
            '• Use waterproof bag for electronics',
            '• Allow extra travel time',
            '• Check for leaks in roof and windows',
            '• Keep gutters clean to prevent flooding',
            '• Dry shoes thoroughly to prevent odor'
        ]
    },
    'fog': {
        condition: 'weather contains fog or mist',
        advice: [
            '🌫️ **FOGGY CONDITIONS SAFETY**',
            '• Use low beam headlights while driving',
            '• Maintain double the usual following distance',
            '• Use fog lights if your vehicle has them',
            '• Reduce speed significantly',
            '• Listen to traffic updates on radio',
            '• Avoid unnecessary travel if visibility is very low',
            '• Use defroster to keep windows clear',
            '• Follow lane markings carefully',
            '• Be extra careful at intersections',
            '• Pull over safely if visibility becomes too poor'
        ]
    },
    'windy': {
        condition: 'wind > 30',
        advice: [
            '💨 **STRONG WIND ADVISORY**',
            '• Secure loose outdoor items (furniture, plants)',
            '• Hold onto hat and light items when outside',
            '• Be cautious while driving high-profile vehicles',
            '• Avoid parking under trees or power lines',
            '• Wear eye protection if outdoors',
            '• Watch for falling branches and debris',
            '• Close and secure all windows and doors',
            '• Keep emergency kit with flashlight and batteries',
            '• Charge mobile devices fully',
            '• Stay away from coastal areas during high winds'
        ]
    },
    'exercise': {
        condition: 'general',
        advice: [
            '🏃 **OUTDOOR ACTIVITY GUIDE**',
            '• Best time for exercise: early morning or evening',
            '• Check weather before planning outdoor workouts',
            '• Stay hydrated before, during, and after activity',
            '• Wear appropriate clothing for conditions',
            '• Start slowly and warm up properly',
            '• Listen to your body and take breaks',
            '• Have indoor backup plan for bad weather',
            '• Use sunscreen even on cloudy days',
            '• Tell someone your exercise route',
            '• Carry phone for emergencies'
        ]
    },
    'hydration': {
        condition: 'general',
        advice: [
            '💧 **HYDRATION GUIDE**',
            '• Drink water before you feel thirsty',
            '• Aim for 8-10 glasses of water daily',
            '• Increase intake in hot or humid weather',
            '• Carry reusable water bottle everywhere',
            '• Eat water-rich foods: cucumber, watermelon, oranges',
            '• Limit caffeinated and sugary drinks',
            '• Set reminders to drink water regularly',
            '• Check urine color: pale yellow = well hydrated',
            '• Drink extra before, during, after exercise',
            '• Elderly need to be extra mindful of hydration'
        ]
    },
    'sleep': {
        condition: 'general',
        advice: [
            '😴 **SLEEP COMFORT TIPS**',
            '• Keep bedroom cool: 18-20°C ideal for sleep',
            '• Use appropriate bedding for season',
            '• Maintain consistent sleep-wake schedule',
            '• Avoid screens 1 hour before bedtime',
            '• Create relaxing bedtime routine: reading, music',
            '• Keep room dark with blackout curtains',
            '• Use white noise if needed',
            '• Avoid heavy meals before bed',
            '• Limit caffeine after 2 PM',
            '• Get morning sunlight to regulate sleep cycle'
        ]
    },
    'travel': {
        condition: 'general',
        advice: [
            '🚗 **TRAVEL SAFETY TIPS**',
            '• Check weather forecast before long trips',
            '• Allow extra travel time in bad weather',
            '• Keep emergency kit in vehicle: water, snacks, blanket',
            '• Share travel plans with family or friends',
            '• Keep phone charged and bring charger',
            '• Check tire pressure and wiper blades',
            '• Carry physical map as backup',
            '• Monitor weather updates during journey',
            '• Know alternative routes',
            '• Stop if weather becomes too severe'
        ]
    },
    'elderly': {
        condition: 'special',
        advice: [
            '👴 **FOR ELDERLY FAMILY MEMBERS**',
            '• Check on elderly relatives daily during extreme weather',
            '• Ensure home has adequate heating or cooling',
            '• Help with grocery shopping in bad weather',
            '• Keep medications easily accessible',
            '• Have emergency contacts visible by phone',
            '• Install grab bars in bathroom for safety',
            '• Ensure adequate lighting throughout home',
            '• Remove tripping hazards like loose rugs',
            '• Keep pathways clear of ice and snow',
            '• Consider medical alert system'
        ]
    },
    'children': {
        condition: 'special',
        advice: [
            '👶 **FOR CHILDREN**',
            '• Dress children in layers for changing weather',
            '• Ensure they drink water regularly',
            '• Limit outdoor play in extreme temperatures',
            '• Apply and reapply sunscreen on sunny days',
            '• Teach basic weather safety rules',
            '• Keep children hydrated during play',
            '• Watch for signs of overheating or chilling',
            '• Provide healthy snacks for energy',
            '• Ensure adequate sleep for growing bodies',
            '• Model good weather safety habits'
        ]
    },
    'pollen': {
        condition: 'pollen',
        advice: [
            '🌸 **POLLEN SEASON TIPS**',
            '• Check daily pollen counts',
            '• Keep windows closed during high pollen days',
            '• Shower and change clothes after coming indoors',
            '• Wear sunglasses to protect eyes',
            '• Use saline rinse for nasal passages',
            '• Keep car windows up while driving',
            '• Dry laundry indoors to avoid pollen',
            '• Vacuum and dust home frequently',
            '• Consider air purifier with HEPA filter',
            '• Limit outdoor activities in early morning'
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addPopularCitiesChips();
    displaySearchHistory();
    loadLastSearch();
    initVoiceRecognition();
    initMap();
});

// Initialize voice recognition
function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            voiceStatus.textContent = 'Listening...';
            voiceStatus.style.color = '#27ae60';
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            voiceStatus.textContent = `"${transcript}"`;
            cityInput.value = transcript;
            searchByCity();
        };
        
        recognition.onerror = (event) => {
            voiceStatus.textContent = 'Error: ' + event.error;
            voiceStatus.style.color = '#e74c3c';
            setTimeout(() => {
                voiceStatus.textContent = 'Click mic to search';
                voiceStatus.style.color = '';
            }, 3000);
        };
        
        recognition.onend = () => {
            setTimeout(() => {
                voiceStatus.textContent = 'Click mic to search';
                voiceStatus.style.color = '';
            }, 2000);
        };
        
        voiceSearchBtn.addEventListener('click', () => {
            recognition.start();
        });
    } else {
        voiceSearchBtn.style.display = 'none';
        voiceStatus.textContent = 'Voice search not supported';
    }
}

// Initialize map with proper error handling
function initMap() {
    if (typeof L !== 'undefined') {
        try {
            // Create map with default view (will be updated when we have coordinates)
            map = L.map('map-container', {
                zoomControl: true,
                zoomAnimation: true,
                fadeAnimation: true,
                markerZoomAnimation: true
            });
            
            // Add zoom control to top-right corner
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            
            // Add scale bar
            L.control.scale({
                imperial: false,
                metric: true,
                position: 'bottomleft'
            }).addTo(map);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
                minZoom: 2
            }).addTo(map);
            
            // Don't set view yet - wait for weather data
            weatherMapSection.classList.add('hidden');
            
            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Map initialization error:', error);
        }
    } else {
        console.log('Leaflet not loaded');
    }
}

// Update map location with better error handling
function updateMapLocation(lat, lon, cityName) {
    if (!map) {
        console.log('Map not initialized yet');
        return;
    }
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lon) || lat === undefined || lon === undefined || lat === null || lon === null) {
        console.log('Invalid coordinates received:', lat, lon);
        weatherMapSection.classList.add('hidden');
        return;
    }
    
    weatherMapSection.classList.remove('hidden');
    
    try {
        // Smoothly animate to new location
        map.flyTo([lat, lon], 12, {
            animate: true,
            duration: 1.5
        });
        
        if (mapMarker) {
            map.removeLayer(mapMarker);
        }
        
        // Custom marker with popup
        mapMarker = L.marker([lat, lon], {
            title: cityName,
            riseOnHover: true
        }).addTo(map)
            .bindPopup(`
                <b>${cityName}</b><br>
                Current Weather Location<br>
                <small>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</small>
            `)
            .openPopup();
            
        console.log('Map updated successfully for:', cityName);
    } catch (error) {
        console.error('Error updating map:', error);
        weatherMapSection.classList.add('hidden');
    }
}

// Get enhanced skin care tips based on weather
function getSkinCareTips(weatherData) {
    if (!weatherData) return skinCareTips.general;
    
    const condition = weatherData.weather[0].description.toLowerCase();
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    
    let tips = [...skinCareTips.general];
    
    // Add morning routine tips
    tips.push(...skinCareTips.morning.slice(0, 4));
    
    // Add night routine tips
    tips.push(...skinCareTips.night.slice(0, 4));
    
    // Weather-specific tips
    if (condition.includes('clear') || condition.includes('sun')) {
        tips.push(...skinCareTips.sunny);
    } else if (condition.includes('cloud')) {
        tips.push(...skinCareTips.cloudy);
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        tips.push(...skinCareTips.rainy);
    }
    
    // Humidity-based tips
    if (humidity > 70) {
        tips.push(...skinCareTips.humid);
    } else if (humidity < 35) {
        tips.push(...skinCareTips.dry);
    }
    
    // Temperature-based tips
    if (temp > 30) {
        tips.push(...skinCareTips.hot);
    } else if (temp < 10) {
        tips.push(...skinCareTips.cold);
    }
    
    // Wind-based tips
    if (windSpeed > 20) {
        tips.push(...skinCareTips.windy);
    }
    
    // Remove duplicates while preserving order
    const uniqueTips = [];
    const seen = new Set();
    
    tips.forEach(tip => {
        if (!seen.has(tip)) {
            seen.add(tip);
            uniqueTips.push(tip);
        }
    });
    
    return uniqueTips.slice(0, 18); // Limit to 18 tips max
}

// Get general health advice based on weather
function getHealthAdvice(weatherData, forecastData) {
    if (!weatherData) return [];
    
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const weatherCondition = weatherData.weather[0].description.toLowerCase();
    const advice = [];
    
    // Add weather-specific advice
    if (temp > 35) {
        advice.push(...healthAdvice.highTemperature.advice);
    } else if (temp < 5) {
        advice.push(...healthAdvice.lowTemperature.advice);
    }
    
    if (humidity > 80) {
        advice.push(...healthAdvice.highHumidity.advice);
    } else if (humidity < 30) {
        advice.push(...healthAdvice.lowHumidity.advice);
    }
    
    if (windSpeed > 30) {
        advice.push(...healthAdvice.windy.advice);
    }
    
    if (weatherCondition.includes('thunderstorm')) {
        advice.push(...healthAdvice.thunderstorm.advice);
    } else if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
        advice.push(...healthAdvice.rain.advice);
    } else if (weatherCondition.includes('fog') || weatherCondition.includes('mist') || weatherCondition.includes('haze')) {
        advice.push(...healthAdvice.fog.advice);
    }
    
    // Add skin care tips
    const skinTips = getSkinCareTips(weatherData);
    advice.push('🧴 **SKIN CARE TIPS**');
    advice.push(...skinTips.slice(0, 8)); // Add top 8 skin tips
    
    // Add general wellness advice
    const hour = new Date().getHours();
    
    advice.push(...healthAdvice.hydration.advice.slice(0, 4));
    advice.push(...healthAdvice.exercise.advice.slice(0, 3));
    advice.push(...healthAdvice.sleep.advice.slice(0, 3));
    
    // Add seasonal advice
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) { // Spring (March-May)
        advice.push(...healthAdvice.pollen.advice.slice(0, 4));
    }
    
    // Add special population advice
    advice.push(...healthAdvice.elderly.advice.slice(0, 3));
    advice.push(...healthAdvice.children.advice.slice(0, 3));
    
    // Remove duplicates
    const uniqueAdvice = [];
    const seen = new Set();
    
    advice.forEach(item => {
        if (!seen.has(item)) {
            seen.add(item);
            uniqueAdvice.push(item);
        }
    });
    
    displayHealthAdvice(uniqueAdvice.slice(0, 25)); // Limit to 25 items
    return uniqueAdvice;
}

// Display health advice
function displayHealthAdvice(advice) {
    if (advice.length === 0) {
        healthAdviceSection.classList.add('hidden');
        return;
    }
    
    healthAdviceSection.classList.remove('hidden');
    
    let html = '<div class="health-tips">';
    
    advice.forEach(item => {
        if (item.startsWith('•')) {
            html += `<div class="tip-item">${item}</div>`;
        } else {
            html += `<h4>${item}</h4>`;
        }
    });
    
    html += '</div>';
    healthAdviceContent.innerHTML = html;
}

// Get weather icon
const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// Format date
const formatDate = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Format hour
const formatHour = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
    });
};

// Format day
const formatDay = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'short'
    });
};

// Show loading
const showLoading = () => {
    loadingEl.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
    errorEl.classList.add('hidden');
};

// Hide loading
const hideLoading = () => {
    loadingEl.classList.add('hidden');
};

// Show error
const showError = (message) => {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
    hideLoading();
};

// Toggle unit
const toggleUnit = (unit) => {
    currentUnit = unit;
    celsiusBtn.classList.toggle('active', unit === 'metric');
    fahrenheitBtn.classList.toggle('active', unit === 'imperial');
    tempUnitEl.textContent = unit === 'metric' ? '°C' : '°F';
    
    if (currentWeatherData && forecastData) {
        updateWeatherDisplay();
        getHealthAdvice(currentWeatherData, forecastData);
    }
};

// Convert temperature
const convertTemp = (temp) => {
    if (currentUnit === 'imperial') {
        return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
};

// Convert wind speed
const convertWindSpeed = (speed) => {
    if (currentUnit === 'imperial') {
        return `${Math.round(speed * 2.237)} mph`;
    }
    return `${Math.round(speed * 3.6)} km/h`;
};

// Update favicon
const updateFavicon = (iconCode) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = `https://openweathermap.org/img/wn/${iconCode}.png`;
};

// Update background based on weather
const updateBackgroundByWeather = (weatherCondition, isDay) => {
    const condition = weatherCondition.toLowerCase();
    const body = document.body;
    
    let gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    if (condition.includes('thunderstorm') || condition.includes('storm')) {
        gradient = 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)';
        createRainEffect(50);
    } 
    else if (condition.includes('drizzle') || condition.includes('light rain')) {
        gradient = 'linear-gradient(135deg, #616161 0%, #9bc5c3 100%)';
        createRainEffect(20);
    }
    else if (condition.includes('rain') || condition.includes('shower')) {
        gradient = 'linear-gradient(135deg, #4b79a1 0%, #283e51 100%)';
        createRainEffect(40);
    }
    else if (condition.includes('heavy rain') || condition.includes('very heavy')) {
        gradient = 'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)';
        createRainEffect(70);
    }
    else if (condition.includes('snow') || condition.includes('sleet')) {
        gradient = 'linear-gradient(135deg, #e6dada 0%, #274046 100%)';
        createSnowEffect();
    }
    else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
        gradient = 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)';
    }
    else if (condition.includes('clear') && isDay) {
        gradient = 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
    }
    else if (condition.includes('clear') && !isDay) {
        gradient = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        createStarEffect();
    }
    else if (condition.includes('clouds') || condition.includes('cloudy')) {
        if (isDay) {
            gradient = 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)';
        } else {
            gradient = 'linear-gradient(135deg, #304352 0%, #2c3e50 100%)';
        }
    }
    
    body.style.background = gradient;
    body.style.backgroundSize = 'cover';
    body.style.backgroundAttachment = 'fixed';
    body.style.transition = 'background 1s ease';
};

// Create rain effect
function createRainEffect(intensity) {
    removeWeatherEffects();
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain-effect';
    rainContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    
    const numDrops = intensity * 2;
    
    for (let i = 0; i < numDrops; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.cssText = `
            position: absolute;
            bottom: 100%;
            width: 2px;
            height: ${Math.random() * 30 + 20}px;
            background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.8));
            left: ${Math.random() * 100}%;
            animation: rain ${Math.random() * 0.5 + 0.3}s linear infinite;
            animation-delay: ${Math.random() * 2}s;
            opacity: ${Math.random() * 0.5 + 0.3};
        `;
        rainContainer.appendChild(drop);
    }
    
    document.body.appendChild(rainContainer);
}

// Create snow effect
function createSnowEffect() {
    removeWeatherEffects();
    
    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow-effect';
    snowContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snow-flake';
        flake.style.cssText = `
            position: absolute;
            top: -10px;
            width: ${Math.random() * 8 + 2}px;
            height: ${Math.random() * 8 + 2}px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            animation: snow ${Math.random() * 5 + 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            opacity: ${Math.random() * 0.7 + 0.3};
            filter: blur(${Math.random() * 2}px);
        `;
        snowContainer.appendChild(flake);
    }
    
    document.body.appendChild(snowContainer);
}

// Create star effect
function createStarEffect() {
    removeWeatherEffects();
    
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-effect';
    starsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: white;
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
            opacity: ${Math.random() * 0.7 + 0.3};
        `;
        starsContainer.appendChild(star);
    }
    
    document.body.appendChild(starsContainer);
}

// Remove all weather effects
function removeWeatherEffects() {
    const effects = document.querySelectorAll('.rain-effect, .snow-effect, .stars-effect');
    effects.forEach(effect => effect.remove());
}

// Check for state name
const checkForStateName = (input) => {
    const normalizedInput = input.toLowerCase().trim();
    
    for (const [state, capital] of Object.entries(stateToCapitalMap)) {
        if (normalizedInput.includes(state) || state.includes(normalizedInput)) {
            return {
                isState: true,
                suggestion: capital
            };
        }
    }
    
    if (normalizedInput === 'india' || normalizedInput === 'in') {
        return {
            isState: true,
            suggestion: 'New Delhi'
        };
    }
    
    return { isState: false };
};

// Add popular cities chips
const addPopularCitiesChips = () => {
    if (!popularCitiesContainer) return;
    
    popularCitiesContainer.innerHTML = popularCities.map(city => 
        `<button class="city-chip" data-city="${city}">${city.replace(',IN', '')}</button>`
    ).join('');
    
    document.querySelectorAll('.city-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            cityInput.value = chip.dataset.city;
            searchByCity();
        });
    });
};

// Fetch weather data
async function fetchWeatherData(query) {
    showLoading();
    
    try {
        let cityName = '';
        let url;
        
        if (query.includes('q=')) {
            cityName = decodeURIComponent(query.replace('q=', '').trim());
            
            const stateCheck = checkForStateName(cityName);
            if (stateCheck.isState) {
                showError(`"${cityName}" is a state. Did you mean the city "${stateCheck.suggestion}"?`);
                hideLoading();
                return;
            }
            
            url = `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
        } else {
            url = `${BASE_URL}/weather?${query}&appid=${API_KEY}&units=metric`;
        }
        
        const currentResponse = await fetch(url);
        const responseData = await currentResponse.json();
        
        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error(`City "${cityName}" not found.`);
            } else if (currentResponse.status === 401) {
                throw new Error('Invalid API key.');
            } else {
                throw new Error(responseData.message || 'City not found');
            }
        }
        
        currentWeatherData = responseData;
        
        // Add to search history
        addToHistory(currentWeatherData.name, currentWeatherData.sys.country);
        
        // Fetch forecast
        let forecastUrl;
        if (query.includes('q=')) {
            forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
        } else {
            forecastUrl = `${BASE_URL}/forecast?${query}&appid=${API_KEY}&units=metric`;
        }
        
        const forecastResponse = await fetch(forecastUrl);
        
        if (forecastResponse.ok) {
            forecastData = await forecastResponse.json();
        }
        
        // Check if it's day or night
        const isDay = currentWeatherData.weather[0].icon.includes('d');
        
        // Update background based on weather
        updateBackgroundByWeather(currentWeatherData.weather[0].description, isDay);
        
        // Check weather alerts
        checkWeatherAlerts(currentWeatherData, forecastData);
        
        // Get general health advice with enhanced skin tips
        getHealthAdvice(currentWeatherData, forecastData);
        
        // Update map with smooth zoom (only if coordinates are valid)
        if (currentWeatherData.coord && 
            !isNaN(currentWeatherData.coord.lat) && 
            !isNaN(currentWeatherData.coord.lon)) {
            updateMapLocation(
                currentWeatherData.coord.lat,
                currentWeatherData.coord.lon,
                currentWeatherData.name
            );
        } else {
            console.log('No valid coordinates available');
            weatherMapSection.classList.add('hidden');
        }
        
        updateWeatherDisplay();
        hideLoading();
        errorEl.classList.add('hidden');
        weatherDisplay.classList.remove('hidden');
        
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

// Update weather display
const updateWeatherDisplay = () => {
    if (!currentWeatherData) return;
    
    cityNameEl.textContent = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
    dateEl.textContent = formatDate(currentWeatherData.dt, currentWeatherData.timezone);
    
    temperatureEl.textContent = convertTemp(currentWeatherData.main.temp);
    weatherIconEl.src = getWeatherIcon(currentWeatherData.weather[0].icon);
    weatherIconEl.alt = currentWeatherData.weather[0].description;
    weatherDescEl.textContent = currentWeatherData.weather[0].description;
    
    feelsLikeEl.textContent = `${convertTemp(currentWeatherData.main.feels_like)}°`;
    humidityEl.textContent = `${currentWeatherData.main.humidity}%`;
    windSpeedEl.textContent = convertWindSpeed(currentWeatherData.wind.speed);
    pressureEl.textContent = `${currentWeatherData.main.pressure} hPa`;
    
    updateFavicon(currentWeatherData.weather[0].icon);
    
    if (forecastData) {
        updateHourlyForecast();
        updateDailyForecast();
    }
};

// Update hourly forecast
const updateHourlyForecast = () => {
    if (!forecastData || !forecastData.list) return;
    
    const hourlyData = forecastData.list.slice(0, 8);
    
    hourlyContainer.innerHTML = hourlyData.map(item => `
        <div class="hourly-card">
            <div class="time">${formatHour(item.dt, forecastData.city.timezone)}</div>
            <img src="${getWeatherIcon(item.weather[0].icon)}" alt="${item.weather[0].description}">
            <div class="temp">${convertTemp(item.main.temp)}°</div>
            ${item.pop ? `<div class="pop">${Math.round(item.pop * 100)}%</div>` : ''}
        </div>
    `).join('');
};

// Update daily forecast (7 days)
const updateDailyForecast = () => {
    if (!forecastData || !forecastData.list) return;
    
    const dailyData = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weather: item.weather[0],
                dt: item.dt,
                pop: []
            };
        }
        dailyData[date].temps.push(item.main.temp);
        if (item.pop) dailyData[date].pop.push(item.pop);
    });
    
    const nextDays = Object.values(dailyData).slice(0, 7);
    
    if (nextDays.length === 0) {
        dailyContainer.innerHTML = '<p class="no-data">No forecast data available</p>';
        return;
    }
    
    dailyContainer.innerHTML = nextDays.map(day => {
        const maxTemp = Math.max(...day.temps);
        const minTemp = Math.min(...day.temps);
        const maxPop = Math.max(...(day.pop.length ? day.pop : [0]));
        
        return `
            <div class="daily-card">
                <div class="day">${formatDay(day.dt, forecastData.city.timezone)}</div>
                <img src="${getWeatherIcon(day.weather.icon)}" alt="${day.weather.description}">
                <div class="temp-range">
                    <span class="max-temp">${convertTemp(maxTemp)}°</span>
                    <span class="min-temp">${convertTemp(minTemp)}°</span>
                </div>
                ${maxPop > 0 ? `<div class="pop"><i class="fas fa-umbrella"></i> ${Math.round(maxPop * 100)}%</div>` : ''}
            </div>
        `;
    }).join('');
};

// Search by city
const searchByCity = () => {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    const cleanCity = city.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
    fetchWeatherData(`q=${cleanCity}`);
};

// Search by coordinates
const searchByCoords = (lat, lon) => {
    fetchWeatherData(`lat=${lat}&lon=${lon}`);
};

// Get user location
const getUserLocation = () => {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            searchByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            let errorMessage = 'Unable to get your location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'Please search manually.';
            }
            showError(errorMessage);
        }
    );
};

// Event Listeners
searchBtn.addEventListener('click', searchByCity);
locationBtn.addEventListener('click', getUserLocation);
celsiusBtn.addEventListener('click', () => toggleUnit('metric'));
fahrenheitBtn.addEventListener('click', () => toggleUnit('imperial'));

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByCity();
    }
});

// ============================================
// SEARCH HISTORY FUNCTIONS
// ============================================

function addToHistory(cityName, country) {
    const searchItem = {
        name: `${cityName},${country}`,
        displayName: `${cityName}, ${country}`,
        timestamp: Date.now()
    };
    
    const existingIndex = searchHistory.findIndex(item => item.name === searchItem.name);
    if (existingIndex !== -1) {
        searchHistory.splice(existingIndex, 1);
    }
    
    searchHistory.unshift(searchItem);
    
    if (searchHistory.length > 10) {
        searchHistory.pop();
    }
    
    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

function displaySearchHistory() {
    const historyContainer = document.getElementById('history-container');
    const clearBtn = document.getElementById('clear-history-btn');
    
    if (!historyContainer) return;
    
    if (searchHistory.length === 0) {
        historyContainer.innerHTML = '<p class="no-data">No recent searches</p>';
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
    }
    
    if (clearBtn) clearBtn.classList.remove('hidden');
    
    historyContainer.innerHTML = searchHistory.map(item => `
        <div class="history-item" data-city="${item.name}">
            <i class="fas fa-map-marker-alt"></i>
            <span>${item.displayName}</span>
            <i class="fas fa-times remove-history" data-city="${item.name}" title="Remove"></i>
        </div>
    `).join('');
    
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-history')) {
                const city = item.dataset.city;
                document.getElementById('city-input').value = city;
                searchByCity();
            }
        });
    });
    
    document.querySelectorAll('.remove-history').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const city = btn.dataset.city;
            removeFromHistory(city);
        });
    });
}

function removeFromHistory(cityName) {
    searchHistory = searchHistory.filter(item => item.name !== cityName);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

if (document.getElementById('clear-history-btn')) {
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        searchHistory = [];
        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    });
}

function loadLastSearch() {
    if (searchHistory.length > 0) {
        const lastSearch = searchHistory[0];
        cityInput.value = lastSearch.name;
        searchByCity();
    }
}

// ============================================
// RAIN ALERTS FUNCTIONS
// ============================================

function checkWeatherAlerts(weatherData, forecastData) {
    const alerts = [];
    
    if (!weatherData) return alerts;
    
    const currentCondition = weatherData.weather[0].description.toLowerCase();
    
    for (const [key, alert] of Object.entries(weatherAlerts)) {
        if (currentCondition.includes(key)) {
            alerts.push({
                ...alert,
                time: 'Now',
                description: weatherData.weather[0].description
            });
            break;
        }
    }
    
    if (forecastData && forecastData.list) {
        const next24Hours = forecastData.list.slice(0, 8);
        
        next24Hours.forEach((item) => {
            const condition = item.weather[0].description.toLowerCase();
            const rainChance = item.pop ? item.pop * 100 : 0;
            
            for (const [key, alert] of Object.entries(weatherAlerts)) {
                if (condition.includes(key)) {
                    const date = new Date(item.dt * 1000);
                    const hours = date.getHours();
                    const timeString = hours === 0 ? 'Midnight' : 
                                      hours === 12 ? 'Noon' : 
                                      hours < 12 ? `${hours} AM` : `${hours-12} PM`;
                    
                    const exists = alerts.some(a => 
                        a.time === timeString && a.title === alert.title
                    );
                    
                    if (!exists) {
                        alerts.push({
                            ...alert,
                            time: timeString,
                            description: condition,
                            message: rainChance > 50 ? 
                                `${alert.message} (${Math.round(rainChance)}% chance)` : 
                                alert.message
                        });
                    }
                    break;
                }
            }
            
            if (rainChance > 70 && !condition.includes('rain')) {
                const date = new Date(item.dt * 1000);
                const hours = date.getHours();
                const timeString = hours === 0 ? 'Midnight' : 
                                  hours === 12 ? 'Noon' : 
                                  hours < 12 ? `${hours} AM` : `${hours-12} PM`;
                
                alerts.push({
                    level: 'warning',
                    icon: '☔',
                    title: 'High Rain Chance',
                    message: `${Math.round(rainChance)}% chance of rain. Carry umbrella.`,
                    time: timeString,
                    description: condition
                });
            }
        });
    }
    
    const uniqueAlerts = [];
    const seen = new Set();
    
    alerts.forEach(alert => {
        const key = `${alert.time}-${alert.title}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueAlerts.push(alert);
        }
    });
    
    displayAlerts(uniqueAlerts.slice(0, 8));
    return uniqueAlerts;
}

function displayAlerts(alerts) {
    const alertsSection = document.getElementById('alerts-section');
    const alertsContainer = document.getElementById('alerts-container');
    
    if (!alertsSection || !alertsContainer) return;
    
    if (alerts.length === 0) {
        alertsSection.classList.add('hidden');
        return;
    }
    
    alertsSection.classList.remove('hidden');
    
    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-card ${alert.level}">
            <div class="alert-header">
                <span style="font-size: 24px;">${alert.icon}</span>
                <h4>${alert.title}</h4>
            </div>
            <div class="alert-description">
                ${alert.message}
            </div>
            <div class="alert-time">
                <i class="far fa-clock"></i> ${alert.time}
            </div>
        </div>
    `).join('');
}

// Input suggestions
cityInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    if (value === 'karnataka' || value === 'karnatak') {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-tooltip';
        suggestion.innerHTML = '💡 Did you mean <strong>Bangalore</strong>?';
        
        const oldSuggestion = document.querySelector('.suggestion-tooltip');
        if (oldSuggestion) oldSuggestion.remove();
        
        cityInput.parentNode.appendChild(suggestion);
        
        suggestion.addEventListener('click', () => {
            cityInput.value = 'Bangalore';
            suggestion.remove();
            searchByCity();
        });
        
        setTimeout(() => {
            if (suggestion.parentNode) suggestion.remove();
        }, 5000);
    }
});

// Add keyframe animations for weather effects
const style = document.createElement('style');
style.textContent = `
    @keyframes rain {
        0% { transform: translateY(-100vh); }
        100% { transform: translateY(100vh); }
    }
    
    @keyframes snow {
        0% { transform: translateY(-10px) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(360deg); }
    }
    
    @keyframes twinkle {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 1; }
    }
    
    .rain-effect, .snow-effect, .stars-effect {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    }
    
    body {
        transition: background 1s ease;
        position: relative;
    }
    
    .container {
        position: relative;
        z-index: 10;
    }
    
    /* Voice search button */
    .voice-search-btn {
        background: #9b59b6;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-left: 10px;
    }
    
    .voice-search-btn:hover {
        background: #8e44ad;
        transform: translateY(-2px);
    }
    
    .voice-search-btn i {
        font-size: 1.2rem;
    }
    
    #voice-status {
        margin-left: 10px;
        font-size: 14px;
        color: #666;
    }
    
    /* Health advice section */
    .health-advice-section {
        margin-top: 30px;
        padding: 20px;
        background: var(--card-bg);
        border-radius: 15px;
        backdrop-filter: blur(10px);
    }
    
    .health-advice-section h3 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 1.3rem;
    }
    
    .health-advice-section h3 i {
        color: #27ae60;
        margin-right: 10px;
    }
    
    #health-advice-content {
        background: rgba(255, 255, 255, 0.3);
        padding: 15px;
        border-radius: 10px;
        max-height: 500px;
        overflow-y: auto;
    }
    
    .health-tips {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .tip-item {
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.5;
        border-left: 3px solid #27ae60;
    }
    
    .health-tips h4 {
        color: #27ae60;
        margin: 10px 0 5px 0;
        font-size: 1.1rem;
    }
    
    /* Weather map section */
    .weather-map-section {
        margin-top: 30px;
        padding: 20px;
        background: var(--card-bg);
        border-radius: 15px;
        backdrop-filter: blur(10px);
    }
    
    .weather-map-section h3 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 1.3rem;
    }
    
    .weather-map-section h3 i {
        color: #e74c3c;
        margin-right: 10px;
    }
    
    #map-container {
        height: 450px;
        width: 100%;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    /* Custom map controls styling */
    .leaflet-control-zoom {
        border: none !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
    }
    
    .leaflet-control-zoom a {
        background: white !important;
        color: #333 !important;
        border: none !important;
        width: 36px !important;
        height: 36px !important;
        line-height: 36px !important;
        font-size: 18px !important;
        font-weight: bold !important;
        transition: all 0.2s ease !important;
    }
    
    .leaflet-control-zoom a:hover {
        background: #f0f0f0 !important;
        color: #000 !important;
    }
    
    .leaflet-control-scale {
        background: rgba(255, 255, 255, 0.8) !important;
        border-radius: 4px !important;
        padding: 4px !important;
        margin-left: 10px !important;
        margin-bottom: 10px !important;
        font-size: 12px !important;
        font-weight: bold !important;
    }
    
    .leaflet-popup-content {
        font-size: 14px !important;
        line-height: 1.4 !important;
        color: #333 !important;
    }
    
    .leaflet-popup-content b {
        color: #e74c3c !important;
    }
    
    /* Voice search container */
    .voice-search-container {
        display: flex;
        align-items: center;
        margin-top: 10px;
        width: 100%;
    }
    
    /* Popular cities section */
    .popular-cities-section {
        margin-top: 20px;
        text-align: center;
        color: white;
    }
    
    .popular-cities-section p {
        margin-bottom: 10px;
        font-size: 14px;
        opacity: 0.9;
    }
    
    .city-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        margin-top: 10px;
    }
    
    .city-chip {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .city-chip:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
        border-color: white;
    }
    
    /* Suggestion tooltip */
    .suggestion-tooltip {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        color: #333;
        padding: 10px 15px;
        border-radius: 8px;
        margin-top: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        animation: slideDown 0.3s ease;
        z-index: 100;
        font-size: 14px;
    }
    
    .suggestion-tooltip:hover {
        background: #f0f0f0;
    }
    
    .suggestion-tooltip strong {
        color: var(--primary-color);
    }
    
    .search-box {
        position: relative;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @media (max-width: 768px) {
        #map-container {
            height: 350px;
        }
        
        .voice-search-container {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
        
        .voice-search-btn {
            width: 100%;
            margin-left: 0;
        }
    }
`;
document.head.appendChild(style);