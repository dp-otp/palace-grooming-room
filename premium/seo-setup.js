/* ============================================
   PALACE GROOMING ROOM - SEO & STRUCTURED DATA
   Local SEO optimization for Wood Green, North London
   ============================================ */

const BUSINESS_SEO = {
    name: "Palace Grooming Room",
    description: "Premium barbershop in Wood Green, North London. Expert fades, beard sculpting, facials, and the VIP grooming experience. Book your appointment today.",
    url: "https://palacegroomingroom.com/premium/",
    logo: "",
    image: "",

    address: {
        streetAddress: "7 Crescent Road",
        addressLocality: "Wood Green",
        addressRegion: "London",
        postalCode: "N22 7RP",
        addressCountry: "GB"
    },

    telephone: "+442088814419",
    email: "info@palacegroomingroom.com",

    geo: {
        latitude: "51.5991",
        longitude: "-0.1234"
    },

    openingHours: [
        "Tu-Sa 10:00-20:00",
        "Su 10:00-17:30"
    ],

    priceRange: "££",

    services: [
        "Haircut",
        "Skin Fade",
        "Haircut & Beard",
        "Beard Trim & Shape Up",
        "VIP Experience",
        "Facial",
        "Head & Neck Massage",
        "Eyebrows Shaping",
        "Facial Waxing"
    ],

    socialMedia: {
        instagram: "https://www.instagram.com/palacegroomingroom/",
        tiktok: "https://www.tiktok.com/@palacegroomingroom"
    }
};

function generateLocalBusinessSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "HairSalon",
        "name": BUSINESS_SEO.name,
        "description": BUSINESS_SEO.description,
        "image": BUSINESS_SEO.image,
        "logo": BUSINESS_SEO.logo,
        "url": BUSINESS_SEO.url,
        "telephone": BUSINESS_SEO.telephone,
        "email": BUSINESS_SEO.email,
        "priceRange": BUSINESS_SEO.priceRange,

        "address": {
            "@type": "PostalAddress",
            "streetAddress": BUSINESS_SEO.address.streetAddress,
            "addressLocality": BUSINESS_SEO.address.addressLocality,
            "addressRegion": BUSINESS_SEO.address.addressRegion,
            "postalCode": BUSINESS_SEO.address.postalCode,
            "addressCountry": BUSINESS_SEO.address.addressCountry
        },

        "geo": {
            "@type": "GeoCoordinates",
            "latitude": BUSINESS_SEO.geo.latitude,
            "longitude": BUSINESS_SEO.geo.longitude
        },

        "openingHoursSpecification": BUSINESS_SEO.openingHours.map(hours => ({
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": hours.split(' ')[0],
            "opens": hours.split(' ')[1].split('-')[0],
            "closes": hours.split(' ')[1].split('-')[1]
        })),

        "sameAs": Object.values(BUSINESS_SEO.socialMedia),

        "areaServed": [
            "Wood Green",
            "Alexandra Palace",
            "Bounds Green",
            "Turnpike Lane",
            "Haringey",
            "North London"
        ],

        "paymentAccepted": "Cash, Card, Apple Pay, Google Pay",
        "currenciesAccepted": "GBP"
    };
}

function generateServiceSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [
            {
                "@type": "Service",
                "name": "Haircut",
                "description": "Precision haircut by expert barbers",
                "provider": { "@type": "HairSalon", "name": BUSINESS_SEO.name },
                "areaServed": "Wood Green, North London",
                "offers": { "@type": "Offer", "price": "25.00", "priceCurrency": "GBP" }
            },
            {
                "@type": "Service",
                "name": "VIP Experience",
                "description": "Complete royal treatment — haircut, beard, threading, waxing, facial & massage",
                "provider": { "@type": "HairSalon", "name": BUSINESS_SEO.name },
                "areaServed": "Wood Green, North London",
                "offers": { "@type": "Offer", "price": "45.00", "priceCurrency": "GBP" }
            },
            {
                "@type": "Service",
                "name": "Haircut & Beard",
                "description": "Precision cut paired with expert beard sculpting",
                "provider": { "@type": "HairSalon", "name": BUSINESS_SEO.name },
                "areaServed": "Wood Green, North London",
                "offers": { "@type": "Offer", "price": "35.00", "priceCurrency": "GBP" }
            }
        ]
    };
}

function insertStructuredData() {
    const businessSchema = document.createElement('script');
    businessSchema.type = 'application/ld+json';
    businessSchema.textContent = JSON.stringify(generateLocalBusinessSchema());
    document.head.appendChild(businessSchema);

    const serviceSchema = document.createElement('script');
    serviceSchema.type = 'application/ld+json';
    serviceSchema.textContent = JSON.stringify(generateServiceSchema());
    document.head.appendChild(serviceSchema);
}

function addSEOMetaTags() {
    const metaTags = [
        { name: 'description', content: BUSINESS_SEO.description },
        { name: 'keywords', content: 'barber wood green, barbershop north london, skin fade N22, haircut alexandra palace, beard trim wood green, barber haringey, mens grooming north london' },

        { property: 'og:type', content: 'business.business' },
        { property: 'og:title', content: BUSINESS_SEO.name },
        { property: 'og:description', content: BUSINESS_SEO.description },
        { property: 'og:url', content: BUSINESS_SEO.url },
        { property: 'og:image', content: BUSINESS_SEO.image },
        { property: 'og:site_name', content: BUSINESS_SEO.name },
        { property: 'og:locale', content: 'en_GB' },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: BUSINESS_SEO.name },
        { name: 'twitter:description', content: BUSINESS_SEO.description },
        { name: 'twitter:image', content: BUSINESS_SEO.image },

        { name: 'theme-color', content: '#C9A84C' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },

        { name: 'geo.region', content: 'GB-LND' },
        { name: 'geo.placename', content: 'Wood Green, London' },
        { name: 'geo.position', content: `${BUSINESS_SEO.geo.latitude};${BUSINESS_SEO.geo.longitude}` },
        { name: 'ICBM', content: `${BUSINESS_SEO.geo.latitude}, ${BUSINESS_SEO.geo.longitude}` }
    ];

    metaTags.forEach(tag => {
        const meta = document.createElement('meta');

        if (tag.name) {
            meta.setAttribute('name', tag.name);
        } else if (tag.property) {
            meta.setAttribute('property', tag.property);
        }

        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
    });
}

function initSEO() {
    insertStructuredData();
    addSEOMetaTags();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEO);
} else {
    initSEO();
}
