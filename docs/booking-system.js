/* ============================================
   PALACE GROOMING ROOM - BOOKING SYSTEM
   Client-side booking with localStorage
   ============================================ */

// Business configuration
const BUSINESS_CONFIG = {
    name: "Palace Grooming Room",
    phone: "+44 20 8881 4419",
    email: "info@palacegroomingroom.com",
    address: "7 Crescent Road, Wood Green, London, N22 7RP",

    // Opening hours (24-hour format)
    hours: {
        monday: { open: "10:00", close: "19:00", closed: true },
        tuesday: { open: "10:00", close: "19:00", closed: false },
        wednesday: { open: "10:00", close: "19:00", closed: false },
        thursday: { open: "10:00", close: "19:00", closed: false },
        friday: { open: "10:00", close: "19:00", closed: false },
        saturday: { open: "10:00", close: "19:00", closed: false },
        sunday: { open: "10:00", close: "17:00", closed: false }
    },

    // Services with prices
    services: [
        { id: "haircut", name: "Haircut", price: 25, duration: 30 },
        { id: "skin-fade", name: "Skin Fade", price: 25, duration: 30 },
        { id: "haircut-beard", name: "Haircut & Beard", price: 35, duration: 45 },
        { id: "beard-trim", name: "Beard Trim & Shape Up", price: 15, duration: 20 },
        { id: "vip", name: "VIP Experience", price: 45, duration: 75 },
        { id: "facial", name: "Facial", price: 40, duration: 45 },
        { id: "massage", name: "Head & Neck Massage", price: 35, duration: 30 },
        { id: "eyebrows", name: "Eyebrows Shaping", price: 10, duration: 10 },
        { id: "facial-waxing", name: "Facial Waxing", price: 5, duration: 10 }
    ],

    // Barbers
    barbers: [
        { id: "any", name: "Any Available Barber", image: null },
        { id: "barber-1", name: "Barber 1", image: null },
        { id: "barber-2", name: "Barber 2", image: null }
    ],

    // Slot interval in minutes
    slotInterval: 15,

    // How many days ahead can book
    maxBookingDays: 30
};

