let allServices = [];

function populateServices() {
    const cat = document.getElementById('category').value;
    const serviceSelect = document.getElementById('service');
    serviceSelect.innerHTML = '<option value="">Select a service</option>';

    // ✅ Clear service info if category changes
    document.getElementById('serviceInfo').style.display = 'none';
    document.getElementById('charge').textContent = '0.0000';

    if (!cat || !servicesByCategory[cat]) return;

    allServices = servicesByCategory[cat];
   allServices.forEach(service => {
    const opt = document.createElement('option');
    opt.value = service.service_id || service.id;
    opt.textContent = `${service.name} - $${parseFloat(service.my_price).toFixed(2)}/1k`;

    opt.setAttribute('data-rate', service.my_price);
    opt.setAttribute('data-min', service.min);
    opt.setAttribute('data-max', service.max);

    // 🔧 improved avg time fallback
let avgTime = service.average_time;
if (!avgTime || avgTime === '0' || avgTime.toLowerCase() === 'n/a' || avgTime.trim() === '') {
    avgTime = '3–4 hours';
}
opt.setAttribute('data-avgtime', avgTime);


    serviceSelect.appendChild(opt);
});


    filterServiceOptions();
}

function updateCharge() {
    const serviceSelect = document.getElementById('service');
    const quantity = parseInt(document.getElementById('quantity').value || 0);
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];

    const rate = parseFloat(selectedOption?.getAttribute('data-rate') || 0);
    const charge = (rate / 1000) * quantity;
    document.getElementById('charge').textContent = charge.toFixed(4); // ✅ always 4 decimals

    if (selectedOption && selectedOption.value) {
        document.getElementById('minQty').textContent = selectedOption.getAttribute('data-min');
        document.getElementById('maxQty').textContent = selectedOption.getAttribute('data-max');
        document.getElementById('avgTime').textContent = selectedOption.getAttribute('data-avgtime');
        document.getElementById('serviceInfo').style.display = 'block';
    } else {
        document.getElementById('serviceInfo').style.display = 'none';
    }
}

function filterByPlatform(platform) {
    document.getElementById('searchInput').value = platform;
    filterAll();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    const catSelect = document.getElementById('category');
    Array.from(catSelect.options).forEach(opt => opt.style.display = '');
    document.getElementById('service').innerHTML = '<option value="">Select a service</option>';
    catSelect.selectedIndex = 0;

    // ✅ Reset service info too
    document.getElementById('serviceInfo').style.display = 'none';
    document.getElementById('charge').textContent = '0.0000';
}

function filterAll() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const catSelect = document.getElementById('category');

    Array.from(catSelect.options).forEach(opt => {
        if (!opt.value) return;
        opt.style.display = opt.textContent.toLowerCase().includes(query) ? '' : 'none';
    });

    populateServices();
    filterServiceOptions();
}

function filterServiceOptions() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const serviceSelect = document.getElementById('service');

    Array.from(serviceSelect.options).forEach(opt => {
        if (!opt.value) return;
        opt.style.display = opt.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
}
