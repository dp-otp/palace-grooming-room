/* ============================================
   PALACE KNOWLEDGE BASE — Prince AI Concierge
   ============================================ */

const PalaceKnowledge = {

    business: {
        name: 'Palace Grooming Room',
        tagline: 'Where Precision Meets Prestige',
        address: '7 Crescent Road, Wood Green, London, N22 7RP',
        phone: '020 8881 4419',
        phoneTel: '+442088814419',
        email: 'info@palacegroomingroom.com',
        instagram: '@palacegroomingroom',
        instagramUrl: 'https://www.instagram.com/palacegroomingroom/',
        freshaUrl: 'https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK',
        hours: {
            monday: 'Closed',
            tuesday: '10:00 \u2013 19:00',
            wednesday: '10:00 \u2013 19:00',
            thursday: '10:00 \u2013 19:00',
            friday: '10:00 \u2013 19:00',
            saturday: '10:00 \u2013 19:00',
            sunday: '10:00 \u2013 17:00'
        }
    },

    services: [
        { name: 'Haircut', price: 25, duration: '30 min' },
        { name: 'Skin Fade', price: 25, duration: '30 min' },
        { name: 'Haircut & Beard', price: 35, duration: '45 min' },
        { name: 'Beard Trim & Shape Up', price: 15, duration: '20 min' },
        { name: 'VIP Experience', price: 45, duration: '75 min', description: 'Haircut, beard, threading, waxing, facial & massage' },
        { name: 'Facial', price: 40, duration: '45 min' },
        { name: 'Head & Neck Massage', price: 35, duration: '30 min' },
        { name: 'Eyebrows Shaping', price: 10, duration: '10 min' },
        { name: 'Facial Waxing', price: 5, duration: '10 min' }
    ],

    categories: {

        greeting: {
            patterns: [
                /^(hi|hello|hey|hiya|yo|sup|good\s*(morning|afternoon|evening|day)|howdy|what'?s\s*up|greetings)/i
            ],
            responses: [
                "Hi there! I'm <strong>Prince</strong>, your virtual assistant at Palace Grooming Room. How can I help you today? Whether it's booking, pricing, or finding us \u2014 I'm here to help.",
                "Hello! I'm <strong>Prince</strong>, your virtual assistant at Palace Grooming Room. I can help with services, pricing, directions, or getting you booked in. What would you like to know?",
                "Hi! I'm <strong>Prince</strong>, your virtual assistant at Palace Grooming Room. Ask me anything about our services, prices, opening hours, or booking. What can I do for you?"
            ]
        },

        farewell: {
            patterns: [
                /^(bye|goodbye|see\s*ya|later|thanks|thank\s*you|cheers|ta|that'?s\s*all|that'?s\s*it)/i
            ],
            responses: [
                "Thanks for chatting! We hope to see you at Palace Grooming Room soon. Have a great day.",
                "Thank you for visiting! If you need anything else, I'm always here. See you at Palace Grooming Room!",
                "You're welcome — thanks for chatting! See you soon."
            ]
        },

        services: {
            patterns: [
                /\b(service|menu|offer|what\s*(do\s*you|can\s*you)\s*(do|offer)|treatment|list|what'?s\s*available)\b/i,
                /\b(what\s*(services|treatments))\b/i
            ],
            responses: [
                "Here's a full look at our grooming services:<br><br>\u2022 <strong>Haircut</strong> \u2014 \u00a325 (30 min)<br>\u2022 <strong>Skin Fade</strong> \u2014 \u00a325 (30 min)<br>\u2022 <strong>Haircut & Beard</strong> \u2014 \u00a335 (45 min)<br>\u2022 <strong>Beard Trim & Shape Up</strong> \u2014 \u00a315 (20 min)<br>\u2022 <strong>VIP Experience</strong> \u2014 \u00a345 (75 min)<br>\u2022 <strong>Facial</strong> \u2014 \u00a340 (45 min)<br>\u2022 <strong>Head & Neck Massage</strong> \u2014 \u00a335 (30 min)<br>\u2022 <strong>Eyebrows Shaping</strong> \u2014 \u00a310 (10 min)<br>\u2022 <strong>Facial Waxing</strong> \u2014 \u00a35 (10 min)<br><br>For full details, <a href='services.html'>view our services page</a>.",
                "Here's what we offer at Palace Grooming Room:<br><br><strong>Cuts:</strong> Haircut (\u00a325), Skin Fade (\u00a325), Haircut & Beard (\u00a335)<br><strong>Grooming:</strong> Beard Trim (\u00a315), Eyebrows (\u00a310), Facial Waxing (\u00a35)<br><strong>Wellness:</strong> Facial (\u00a340), Head & Neck Massage (\u00a335)<br><strong>Premium:</strong> VIP Experience (\u00a345)<br><br>Explore everything on our <a href='services.html'>services page</a>."
            ]
        },

        pricing: {
            patterns: [
                /\b(price|cost|how\s*much|rate|charge|fee|afford|cheap|expensive|pound|\u00a3)\b/i
            ],
            responses: [
                "Here's our pricing:<br><br>\u2022 Haircut \u2014 <strong>\u00a325</strong><br>\u2022 Skin Fade \u2014 <strong>\u00a325</strong><br>\u2022 Haircut & Beard \u2014 <strong>\u00a335</strong><br>\u2022 Beard Trim & Shape Up \u2014 <strong>\u00a315</strong><br>\u2022 VIP Experience \u2014 <strong>\u00a345</strong><br>\u2022 Facial \u2014 <strong>\u00a340</strong><br>\u2022 Head & Neck Massage \u2014 <strong>\u00a335</strong><br>\u2022 Eyebrows Shaping \u2014 <strong>\u00a310</strong><br>\u2022 Facial Waxing \u2014 <strong>\u00a35</strong><br><br>All prices are fixed \u2014 no hidden fees. Straightforward and transparent. <a href='services.html'>Book now</a>.",
                "Our services range from <strong>\u00a35</strong> (facial waxing) to <strong>\u00a345</strong> (the full VIP Experience). A standard haircut or skin fade is <strong>\u00a325</strong>. For the complete list, check our <a href='services.html'>services page</a>."
            ]
        },

        booking: {
            patterns: [
                /\b(book|appointment|reserve|schedule|sign\s*up|slot|fresha|available|availability)\b/i
            ],
            responses: [
                "Great! You can book your appointment through <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>Fresha</a> \u2014 it's quick and easy. Alternatively, give us a call at <a href='tel:+442088814419'>020 8881 4419</a> and we'll get you sorted.",
                "Ready to book? You can do it online via <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>Fresha</a> or ring us on <a href='tel:+442088814419'>020 8881 4419</a>. You can also visit our <a href='services.html'>services page</a> for more details.",
                "I'd be delighted to help you get booked in. Use <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>Fresha</a> for instant online booking, or call <a href='tel:+442088814419'>020 8881 4419</a>. We look forward to seeing you!"
            ]
        },

        hours: {
            patterns: [
                /\b(hour|open|close|time|when|schedule|monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|weekend)\b/i
            ],
            responses: [
                "Our opening hours are:<br><br>\u2022 <strong>Monday:</strong> Closed<br>\u2022 <strong>Tuesday \u2013 Saturday:</strong> 10:00 \u2013 19:00<br>\u2022 <strong>Sunday:</strong> 10:00 \u2013 17:00<br><br>We recommend booking in advance to secure your preferred time. <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>Book on Fresha</a>.",
                "We're open <strong>Tuesday to Saturday, 10am \u2013 7pm</strong> and <strong>Sunday, 10am \u2013 5pm</strong>. We're closed on Mondays. Pop by or <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>book ahead on Fresha</a> to guarantee your slot."
            ]
        },

        location: {
            patterns: [
                /\b(where|location|address|direction|find\s*you|map|how\s*to\s*get|near|postcode|n22|wood\s*green|alexandra|bounds\s*green)\b/i
            ],
            responses: [
                "You'll find us at <strong>7 Crescent Road, Wood Green, London, N22 7RP</strong>. We're just a short walk from <strong>Alexandra Palace station</strong> (0.25 miles) and <strong>Bounds Green tube</strong> (0.60 miles). Right in the heart of Wood Green! <a href='contact.html'>See our contact page for a map</a>.",
                "We're located at <strong>7 Crescent Road, Wood Green, N22 7RP</strong> \u2014 in the Borough of Haringey. Nearest stations are Alexandra Palace (5 min walk) and Bounds Green tube. Visit our <a href='contact.html'>contact page</a> for directions."
            ]
        },

        contact: {
            patterns: [
                /\b(contact|phone|call|email|reach|get\s*in\s*touch|number|ring|instagram|social)\b/i
            ],
            responses: [
                "Here's how to reach us:<br><br>\u2022 <strong>Phone:</strong> <a href='tel:+442088814419'>020 8881 4419</a><br>\u2022 <strong>Email:</strong> <a href='mailto:info@palacegroomingroom.com'>info@palacegroomingroom.com</a><br>\u2022 <strong>Instagram:</strong> <a href='https://www.instagram.com/palacegroomingroom/' target='_blank'>@palacegroomingroom</a><br><br>You can also visit our <a href='contact.html'>contact page</a> for more details.",
                "You can call us on <a href='tel:+442088814419'>020 8881 4419</a>, email <a href='mailto:info@palacegroomingroom.com'>info@palacegroomingroom.com</a>, or follow us on <a href='https://www.instagram.com/palacegroomingroom/' target='_blank'>Instagram @palacegroomingroom</a>. We'd love to hear from you!"
            ]
        },

        payment: {
            patterns: [
                /\b(pay|payment|card|cash|apple\s*pay|google\s*pay|contactless|method|accept)\b/i
            ],
            responses: [
                "We accept a variety of payment methods for your convenience:<br><br>\u2022 <strong>Card</strong> (debit & credit)<br>\u2022 <strong>Apple Pay</strong><br>\u2022 <strong>Google Pay</strong><br>\u2022 <strong>Cash</strong><br><br>Whatever suits you best \u2014 we've got it covered.",
                "We keep it easy \u2014 we accept <strong>card, Apple Pay, Google Pay, and cash</strong>. Pay however you prefer!"
            ]
        },

        vip: {
            patterns: [
                /\b(vip|premium|luxury|royal|package|full\s*treatment|special|signature|ultimate)\b/i
            ],
            responses: [
                "The <strong>VIP Experience</strong> is our premium service \u2014 everything in one session for <strong>\u00a345</strong> (75 minutes). It includes:<br><br>\u2022 Precision haircut<br>\u2022 Beard grooming<br>\u2022 Threading & waxing<br>\u2022 Rejuvenating facial<br>\u2022 Relaxing massage<br><br>It's the most complete grooming experience we offer. <a href='services.html'>Book your VIP session</a>.",
                "Our <strong>VIP Experience (\u00a345, 75 min)</strong> is our most comprehensive service. You get a haircut, beard styling, threading, waxing, a facial, and a massage \u2014 all in one session. <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>Book now on Fresha</a>."
            ]
        },

        walkin: {
            patterns: [
                /\b(walk[\s-]?in|no\s*appointment|without\s*booking|just\s*come|drop\s*in|turn\s*up|queue)\b/i
            ],
            responses: [
                "Walk-ins are welcome, though we recommend booking in advance to avoid waiting \u2014 especially on weekends. You can <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>book instantly on Fresha</a> or call <a href='tel:+442088814419'>020 8881 4419</a>.",
                "You're welcome to walk in, but to guarantee your spot we'd suggest booking ahead via <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>Fresha</a>. It only takes a moment and saves you the wait!"
            ]
        },

        haircut: {
            patterns: [
                /\b(haircut|hair\s*cut|cut\s*my\s*hair|trim|fade|skin\s*fade|taper|clipper)\b/i
            ],
            responses: [
                "We offer expert cuts:<br><br>\u2022 <strong>Haircut</strong> \u2014 \u00a325 (30 min)<br>\u2022 <strong>Skin Fade</strong> \u2014 \u00a325 (30 min)<br>\u2022 <strong>Haircut & Beard</strong> \u2014 \u00a335 (45 min)<br><br>Our barbers deliver precision every time. <a href='services.html'>View all services</a> or <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>book now</a>.",
                "Looking for a fresh cut? A standard <strong>haircut is \u00a325</strong> (30 min), a <strong>skin fade is \u00a325</strong> (30 min), or get the <strong>haircut & beard combo for \u00a335</strong> (45 min). <a href='services.html'>See our full menu</a>."
            ]
        },

        beard: {
            patterns: [
                /\b(beard|facial\s*hair|shape[\s-]?up|goatee|stubble|moustache|mustache)\b/i
            ],
            responses: [
                "For beard grooming, we offer:<br><br>\u2022 <strong>Beard Trim & Shape Up</strong> \u2014 \u00a315 (20 min)<br>\u2022 <strong>Haircut & Beard</strong> \u2014 \u00a335 (45 min)<br><br>Expert sculpting for a sharp, clean finish. <a href='services.html'>Book your session</a>.",
                "A <strong>beard trim & shape up is just \u00a315</strong> (20 min), or pair it with a haircut for <strong>\u00a335</strong> (45 min). Our barbers will have you looking sharp. <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>Book on Fresha</a>."
            ]
        },

        facial: {
            patterns: [
                /\b(facial|skin\s*care|skincare|cleanse|rejuvenat|complexion|face\s*treatment)\b/i
            ],
            responses: [
                "Our <strong>Facial</strong> is <strong>\u00a340</strong> (45 min) \u2014 a deep cleanse and skin rejuvenation. It's also included in the <strong>VIP Experience (\u00a345)</strong> alongside a haircut, beard trim, threading, waxing, and massage. <a href='services.html'>Learn more</a>.",
                "Treat your skin to our <strong>\u00a340 Facial</strong> (45 min) for a thorough cleanse and refresh. Want the complete package? The <strong>VIP Experience (\u00a345)</strong> includes a facial plus five other services. <a href='services.html'>See details</a>."
            ]
        },

        massage: {
            patterns: [
                /\b(massage|relax|head\s*(and|&)\s*neck|tension|stress|unwind)\b/i
            ],
            responses: [
                "Our <strong>Head & Neck Massage</strong> is <strong>\u00a335</strong> (30 min) \u2014 the perfect way to unwind. It's also included in the <strong>VIP Experience (\u00a345)</strong> if you'd like a full session. <a href='services.html'>Book your session</a>.",
                "Need to release some tension? Our <strong>Head & Neck Massage (\u00a335, 30 min)</strong> is just the thing. <a href='https://www.fresha.com/lvp/palace-grooming-room-crescent-road-YKjNVK' target='_blank'>Book now</a>."
            ]
        },

        eyebrows: {
            patterns: [
                /\b(eyebrow|brow|threading|wax|waxing)\b/i
            ],
            responses: [
                "We offer:<br><br>\u2022 <strong>Eyebrows Shaping</strong> \u2014 \u00a310 (10 min)<br>\u2022 <strong>Facial Waxing</strong> \u2014 \u00a35 (10 min)<br><br>Quick, precise, and affordable. Both are also included in the <strong>VIP Experience (\u00a345)</strong>. <a href='services.html'>View services</a>.",
                "<strong>Eyebrows shaping is \u00a310</strong> (10 min) and <strong>facial waxing is just \u00a35</strong> (10 min). Sharp brows make all the difference! <a href='services.html'>See our full menu</a>."
            ]
        },

        fallback: {
            patterns: [],
            responses: [
                "I appreciate the question, but I'm not quite sure I follow. I can help with our <strong>services</strong>, <strong>pricing</strong>, <strong>booking</strong>, <strong>hours</strong>, <strong>location</strong>, or <strong>contact info</strong>. What would you like to know?",
                "That's a bit outside what I can help with. I'm best with questions about Palace Grooming Room's services, prices, booking, hours, and location. How can I help?",
                "I'm not sure about that one, but I can help with barbershop questions. Try asking about our <a href='services.html'>services</a>, pricing, <a href='contact.html'>how to reach us</a>, or booking an appointment."
            ]
        }
    },

    /**
     * Find the best matching category for user input
     * Returns a random response from that category
     */
    getResponse(input) {
        const trimmed = input.trim();
        if (!trimmed) return this.pickRandom(this.categories.fallback.responses);

        // Check each category (order matters — more specific before general)
        const checkOrder = [
            'greeting', 'farewell', 'vip', 'walkin',
            'booking', 'haircut', 'beard', 'facial', 'massage', 'eyebrows',
            'services', 'pricing', 'hours', 'location', 'contact', 'payment'
        ];

        for (const key of checkOrder) {
            const cat = this.categories[key];
            for (const pattern of cat.patterns) {
                if (pattern.test(trimmed)) {
                    return this.pickRandom(cat.responses);
                }
            }
        }

        return this.pickRandom(this.categories.fallback.responses);
    },

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
};