// Booking System Class
class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.bookingData = {
            service: null,
            barber: null,
            date: null,
            time: null,
            name: "",
            email: "",
            phone: ""
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadServices();
        this.loadBarbers();
        this.setupDatePicker();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.service-option')) {
                this.selectService(e.target.closest('.service-option'));
            }
            if (e.target.closest('.barber-option')) {
                this.selectBarber(e.target.closest('.barber-option'));
            }
            if (e.target.closest('.time-slot')) {
                this.selectTime(e.target.closest('.time-slot'));
            }
        });

        const nextBtn = document.getElementById('nextStepBtn');
        const prevBtn = document.getElementById('prevStepBtn');
        const submitBtn = document.getElementById('submitBookingBtn');

        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitBooking());

        const datePicker = document.getElementById('booking-date');
        if (datePicker) {
            datePicker.addEventListener('change', (e) => this.selectDate(e.target.value));
        }

        ['name', 'email', 'phone'].forEach(field => {
            const input = document.getElementById(`booking-${field}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.bookingData[field] = e.target.value;
                    this.validateStep();
                });
            }
        });
    }

    loadServices() {
        const container = document.getElementById('services-container');
        if (!container) return;

        container.innerHTML = BUSINESS_CONFIG.services.map(service => `
            <div class="service-option" data-service-id="${service.id}">
                <div class="service-option-content">
                    <h4>${service.name}</h4>
                    <p class="service-price">£${service.price}</p>
                    <p class="service-duration">${service.duration} mins</p>
                </div>
                <div class="service-option-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>
            </div>
        `).join('');
    }

    loadBarbers() {
        const container = document.getElementById('barbers-container');
        if (!container) return;

        container.innerHTML = BUSINESS_CONFIG.barbers.map(barber => `
            <div class="barber-option" data-barber-id="${barber.id}">
                <div class="barber-option-image">
                    ${barber.image ? `<img src="${barber.image}" alt="${barber.name}">` : '<div class="barber-placeholder">?</div>'}
                </div>
                <h4>${barber.name}</h4>
                <div class="barber-option-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>
            </div>
        `).join('');
    }

    setupDatePicker() {
        const datePicker = document.getElementById('booking-date');
        if (!datePicker) return;

        const today = new Date();
        datePicker.min = today.toISOString().split('T')[0];

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + BUSINESS_CONFIG.maxBookingDays);
        datePicker.max = maxDate.toISOString().split('T')[0];
    }

    selectService(element) {
        document.querySelectorAll('.service-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        const serviceId = element.dataset.serviceId;
        this.bookingData.service = BUSINESS_CONFIG.services.find(s => s.id === serviceId);
        this.validateStep();
    }

    selectBarber(element) {
        document.querySelectorAll('.barber-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        const barberId = element.dataset.barberId;
        this.bookingData.barber = BUSINESS_CONFIG.barbers.find(b => b.id === barberId);
        this.validateStep();
    }

    selectDate(dateString) {
        this.bookingData.date = dateString;
        this.loadTimeSlots(dateString);
        this.validateStep();
    }

    selectTime(element) {
        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        this.bookingData.time = element.dataset.time;
        this.validateStep();
    }

    loadTimeSlots(dateString) {
        const container = document.getElementById('time-slots-container');
        if (!container) return;

        const date = new Date(dateString + 'T00:00:00');
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const hours = BUSINESS_CONFIG.hours[dayName];

        if (hours.closed) {
            container.innerHTML = '<p class="no-slots">Closed on this day</p>';
            return;
        }

        const slots = this.generateTimeSlots(hours.open, hours.close, dateString);

        if (slots.length === 0) {
            container.innerHTML = '<p class="no-slots">No available slots for this date</p>';
            return;
        }

        container.innerHTML = slots.map(slot => `
            <button class="time-slot ${slot.available ? '' : 'disabled'}"
                    data-time="${slot.time}"
                    ${!slot.available ? 'disabled' : ''}>
                ${slot.time}
            </button>
        `).join('');
    }

    generateTimeSlots(openTime, closeTime, dateString) {
        const slots = [];
        const [openHour, openMin] = openTime.split(':').map(Number);
        const [closeHour, closeMin] = closeTime.split(':').map(Number);

        let currentHour = openHour;
        let currentMin = openMin;

        while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
            const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
            const available = this.isSlotAvailable(dateString, timeString);

            slots.push({ time: timeString, available });

            currentMin += BUSINESS_CONFIG.slotInterval;
            if (currentMin >= 60) {
                currentMin = 0;
                currentHour++;
            }
        }

        return slots;
    }

    isSlotAvailable(date, time) {
        const now = new Date();
        const slotDateTime = new Date(`${date}T${time}:00`);

        if (slotDateTime < now) {
            return false;
        }

        const bookings = this.getExistingBookings();
        const isBooked = bookings.some(booking =>
            booking.date === date &&
            booking.time === time &&
            booking.barber.id === this.bookingData.barber?.id
        );

        return !isBooked;
    }

    getExistingBookings() {
        try {
            return JSON.parse(localStorage.getItem('palaceGrooming_bookings') || '[]');
        } catch (e) {
            return [];
        }
    }

    validateStep() {
        const nextBtn = document.getElementById('nextStepBtn');
        if (!nextBtn) return;

        let isValid = false;

        switch(this.currentStep) {
            case 1:
                isValid = this.bookingData.service !== null;
                break;
            case 2:
                isValid = this.bookingData.barber !== null;
                break;
            case 3:
                isValid = this.bookingData.date !== null && this.bookingData.time !== null;
                break;
            case 4:
                isValid = this.bookingData.name &&
                         this.bookingData.email &&
                         this.bookingData.phone &&
                         this.validateEmail(this.bookingData.email) &&
                         this.validatePhone(this.bookingData.phone);
                break;
        }

        nextBtn.disabled = !isValid;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePhone(phone) {
        return /^[\d\s\+\-\(\)]{10,}$/.test(phone);
    }

    nextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateStepDisplay();

            if (this.currentStep === 4) {
                this.updateSummary();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.remove('active');
        });

        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index < this.currentStep) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
            if (index === this.currentStep - 1) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const submitBtn = document.getElementById('submitBookingBtn');

        if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        if (nextBtn) nextBtn.style.display = this.currentStep === 4 ? 'none' : 'inline-flex';
        if (submitBtn) submitBtn.style.display = this.currentStep === 4 ? 'inline-flex' : 'none';

        this.validateStep();
    }

    updateSummary() {
        document.getElementById('summary-service').textContent = this.bookingData.service.name;
        document.getElementById('summary-price').textContent = `£${this.bookingData.service.price}`;
        document.getElementById('summary-barber').textContent = this.bookingData.barber.name;
        document.getElementById('summary-date').textContent = new Date(this.bookingData.date + 'T00:00:00').toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('summary-time').textContent = this.bookingData.time;
    }

    submitBooking() {
        const reference = this.generateBookingReference();

        const booking = {
            reference,
            ...this.bookingData,
            createdAt: new Date().toISOString(),
            status: 'confirmed',
            paymentStatus: 'pending'
        };

        try {
            if (typeof firebase !== 'undefined' && firebase.database) {
                firebase.database().ref('bookings').push(booking).then(() => {
                    console.log('Booking saved to Firebase');
                }).catch(() => {
                    const bookings = this.getExistingBookings();
                    bookings.push(booking);
                    localStorage.setItem('palaceGrooming_bookings', JSON.stringify(bookings));
                });
            } else {
                const bookings = this.getExistingBookings();
                bookings.push(booking);
                localStorage.setItem('palaceGrooming_bookings', JSON.stringify(bookings));
            }
        } catch(e) {
            const bookings = this.getExistingBookings();
            bookings.push(booking);
            localStorage.setItem('palaceGrooming_bookings', JSON.stringify(bookings));
        }

        this.showSuccess(booking);
    }

    generateBookingReference() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        return `PGR-${timestamp}-${random}`.toUpperCase();
    }

    showSuccess(booking) {
        const modal = document.getElementById('bookingModal');
        const successScreen = document.getElementById('booking-success');
        const bookingForm = document.getElementById('booking-form');

        if (bookingForm) bookingForm.style.display = 'none';
        if (successScreen) {
            successScreen.style.display = 'block';
            successScreen.innerHTML = `
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <h2>Booking Confirmed!</h2>
                <div class="booking-reference">
                    <p>Reference Number</p>
                    <h3>${booking.reference}</h3>
                </div>
                <div class="booking-details-summary">
                    <div class="detail-row">
                        <span>Service:</span>
                        <strong>${booking.service.name}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Barber:</span>
                        <strong>${booking.barber.name}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Date:</span>
                        <strong>${new Date(booking.date + 'T00:00:00').toLocaleDateString('en-GB')}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Time:</span>
                        <strong>${booking.time}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Price:</span>
                        <strong>£${booking.service.price}</strong>
                    </div>
                </div>
                <div class="payment-notice">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <p><strong>Payment will be taken via card on arrival.</strong></p>
                    <p>Please arrive 5 minutes early.</p>
                </div>
                <div class="success-actions">
                    <button onclick="bookingSystem.addToCalendar(${JSON.stringify(booking).replace(/"/g, '&quot;')})" class="btn-secondary">
                        Add to Calendar
                    </button>
                    <button onclick="bookingSystem.closeModal()" class="btn-primary">
                        Done
                    </button>
                </div>
            `;
        }
    }

    addToCalendar(booking) {
        const startDate = new Date(`${booking.date}T${booking.time}:00`);
        const endDate = new Date(startDate.getTime() + booking.service.duration * 60000);

        const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${this.formatICSDate(startDate)}
DTEND:${this.formatICSDate(endDate)}
SUMMARY:${BUSINESS_CONFIG.name} - ${booking.service.name}
DESCRIPTION:Booking Reference: ${booking.reference}\\nBarber: ${booking.barber.name}\\nPrice: £${booking.service.price}\\n\\nPayment via card on arrival.
LOCATION:${BUSINESS_CONFIG.address}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palace-grooming-${booking.reference}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatICSDate(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    closeModal() {
        const modal = document.getElementById('bookingModal');
        if (modal) modal.classList.remove('active');

        setTimeout(() => {
            this.currentStep = 1;
            this.bookingData = {
                service: null,
                barber: null,
                date: null,
                time: null,
                name: "",
                email: "",
                phone: ""
            };

            const bookingForm = document.getElementById('booking-form');
            const successScreen = document.getElementById('booking-success');

            if (bookingForm) bookingForm.style.display = 'block';
            if (successScreen) successScreen.style.display = 'none';

            this.updateStepDisplay();

            document.querySelectorAll('.service-option, .barber-option, .time-slot').forEach(el => {
                el.classList.remove('selected');
            });

            document.getElementById('booking-name').value = '';
            document.getElementById('booking-email').value = '';
            document.getElementById('booking-phone').value = '';
            document.getElementById('booking-date').value = '';
            document.getElementById('time-slots-container').innerHTML = '';
        }, 300);
    }
}

// Initialize booking system when DOM is loaded
let bookingSystem;
document.addEventListener('DOMContentLoaded', () => {
    bookingSystem = new BookingSystem();
});

window.bookingSystem = bookingSystem;
