// Structured Data for Local Business
document.addEventListener('DOMContentLoaded', function() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "סיון אלטרוביץ - מאמנת רגשית בשיטת סאטיה",
        "description": "אימון וטיפול בגישת סאטיה לשחרור ממיינד ורגשות מעכבים ויצירת חיים מלאים ומשמעותיים, אהבה וריפוי",
        "url": "https://www.sivanaltar.com",
        "telephone": "+972-54-5999671",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Ramat Hasharon",
            "addressRegion": "Tel Aviv District",
            "addressCountry": "IL",
            "postalCode": "4720000"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 32.1313669,
            "longitude": 34.8600712
        },
        "areaServed": {
            "@type": "City",
            "name": "Ramat Hasharon"
        },
        "serviceArea": {
            "@type": "GeoCircle",
            "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": 32.1313669,
                "longitude": 34.8600712
            },
            "geoRadius": "50000"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "שירותי אימון וטיפול",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "אימון אישי בשיטת סאטיה",
                        "description": "אימון אישי לשחרור ממיינד ורגשות מעכבים"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "טיפול רגשי",
                        "description": "טיפול רגשי בגישת סאטיה"
                    }
                }
            ]
        },
        "image": "https://www.sivanaltar.com/images/logo.jpeg",
        "sameAs": [
            "https://www.sivanaltar.com"
        ]
    };

    // Create script element and add structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);
});