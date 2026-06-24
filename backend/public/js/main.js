// Uttarakhand Real Estate Platform - Main JavaScript

// Format price in Indian number format
function formatPrice(amount) {
    if (!amount) return 'N/A';
    if (amount >= 10000000) {
        return '₹ ' + (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
        return '₹ ' + (amount / 100000).toFixed(2) + ' L';
    } else if (amount >= 1000) {
        return '₹ ' + (amount / 1000).toFixed(1) + 'K';
    }
    return '₹ ' + amount;
}

// Load districts in navbar dropdown
document.addEventListener('DOMContentLoaded', function() {
    const districtDropdown = document.getElementById('districtDropdown');
    if (districtDropdown) {
        fetch('/api/locations/districts')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    data.data.forEach(district => {
                        const item = document.createElement('li');
                        item.innerHTML = `<a class="dropdown-item" href="/properties?district_id=${district.id}">
                            <i class="bi bi-geo-alt"></i> ${district.district_name}
                        </a>`;
                        districtDropdown.appendChild(item);
                    });
                }
            })
            .catch(err => console.error('Error loading districts:', err));
    }
});

// Auto-dismiss flash messages
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const closeBtn = alert.querySelector('.btn-close');
            if (closeBtn) closeBtn.click();
        }, 5000);
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Image lazy loading
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
});

// Confirm delete actions
document.querySelectorAll('[data-confirm]').forEach(element => {
    element.addEventListener('click', function(e) {
        if (!confirm(this.dataset.confirm || 'Are you sure?')) {
            e.preventDefault();
        }
    });
});

console.log('🏔️ Uttarakhand Real Estate Platform loaded successfully');